import cv2
import pytesseract
import re
import sys

def preprocess_image(image_path):
    img = cv2.imread(image_path)

    if img is None:
        raise ValueError("Could not read image. Check the file path.")

    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    gray = cv2.resize(gray, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

    blur = cv2.GaussianBlur(gray, (5, 5), 0)

    thresh = cv2.adaptiveThreshold(
        blur,
        255,
        cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv2.THRESH_BINARY,
        31,
        11
    )

    return thresh

def clean_text(text):
    text = text.replace("|", "I")
    text = re.sub(r"[^\S\n]+", " ", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"(?<=\w)-\n(?=\w)", "", text)
    text = re.sub(r"\n ", "\n", text)
    return text.strip()

def scan_menu(image_path):
    processed = preprocess_image(image_path)

    config = "--oem 3 --psm 6"
    raw_text = pytesseract.image_to_string(processed, config=config)

    return clean_text(raw_text)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scan_menu.py menu_photo.jpg")
        sys.exit(1)

    image_path = sys.argv[1]
    menu_text = scan_menu(image_path)

    print("\n--- CLEAN MENU TEXT ---\n")
    print(menu_text)