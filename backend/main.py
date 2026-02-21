from handle_data.insert_data import perform_similarity_search
from open_ai_key import openai, vector_store


def generate_answer_with_context(question: str):
    completion = openai.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": f"Question: {question}\n\n\nAnswer:"
            }
        ]
    )
    print(completion.choices[0].message)
    print("\n\nhey we are done\n\n")
    return completion.choices[0].message.content


if __name__ == "__main__":
    query = "What are advatages of gemma?"

    answer = generate_answer_with_context(query)
    print(answer)
