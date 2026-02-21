import os
import uuid

import requests
from bs4 import BeautifulSoup
import re
from PIL import Image


def fetch_page_content(url):
    """
    Fetches the HTML content of a web page.
    """
    response = requests.get(url)
    response.raise_for_status()  # Raises an HTTPError if the HTTP request returned an unsuccessful status code
    return response.text


def clean_html(html_content):
    """
    Removes HTML tags, scripts, and styles from the HTML content to extract text.
    """
    soup = BeautifulSoup(html_content, 'html.parser')

    # Remove script and style elements
    for script_or_style in soup(['script', 'style']):
        script_or_style.decompose()

    # Get text
    text = soup.get_text()

    # Break into lines and remove leading and trailing space on each
    lines = (line.strip() for line in text.splitlines())
    # Break multi-headlines into a line each
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    # Drop blank lines
    text = '\n'.join(chunk for chunk in chunks if chunk)

    return text


def crawl_and_convert_to_text(url):
    """
    Crawls a web page and converts it to clean text.
    """
    html_content = fetch_page_content(url)
    text = clean_html(html_content)
    return text


def crawl_and_get_images(url, save_path):
    """
    Crawls a web page and gets all the images.
    """
    # create a folder to save the images with the url name
    folder_path = save_path + "/" + re.sub(r"[^a-zA-Z0-9]", "_", url)
    os.makedirs(folder_path, exist_ok=True)

    image_urls = fetch_image_urls(url)

    for i, image_url in enumerate(image_urls):
        try:
            # img_path = folder_path + "/" + str(i) + ".png"
            img_path = folder_path + "/" + str(uuid.uuid4()) + ".png"
            download_image(image_url, img_path)
            print(f"Downloaded {image_url} to {img_path}")
        except Exception as e:
            print(f"Failed to download {image_url}: {e}")

    return image_urls, folder_path


from newspaper import Article


def extract_article_content(url):
    """
    Extracts the main article content from a given URL using Newspaper3k.
    """
    article = Article(url)
    article.download()
    article.parse()
    return article.text


from readability import Document


def extract_main_content(url):
    """
    Extracts the main article content from a webpage using readability-lxml.

    Parameters:
    - url: The URL of the webpage to extract content from.

    Returns:
    - A string containing the main, readable content of the webpage.
    """
    response = requests.get(url)
    response.raise_for_status()  # Ensure the request was successful

    doc = Document(response.text)
    readable_article = doc.summary()
    readable_title = doc.short_title()

    print(f"Title: {readable_title}\n\n\n")

    return readable_article


from bs4 import BeautifulSoup
import requests


def fetch_image_urls(url):
    """
    Fetches all image URLs from a web page.
    """
    html_content = requests.get(url).text
    soup = BeautifulSoup(html_content, 'html.parser')

    image_urls = []
    for img in soup.find_all('img'):
        src = img.get('src')
        if src:
            # Resolve relative URLs to absolute URLs
            image_url = requests.compat.urljoin(url, src)
            image_urls.append(image_url)

    return image_urls


def download_image(image_url, save_path):
    """
    Downloads an image from the given URL and saves it to the specified path.
    """
    # unique name for each image with uuid
    # save_filename = save_path + "/" + str(uuid.uuid4()) + ".png"
    response = requests.get(image_url, stream=True)
    if response.status_code == 200:
        with open(save_path, 'wb') as file:
            for chunk in response.iter_content(1024):
                file.write(chunk)

        # try to load the image to check if it's valid
        try:
            with Image.open(save_path) as img:
                img.verify()  # Verify the image integrity. This will throw an exception if the image is not valid.
            print(f"Downloaded and verified image {save_path}")
        except (IOError, SyntaxError) as e:
            print(f"Invalid image detected and removed: {save_path} - {e}")
            os.remove(save_path)

# # Example usage
# if __name__ == "__main__":
#     url = "https://blog.google/technology/developers/gemma-open-models/"
#     # url = "https://python.langchain.com/docs/integrations/platforms/anthropic"
#     text = crawl_and_convert_to_text(url)
#     print(text, end="\n\n\n")
#
#     # content = extract_article_content(url)
#     # print(content, end="\n\n\n")
#
#     # content = extract_main_content(url)
#     # print(content, end="\n\n\n")
#
#     # Read Image URLs
#     # image_urls, folder_path = crawl_and_get_images(url, "../temp_files")
