import pandas as pd
import pdfplumber
from pdfminer.high_level import extract_text


def extract_text_from_pdf(pdf_bytes):
    text = extract_text(pdf_bytes)
    return text


def extract_text_and_tables(pdf_path):
    all_text = ""
    all_tables = []

    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            # Extract text
            all_text += page.extract_text() + "\n"

            # Extract tables
            tables = page.extract_tables()
            for table in tables:
                # Convert table data to a DataFrame for easier processing
                df = pd.DataFrame(table[1:], columns=table[0])
                all_tables.append(df)

    return all_text, all_tables


def extract_pdf_text(pdf_path):
    final_text = ""

    extracted_text = extract_text_from_pdf(pdf_path)
    final_text = extracted_text + final_text

    extracted_text, extracted_tables = extract_text_and_tables(pdf_path)

    for table in extracted_tables:
        final_text += table.to_markdown(index=False) + "\n\n"

    return final_text
