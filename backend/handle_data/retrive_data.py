from handle_data.insert_data import perform_similarity_search
from open_ai_key import vector_store


def get_context(query):
    matched_docs = perform_similarity_search(vector_store, query)
    if matched_docs:
        context = matched_docs[0].page_content
        return context
    else:
        return ""
