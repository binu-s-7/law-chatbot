import os
from typing import Optional, List

# Load environment variables
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from supabase import create_client, Client

from handle_data.handle_files import get_file_info, process_single_file
from llm.context import get_context
from llm.get_answer import get_openai_generator_working_no_stream, sjkdsj
from tools.generate_legal_documents import get_info_need_fill_placeholder, find_entities_for_placeholders, finlize_doc

load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supa: Client = create_client(url, key)

app = FastAPI()

origins = [
    "http://localhost:3000",
    "http://localhost:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatModelSchema(BaseModel):
    message: str
    user_id: str
    chat_id: str
    model: str = "gpt-3.5-turbo-0613"
    files: Optional[List[int]] = []
    advanced_mode: Optional[bool] = True


@app.post("/chat_model")
async def chat_model(chat: ChatModelSchema):
    # question = "What are the advantages of gemma?"
    print("\n\n\n\n")
    print(chat.message)
    print("\n\n\n\n")

    # user_id = "b1e61edf-5154-4763-8776-c7692546b50a"
    # chat_id = "c46bb392-c14f-474b-93ad-51564a5458b4"

    print(chat.files)
    print("Generating answer...")
    # try:
    print(chat.message)
    context = get_context(chat.user_id, chat.chat_id, chat.message)
    print("context: ")
    print("\n\n\n\nAdvanced mode sdsdsdsd")
    sjkdsaj = sjkdsj()
    print(sjkdsaj)
    a = get_openai_generator_working_no_stream(chat.message, chat.model, context, chat.files)
    print(a)
    print("a")
    return {"answer": a}


class FileToContextSchema(BaseModel):
    file_id: int
    user_id: str
    by_admin: bool
    data_type: str


@app.post("/file_to_context")
async def file_to_context_api(file_to_context: FileToContextSchema):
    try:
        print(file_to_context.file_id)
        print(file_to_context.user_id)
        print(file_to_context.by_admin)
        print(file_to_context.data_type)

        process_single_file(file_to_context.file_id, file_to_context.user_id, file_to_context.by_admin,
                            file_to_context.data_type)
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
    return {"message": "File added to context."}


class GetFileInfoSchema(BaseModel):
    temp_id: int


@app.post("/get_file_info")
async def get_file_info_api(get_file_info: GetFileInfoSchema):
    try:
        print("Getting file info...")
        file_info = get_info_need_fill_placeholder(get_file_info.temp_id)
        print("Sending file info...")
        return {"file_info": file_info}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


class GetEntityInfoSchema(BaseModel):
    current_questions: str
    context: str


@app.post("/get_entity_info")
async def get_entity_info_api(get_entity_info: GetEntityInfoSchema):
    try:
        print("Getting entity info...")
        entity_info = find_entities_for_placeholders(get_entity_info.current_questions, get_entity_info.context)
        print("Sending entity info...")
        return {"entity_info": entity_info}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


class FinalizeDoc(BaseModel):
    template: str
    placeholder_data: str


@app.post("/finalize_doc")
async def finalize_doc_api(finalize_doc: FinalizeDoc):
    try:
        print("Finalizing document...")
        final_doc = finlize_doc(finalize_doc.template, finalize_doc.placeholder_data)
        print("Sending entity info...")
        return {"final_doc": final_doc}
    except Exception as e:
        print(e)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
