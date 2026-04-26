import os
import base64
from openai import OpenAI

_client = None

def _get_client():
    global _client
    if _client is None:
        _client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
    return _client


def scan_menu(image_path: str) -> str:
    """Use OpenAI Vision to extract dish names from a menu image."""
    with open(image_path, "rb") as f:
        image_data = base64.b64encode(f.read()).decode("utf-8")

    ext = os.path.splitext(image_path)[1].lower().lstrip(".")
    mime = {"jpg": "image/jpeg", "jpeg": "image/jpeg", "png": "image/png", "webp": "image/webp"}.get(ext, "image/jpeg")

    response = _get_client().chat.completions.create(
        model="gpt-4o-mini",
        messages=[{
            "role": "user",
            "content": [
                {
                    "type": "image_url",
                    "image_url": {"url": f"data:{mime};base64,{image_data}"}
                },
                {
                    "type": "text",
                    "text": (
                        "Extract all dish names from this menu image. "
                        "Return only the dish names, one per line. "
                        "Do not include prices, descriptions, or section headers."
                    )
                }
            ]
        }],
        max_tokens=1000
    )

    return response.choices[0].message.content or ""
