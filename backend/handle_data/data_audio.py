from openai import OpenAI
import os
import re

from pydub import AudioSegment
import os

from moviepy.editor import VideoFileClip
from pytube import YouTube

openai_api_key = os.environ.get("OPENAI_API_KEYS")
openai = OpenAI(api_key=openai_api_key)


def convert_speech_to_text(audio_file_path, translations=False):
    """
    Converts speech to text using OpenAI's Speech-to-Text API.

    Supported languages: While the API supports 98 languages, the following are languages that have 50% or more word
    error rate (WER) Afrikaans, Arabic, Armenian, Azerbaijani, Belarusian, Bosnian, Bulgarian, Catalan, Chinese,
    Croatian, Czech, Danish, Dutch, English, Estonian, Finnish, French, Galician, German, Greek, Hebrew, Hindi,
    Hungarian, Icelandic, Indonesian, Italian, Japanese, Kannada, Kazakh, Korean, Latvian, Lithuanian, Macedonian,
    Malay, Marathi, Maori, Nepali, Norwegian, Persian, Polish, Portuguese, Romanian, Russian, Serbian, Slovak,
    Slovenian, Spanish, Swahili, Swedish, Tagalog, Tamil, Thai, Turkish, Ukrainian, Urdu, Vietnamese, and Welsh.


    Parameters:
    - audio_file_path: The path to the audio file.
    - translations: Boolean flag to enable translations.

    Returns:
    - The converted text as a string.
    """
    if translations:
        with open(audio_file_path, "rb") as audio_file:
            audio_file = open(audio_file_path, "rb")
            transcript = openai.audio.translations.create(
                model="whisper-1",
                file=audio_file
            )
        return transcript.text
    else:
        with open(audio_file_path, "rb") as audio_file:
            audio_file = open(audio_file_path, "rb")
            transcript = openai.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        return transcript.text


def clean_text(text):
    """
    Cleans the text data by removing extra spaces, tabs, and newlines.

    Parameters:
    - text: The text to clean.

    Returns:
    - The cleaned text as a string.
    """
    # Remove extra spaces, tabs, and newlines
    cleaned_text = re.sub(r'\s+', ' ', text).strip()
    return cleaned_text


def process_audio(audio_file_path, translate=False, clean=True):
    """
    Processes an audio file to convert speech to text, optionally translates and cleans the text.

    Parameters:
    - audio_file_path: The path to the audio file.
    - translate: Boolean flag to translate the text.
    - clean: Boolean flag to clean the text.

    Returns:
    - The processed text.
    """
    try:
        text = convert_speech_to_text(audio_file_path, translations=translate)

        if clean:
            text = clean_text(text)

        return text
    except Exception as e:
        print(f"An error occurred: {e}")
        return ""


def ensure_directory_exists(directory):
    if not os.path.exists(directory):
        os.makedirs(directory)


def estimate_split_duration(file_path, target_size_mb=25):
    audio = AudioSegment.from_file(file_path)
    file_size_bytes = os.path.getsize(file_path)
    duration_ms = len(audio)
    target_size_bytes = target_size_mb * 1024 * 1024
    estimated_duration_per_chunk_ms = (duration_ms * target_size_bytes) / file_size_bytes
    return estimated_duration_per_chunk_ms


def split_audio_file(file_path, target_size_mb=25, temp_folder="temp_audio_chunks"):
    """
    Splits the audio file into chunks under the target size, saving them in a specified folder.
    """
    audio = AudioSegment.from_file(file_path)
    duration_ms = len(audio)
    file_name = os.path.splitext(os.path.basename(file_path))[0]
    chunk_folder = os.path.join(temp_folder, file_name)
    ensure_directory_exists(chunk_folder)

    # Estimate and adjust split duration to match the target size
    estimated_duration_per_chunk_ms = estimate_split_duration(file_path, target_size_mb)
    chunks = []
    start_ms = 0
    while start_ms < duration_ms:
        chunk = audio[start_ms:start_ms + estimated_duration_per_chunk_ms]
        chunk_path = os.path.join(chunk_folder, f"{file_name}_chunk_{start_ms // 1000}.mp3")
        chunk.export(chunk_path, format="mp3")

        if os.path.getsize(chunk_path) > target_size_mb * 1024 * 1024:
            # If chunk is oversized, remove it, reduce the duration, and retry
            os.remove(chunk_path)
            estimated_duration_per_chunk_ms /= 2
        else:
            chunks.append(chunk_path)
            start_ms += estimated_duration_per_chunk_ms

    return chunks


def transcribe_and_cleanup(chunks):
    """
    Transcribes each audio chunk to text and cleans up the chunks.
    """
    full_text = ""
    for chunk_path in chunks:
        # Transcribe the chunk
        chunk_text = convert_speech_to_text(chunk_path)  # Ensure this function is defined to transcribe the audio
        full_text += " " + chunk_text
        # Cleanup the chunk
        os.remove(chunk_path)

    return full_text.strip()


def process_large_audio_file(file_path, target_size_mb=25, temp_folder="temp_audio_chunks"):
    """
    Processes a large audio file, ensuring all chunks are transcribed and no residuals are left.
    """
    if os.path.getsize(file_path) > target_size_mb * 1024 * 1024:
        chunks = split_audio_file(file_path, target_size_mb, temp_folder)
        full_text = transcribe_and_cleanup(chunks)
    else:
        full_text = convert_speech_to_text(file_path)  # Direct transcription for files under the size limit

    # Optional: Cleanup the folder if empty
    chunk_folder = os.path.join(temp_folder, os.path.splitext(os.path.basename(file_path))[0])
    if os.path.exists(chunk_folder) and not os.listdir(chunk_folder):
        os.rmdir(chunk_folder)

    return full_text


def convert_video_to_audio(video_file_path, output_audio_path):
    """
    Extracts the audio from a video file and saves it as an MP3.

    Parameters:
    - video_file_path: The path to the video file.
    - output_audio_path: The path where the extracted audio will be saved as an MP3.
    """
    video = VideoFileClip(video_file_path)
    audio = video.audio
    audio.write_audiofile(output_audio_path)
    audio.close()
    video.close()
    print(f"Audio extracted and saved to {output_audio_path}")
    return output_audio_path


def download_youtube_video(url, save_path='.'):
    """
    Downloads a YouTube video to the specified path.

    Parameters:
    - url: The URL of the YouTube video.
    - save_path: The directory to save the downloaded video. Defaults to the current directory.
    """
    yt = YouTube(url)
    stream = yt.streams.get_highest_resolution()
    stream.download(output_path=save_path)
    print(f"Downloaded '{yt.title}' to {save_path}/")
    return os.path.join(save_path, f"{yt.title}.mp4")


def process_audio_file(audio_file_path):
    print("Processing audio file...")
    text = process_large_audio_file(audio_file_path)
    # Assume process_large_audio_file function handles the audio processing and returns text
    # os.remove(audio_file_path)
    return text


def process_video_file(video_file_path, temp_audio_path="../temp_files/temp_audio.mp3"):
    print("Processing video file...")
    convert_video_to_audio(video_file_path, temp_audio_path)  # Convert video to audio
    text = process_large_audio_file(temp_audio_path)  # Process the extracted audio
    # os.remove(temp_audio_path)
    return text


def process_youtube_url(youtube_url, download_path="../temp_files",
                        temp_audio_path="../temp_files/temp_youtube_audio.mp3"):
    print("Processing YouTube URL...")
    saved_video_path = download_youtube_video(youtube_url, save_path=download_path)  # Download video from YouTube
    convert_video_to_audio(saved_video_path, temp_audio_path)  # Convert downloaded video to audio
    text = process_large_audio_file(temp_audio_path)  # Process the extracted audio
    # os.remove(saved_video_path)  # Cleanup
    # os.remove(temp_audio_path)
    return text


import os
import re


def process_media(input_path_or_url):
    youtube_url_pattern = r"(http(s)?://)?(www\.)?(youtube\.com|youtu\.?be)/.+"

    # Updated lists of supported audio and video formats
    audio_formats = ('.mp3', '.wav', '.aac', '.flac', '.ogg', '.wma', '.aiff', '.m4a')
    video_formats = ('.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm')

    if re.match(youtube_url_pattern, input_path_or_url):
        # Input is a YouTube URL
        return process_youtube_url(input_path_or_url)
    elif input_path_or_url.lower().endswith(audio_formats):
        # Input is an audio file
        return process_audio_file(input_path_or_url)
    elif input_path_or_url.lower().endswith(video_formats):
        # Input is a video file
        return process_video_file(input_path_or_url)
    else:
        print("Unsupported media format or URL.")
        return None
