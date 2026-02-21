from handle_data.insert_data import perform_similarity_search
from open_ai_key import vector_store


def get_context_from_supabase(user_id, query):
    matched_docs = perform_similarity_search(vector_store, query, user_id)
    if matched_docs:
        context = matched_docs[0].page_content
        return context
    else:
        print("No documents matched your query.")
        return ""


def get_context(user_id, chat_id, query):
    supabase_context = get_context_from_supabase(user_id, query)

    if supabase_context:
        return supabase_context
    else:
        return ""
