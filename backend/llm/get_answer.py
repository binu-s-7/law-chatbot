import json

from handle_data.handle_files import get_file_info
from open_ai_key import openai, supabase


def generate_answer_with_context(context: str, question: str, model: str = "text-davinci", temperature: float = 0.5,
                                 max_tokens: int = 150):
    completion = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": f"Question: {question}\n\nContext: {context}\n\nAnswer:"
            }
        ]
    )
    print(completion.choices[0].message)
    print("\n\nhey we are done\n\n")
    return completion.choices[0].message.content


def get_openai_generator(question: str, context: str = ""):
    openai_stream = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": f"Question: {question}\n\nContext: {context}\n\nAnswer:"
            }
        ],
        temperature=0.0,
        stream=True,
    )

    for chunk in openai_stream:
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="")


def get_llm_name(id: str):
    try:
        response = supabase.table('llm').select('name').eq('llm_id', id).execute()
        open_ai_llm_name = response.data[0]['name']
        print(open_ai_llm_name)
        if open_ai_llm_name:
            return open_ai_llm_name
        else:
            return "gpt-4-1106-preview"
    except Exception as e:
        return "gpt-4-1106-preview"


def get_openai_generator_working(question: str, model: str, context: str = "", files=None):
    print("inside get_openai_generator_working")
    model = get_llm_name(model)
    file_info = get_file_info(files)
    # context += file_info
    context += f"\n\nInformation from files\n{file_info}"
    openai_stream = openai.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": f"Question: {question}\n\nContext: {context}\n\nAnswer:"
            }
        ],
        temperature=0.0,
        stream=True,
    )
    for event in openai_stream:
        if event.choices[0].delta.content is not None:
            print(event.choices[0].delta.content, end="")
            # yield f"data: {json.dumps({'message': 'Your message here'})}\n\n"
            # yield "data: " + event.choices[0].delta.content + "\n\n"
            yield f"data: {json.dumps({'message': event.choices[0].delta.content})}\n\n"

    # for chunk in openai_stream:
    #     if chunk.choices[0].delta.content is not None:
    #         print(chunk.choices[0].delta.content, end="")


def sjkdsj():
    return "sjkdsj"


def get_openai_generator_working_no_stream(question: str, model: str, context: str = "", files=None):
    print("inside get_openai_generator_working no steam")
    model = get_llm_name(model)
    file_info = get_file_info(files)
    # context += file_info
    context += f"\n\nInformation from files\n{file_info}"
    openai_stream = openai.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": f"Question: {question}\n\nContext: {context}\n\nAnswer:"
            }
        ],
        temperature=0.0,
    )

    return openai_stream.choices[0].message.content


if __name__ == "__main__":
    # Question = "What are the advantages of Gemma?"
    # user_id = "89e9b16c-49c3-49a4-88bf-3ccdac429d4f"
    # chat_id = "89e9b16c-49c3-49a4-88bf-3ccdac429d4f"
    # files = "file_name"
    # context = get_context(user_id, chat_id, Question)
    # openai_generator = get_openai_generator_working(Question, context, files)
    # print(openai_generator)
    openai_stream = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": f"Question: What are the advantages of Gemma?\n\nContext: Gemma is a powerful AI tool that helps businesses automate their workflows and improve productivity. It offers a wide range of features, including natural language processing, document processing, and data extraction. Gemma can be integrated with various platforms and tools to streamline processes and enhance decision-making. It is designed to be user-friendly and scalable, making it suitable for businesses of all sizes. Gemma is a versatile solution that can be customized to meet the specific needs of different industries and use cases. It is constantly updated with new features and improvements to ensure optimal performance and user satisfaction.\n\nAnswer:"
            }
        ],
        temperature=0.0,
    )

    print(openai_stream.choices[0].message.content)
