from PyPDF2 import PdfReader
from pdf2image import convert_from_path
import pytesseract

def extract_text_from_pdf(file_path: str) -> str:
    text = ""

    try:
        reader = PdfReader(file_path)
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text
    except:
        pass

    if len(text.strip()) < 50:
        images = convert_from_path(file_path)
        for img in images:
            text += pytesseract.image_to_string(img)

    return text
