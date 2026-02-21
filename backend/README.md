1. Create new virtual environment
   python -m venv venv

2. Activate virtual environment

.\venv\Scripts\activate

3. Install requirements

pip install -r requirements.txt

4. Install missing requirements using,

pip install uvicorn
pip install langchain_openai
pip install langchain_pinecone
pip install pandas
pip install pdfplumber pdfminer tabulate
pip install readability
pip3 install readability-lxml
pip3 install newspaper3k
pip3 install lxml[html_clean]
pip install pydantic[email]

5. Run the server

uvicorn app:app --port=9000 --reload

6. Check the server status using,

http://127.0.0.1:9000/docs
