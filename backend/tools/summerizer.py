from langchain.chains.summarize import load_summarize_chain
from langchain_community.document_loaders import TextLoader
from langchain_openai import ChatOpenAI

from open_ai_key import openai, supabase


def summarize_text(text, model="gpt-3.5-turbo-0613"):
    # save to text file
    with open("temp.txt", "w") as f:
        f.write(text)

    loader = TextLoader(file_path="temp.txt")
    docs = loader.load()

    llm = ChatOpenAI(temperature=0, model_name=model)
    chain = load_summarize_chain(llm, chain_type="stuff")

    summary = chain.run(docs)

    return summary
