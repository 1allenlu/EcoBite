import sys
import os
import tempfile
from dotenv import load_dotenv
from fastapi import APIRouter, UploadFile, File, HTTPException

_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
if _PROJECT_ROOT not in sys.path:
    sys.path.insert(0, _PROJECT_ROOT)

load_dotenv(os.path.join(_PROJECT_ROOT, ".env"), override=False)
load_dotenv()

from services.menu_scanner import scan_menu
from calculateMenu import score_menu, label_score

router = APIRouter(prefix="/menu", tags=["menu"])


@router.post("/scan")
async def scan_menu_image(file: UploadFile = File(...)):
    suffix = os.path.splitext(file.filename or "")[1] or ".jpg"

    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(await file.read())
        tmp_path = tmp.name

    try:
        menu_text = scan_menu(tmp_path)
        if not menu_text.strip():
            raise HTTPException(status_code=422, detail="No text could be extracted from the image")

        results = score_menu(menu_text)
        if not results:
            raise HTTPException(status_code=422, detail="No dishes found in the menu")

        avg_score = round(sum(r["carbon_score_kg_co2e"] for r in results) / len(results), 3)
        top5 = sorted(results, key=lambda x: x["carbon_score_kg_co2e"])[:5]

        return {
            "avg_carbon_score": avg_score,
            "avg_label": label_score(avg_score),
            "total_dishes": len(results),
            "top5_dishes": [
                {
                    "dish": r["dish"],
                    "carbon_score_kg_co2e": r["carbon_score_kg_co2e"],
                    "label": r["label"],
                }
                for r in top5
            ],
            "all_dishes": [
                {
                    "dish": r["dish"],
                    "carbon_score_kg_co2e": r["carbon_score_kg_co2e"],
                    "label": r["label"],
                }
                for r in results
            ],
        }
    finally:
        os.unlink(tmp_path)
