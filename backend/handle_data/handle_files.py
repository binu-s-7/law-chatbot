from handle_data.data_audio import process_media
from handle_data.data_pdf import extract_pdf_text
from handle_data.data_txt import handle_txt
from handle_data.data_url import crawl_and_convert_to_text
from handle_data.insert_data import load_and_split_documents, add_documents_to_vector_store
from open_ai_key import supabase


def get_files(file_name):
    file_ext = file_name.split('.')[-1]
    with open("temp_file." + file_ext, 'wb') as f:
        res = supabase.storage.from_('files').download(file_name)
        f.write(res)

    try:
        # check file extension
        if file_ext in ['mp3', 'mp4']:
            data = process_media("temp_file." + file_ext)
            print(data)
            return data
        elif file_ext in ['txt']:
            data = handle_txt("temp_file." + file_ext)
            print(data)
            return data
        elif file_ext in ['url']:
            data = crawl_and_convert_to_text("temp_file." + file_ext)
            print(data)
            return data
        else:
            return "File type not supported"
    except Exception as e:
        print(e)
        return "Error processing file"


def get_one_file_info(fileid):
    fileinfo = supabase.table('files').select("*").eq('file_id', fileid).execute().data[0]
    print(fileinfo)
    extension = fileinfo['extension']
    print(extension)

    with open("temp_file." + fileinfo['extension'], 'wb') as f:
        res = supabase.storage.from_('files').download(fileinfo['file_name'])
        f.write(res)

    # if extension is media call process_media   audio_formats = ('.mp3', '.wav', '.aac', '.flac', '.ogg', '.wma', '.aiff', '.m4a') video_formats = ('.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm')
    if fileinfo['extension'] in ['mp3', 'wav', 'aac', 'flac', 'ogg', 'wma', 'aiff', 'm4a', 'mp4', 'mkv', 'avi', 'mov',
                                 'wmv', 'flv', 'webm']:
        data = process_media("temp_file." + fileinfo['extension'])
        # print(data)
        return data
    # if a txt file call handle_txt
    elif fileinfo['extension'] in ['txt']:
        data = handle_txt("temp_file." + fileinfo['extension'])
        # print(data)
        return data
    # if pdf call extract_pdf_text
    elif fileinfo['extension'] in ['pdf']:
        data = extract_pdf_text("temp_file." + extension)
        # print(data)
        return data

    return res


def get_file_info(file_list):
    data = ""
    if file_list is None:
        return data
    if len(file_list) == 0:
        return data
    for file in file_list:
        # get file info from supabase
        file_info = supabase.table('files').select("*").eq('file_id', file).execute().data[0]
        # check if extracted_data is null or not
        # add file_info to data with styling with filename
        data += "##################################################\n"
        data += file_info['file_name'] + "\n\n"

        if file_info['extracted_data'] is not None:
            data += file_info['extracted_data']
        else:
            file_extracted_data = get_one_file_info(file)
            # replace \\u0000 cannot be converted to text.' with ''
            file_extracted_data = file_extracted_data.replace('\x00', '')
            print(file_extracted_data)
            data += file_extracted_data
            # update extracted_data in supabase
            supabase.table('files').update({'extracted_data': file_extracted_data}).eq('file_id', file).execute()

        data += "##################################################\n"
    return data


def process_single_file(file_id, user_id, by_admin, data_type):
    print(file_id)
    print(file_id)
    print(file_id)
    # Get file information from supabase
    file_info = supabase.table('files').select("*").eq('file_id', file_id).execute().data[0]

    # Extract data if not already extracted
    file_extracted_data = get_one_file_info(file_id)
    # Clean the extracted data
    file_extracted_data = file_extracted_data.replace('\x00', '')

    # Save the cleaned data to a temporary file
    temp_file_path = "temp_file.txt"
    with open(temp_file_path, 'w', encoding='utf-8') as temp_file:
        temp_file.write(file_extracted_data)

    print("Updated extracted data")
    # Update the extracted_data in supabase
    supabase.table('files').update({'extracted_data': file_extracted_data}).eq('file_id', file_id).execute()

    # Load and split the data from the temporary file
    txt_data = load_and_split_documents(temp_file_path, user_id=user_id, by_admin=by_admin, data_type=data_type,
                                        file_id=file_id)

    # Add documents to vector store or other processing
    add_documents_to_vector_store(txt_data, "documents", "match_documents")

    return file_extracted_data