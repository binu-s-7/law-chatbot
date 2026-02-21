from dotenv import load_dotenv
import os
from langchain_community.vectorstores import SupabaseVectorStore
from langchain_openai import OpenAIEmbeddings
from supabase.client import Client, create_client
from langchain.text_splitter import CharacterTextSplitter
from langchain_community.document_loaders import TextLoader

from open_ai_key import vector_store

# Load environment variables
load_dotenv()


# Initialize Supabase client
supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

open_ai_api_key = os.environ.get("OPENAI_API_KEYS")
print(open_ai_api_key)
# Initialize OpenAI embeddings
embeddings = OpenAIEmbeddings(api_key=open_ai_api_key)


class Document:
    def __init__(self, page_content, metadata):
        self.page_content = page_content
        self.metadata = metadata


def load_and_split_documents(filename: str, chunk_size: int = 1200, chunk_overlap: int = 0, user_id: str = None,
                             by_admin=False, data_type="files", file_id=None):
    loader = TextLoader(filename, encoding="utf-8")
    documents = loader.load()

    print(documents[0].metadata)

    # add more metadata to documents
    new_metadata = {
        "user_id": user_id,
        "by_admin": by_admin,
        "data_type": data_type,
        "file_id": file_id
    }

    # Iterate over each document and update its metadata
    for document in documents:
        # Check if metadata exists, if not, initialize it as an empty dictionary
        if not hasattr(document, 'metadata'):
            document.metadata = {}
        # Update the metadata with new values, merging it with existing metadata
        document.metadata.update(new_metadata)

    print(documents[0])

    text_splitter = CharacterTextSplitter(chunk_size=chunk_size, chunk_overlap=chunk_overlap)
    split_docs = text_splitter.split_documents(documents)

    return split_docs


def add_documents_to_vector_store(split_docs, table_name: str, query_name: str, chunk_size: int = 500):
    vector_store_upload = SupabaseVectorStore.from_documents(
        split_docs,
        embeddings,
        client=supabase,
        table_name=table_name,
        query_name=query_name,
        chunk_size=chunk_size
    )
    return vector_store_upload


def perform_similarity_search(vector_store, query: str, user_id: str = None):
    matched_docs = vector_store.similarity_search(query, filter={"user_id": user_id})
    return matched_docs


def convert_and_add_data_to_supabase(text):
    # save in temp txt file
    with open("temp_files/temp_embedding.txt", "w", encoding="utf-8") as file:
        file.write(text)
    split_docs = load_and_split_documents("temp_files/temp_embedding.txt")

    # print(split_docs[0].page_content[:1000] + "...")
    # print(split_docs[0])
    add_documents_to_vector_store(split_docs, "documents", "match_documents")
    # vector_store.upload(client, table_name=table_name, query_name=query_name, metadata={"source": source})

# if __name__ == "__main__":
#     # get text from txt file
#     txt_data = load_and_split_documents("../temp_files/gemma.txt")
#     add_documents_to_vector_store(txt_data, embeddings, supabase, "documents", "match_documents")
