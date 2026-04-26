from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from routers.restaurants import router as restaurants_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="EcoBite API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(restaurants_router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "EcoBite API"}
