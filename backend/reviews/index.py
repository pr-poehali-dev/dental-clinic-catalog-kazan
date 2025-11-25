"""
Business: API для добавления отзывов о клиниках (требуется авторизация)
Args: event с httpMethod (POST), body с clinic_id, rating, review_text, headers с X-Auth-Token; context с request_id
Returns: HTTP response с созданным отзывом или ошибкой
"""
import json
import os
import jwt
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    jwt_secret = os.environ.get('JWT_SECRET', 'fallback-secret-key')
    
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'})
        }
    
    headers = event.get('headers', {})
    auth_token = headers.get('x-auth-token') or headers.get('X-Auth-Token')
    
    if not auth_token:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Требуется авторизация'})
        }
    
    try:
        payload = jwt.decode(auth_token, jwt_secret, algorithms=['HS256'])
        user_id = payload['user_id']
    except jwt.ExpiredSignatureError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Токен истёк'})
        }
    except jwt.InvalidTokenError:
        return {
            'statusCode': 401,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Недействительный токен'})
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        clinic_id = body_data.get('clinic_id')
        rating = body_data.get('rating')
        review_text = body_data.get('review_text', '').strip()
        
        if not clinic_id or not rating or not review_text:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Заполните все поля'})
            }
        
        if not (1 <= rating <= 5):
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Рейтинг должен быть от 1 до 5'})
            }
        
        cursor.execute('SELECT id FROM clinics WHERE id = %s', (clinic_id,))
        if not cursor.fetchone():
            return {
                'statusCode': 404,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Клиника не найдена'})
            }
        
        cursor.execute('''
            INSERT INTO reviews (clinic_id, user_id, rating, review_text)
            VALUES (%s, %s, %s, %s)
            RETURNING id, created_at
        ''', (clinic_id, user_id, rating, review_text))
        
        review = cursor.fetchone()
        conn.commit()
        
        cursor.execute('SELECT full_name FROM users WHERE id = %s', (user_id,))
        user_name = cursor.fetchone()[0]
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({
                'id': review[0],
                'clinic_id': clinic_id,
                'user_id': user_id,
                'author': user_name,
                'rating': rating,
                'text': review_text,
                'date': review[1].isoformat(),
                'message': 'Отзыв успешно добавлен'
            })
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': str(e)})
        }
    
    finally:
        cursor.close()
        conn.close()
