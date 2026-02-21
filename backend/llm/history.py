import tiktoken

from open_ai_key import supabase
from tools.summerizer import summarize_text

index_name = "talontech"


def num_tokens_from_string(string: str) -> int:
    """Returns the number of tokens in a text string."""
    # encoding = tiktoken.get_encoding(encoding_name)
    encoding = tiktoken.encoding_for_model("gpt-3.5-turbo")
    num_tokens = len(encoding.encode(string))
    return num_tokens


def summarize_text_batches(data):
    # Check if there are enough messages to require summarization
    if len(data) < 10:
        return None

    summaries = []
    batch_text = ""
    for message in data:
        message_text = message['text'] + " "  # Adding a space as a delimiter
        if num_tokens_from_string(batch_text + message_text) > 4000:
            # Summarize the current batch and start a new one
            summaries.append(summarize_text(batch_text))
            batch_text = message_text
        else:
            # Add the current message to the batch
            batch_text += message_text

    # Summarize the last batch if it has content
    if batch_text:
        summaries.append(summarize_text(batch_text))

    print(len(summaries))

    # Iteratively summarize batches of summaries until we have a single summary
    while len(summaries) > 1:
        print(len(summaries))
        new_summaries = []
        batch_text = ""
        for summary in summaries:
            # Check if the next summary can be added without exceeding token limit
            if num_tokens_from_string(batch_text + summary) > 4000:
                new_summaries.append(summarize_text(batch_text))
                batch_text = summary  # Start a new batch with the current summary
            else:
                batch_text += summary + " "

        # Ensure the last batch is summarized
        if batch_text:
            new_summaries.append(summarize_text(batch_text))

        summaries = new_summaries

    # At this point, summaries should have only one element
    return summaries[0] if summaries else None


def summerize_and_save_to_supabase(user_id, chat_id):
    # summerize messages if summerized == False > 16 rows
    # get data from supabase chat_message table where user_id = user_id and summerized = False
    data = (supabase.table('chat_message').select("*")
            .eq('user_id', user_id)
            .eq('summerized', False)
            .eq('chat_id', chat_id)
            .execute())

    print(data.data)

    # summerize the text
    summerized_text = summarize_text_batches(data.data)
    print(summerized_text)

    if summerized_text:
        # add the summerized text to supabase
        a = supabase.table('summerized').insert({"chat_id": chat_id, "text": summerized_text}).execute()
        summerized_id = a.data[0]['message_id']

        # update the chat_message table with summerized = True
        supabase.table('chat_message').update({"summerized": True, "summerized_id": summerized_id}).eq('user_id',
                                                                                                       user_id).eq(
            'chat_id', chat_id).execute()

    # # rename chat
    # supabase.table('chat_message').update({"summerized": False}).eq('user_id', user_id).execute()

    return summerized_text


def get_history_from_supabase(user_id, chat_id):
    summerized_text = summerize_and_save_to_supabase(user_id, chat_id)

    response_summeried = supabase.table('summerized').select("*").eq('user_id', user_id).eq('chat_id',
                                                                                            chat_id).execute()
    response = supabase.table('chat_message').select("*").eq('user_id', user_id).eq('chat_id', chat_id).eq('summerized',
                                                                                                           False).execute()

    # if these exist, comibne them
    if response_summeried and response:
        return response_summeried + response
    elif response_summeried:
        return response_summeried
    elif response:
        return response
    else:
        return None

# summerize_and_save_to_supabase("89e9b16c-49c3-49a4-88bf-3ccdac429d4f", "7e1a0e0e-cb5a-4aac-955a-e1f8c06cfc3a", "What is rag")
