# LexiGuide - AI Based Legal Advice Chatbot

### Installation Guide

1. Clone Project folder to your pc
2. Open the terminal
3. Change direcory to backend folder using

```
      cd backend
```

4. Create a virtual environment using

```
      python3 -m venv venv

      source venv/bin/activate

```

5. Install the requirements using

```
pip install -r requirements.txt

```

6. Install the missing requirements using

```
pip install uvicorn langchain_openai langchain_pinecone pandas pdfplumber   pdfminer tabulate readability readability-lxml newspaper3k lxml[html_clean] pydantic[email]

```

7. Run the backend using

```
uvicorn app:app --port=9000 --reload

```

8. Open new terminal and change directory using

```
cd frontend_user

```

9. Install the requirements using

```
npm install

```

10. If any vunalrabilities found run

```
npm audit fix

```

11. Run the frontend using

```
npm run dev

```

12. Open another new terminal and change directory using

```
cd frontend_admin

```

13. Install the requirements using

```
npm install

```

14. Run the frontend using

```
npm run dev

```
