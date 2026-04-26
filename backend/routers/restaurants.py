from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.restaurant import Restaurant

router = APIRouter(prefix='/neighborhoods', tags=['restaurants'])


@router.get('/{neighborhood_name}/restaurants')
def get_top_restaurants(
    neighborhood_name: str,
    limit: int = 5,
    category: str = None,
    db: Session = Depends(get_db),
):
    query = (
        db.query(Restaurant)
        .filter(Restaurant.neighborhood == neighborhood_name)
    )
    if category:
        query = query.filter(Restaurant.category == category)

    restaurants = query.order_by(Restaurant.green_score.desc()).limit(limit).all()

    if not restaurants:
        raise HTTPException(status_code=404, detail=f'No restaurants found for {neighborhood_name}')

    return {
        'neighborhood': neighborhood_name,
        'count': len(restaurants),
        'restaurants': [
            {
                'id': r.id,
                'name': r.name,
                'address': r.address,
                'cuisine': r.cuisine,
                'category': r.category,
                'grade': r.grade,
                'latitude': r.latitude,
                'longitude': r.longitude,
                'green_score': r.green_score,
                'components': {
                    'energy': r.energy_component,
                    'water': r.water_component,
                    'cuisine': r.cuisine_component,
                    'health': r.health_component,
                },
                'has_building_data': r.energy_star_score is not None,
            }
            for r in restaurants
        ],
    }


@router.get('/all/stats')
def get_stats(db: Session = Depends(get_db)):
    from sqlalchemy import func
    total = db.query(func.count(Restaurant.id)).scalar()
    by_neighborhood = (
        db.query(Restaurant.neighborhood, func.count(Restaurant.id), func.avg(Restaurant.green_score))
        .group_by(Restaurant.neighborhood)
        .order_by(Restaurant.neighborhood)
        .all()
    )
    return {
        'total_restaurants': total,
        'by_neighborhood': [
            {'neighborhood': n, 'count': c, 'avg_green_score': round(avg, 1)}
            for n, c, avg in by_neighborhood
        ],
    }
