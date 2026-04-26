from sqlalchemy import Column, Integer, String, Float, DateTime
from datetime import datetime
from database import Base


class Restaurant(Base):
    __tablename__ = 'restaurants'

    id = Column(Integer, primary_key=True, autoincrement=True)
    camis = Column(String, unique=True, index=True)   # NYC unique restaurant ID
    name = Column(String, nullable=False)
    address = Column(String)
    neighborhood = Column(String, index=True)
    latitude = Column(Float)
    longitude = Column(Float)
    cuisine = Column(String)
    category = Column(String, index=True)  # 'restaurant' | 'cafe_dessert'
    grade = Column(String)
    inspection_score = Column(Integer)

    # LL84 building data (null if building not in dataset)
    energy_star_score = Column(Float)
    water_use_intensity = Column(Float)

    # Green score components (0–50 / 0–20 / 0–20 / 0–10)
    energy_component = Column(Float, default=0)
    water_component = Column(Float, default=0)
    cuisine_component = Column(Float, default=0)
    health_component = Column(Float, default=0)
    green_score = Column(Float, default=0, index=True)

    created_at = Column(DateTime, default=datetime.utcnow)
