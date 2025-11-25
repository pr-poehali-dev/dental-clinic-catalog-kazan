"""
Business: Регистрация, авторизация пользователей и управление JWT токенами
Args: event с httpMethod (POST), body с email/password/full_name; context с request_id
Returns: HTTP response с JWT токеном или ошибкой
"""
import json
import os
import jwt
import psycopg2
from datetime import datetime, timedelta
from typing import Dict, Any

def hash_password(password: str) -> str:
    import hashlib
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    try:
        body_data = json.loads(event.get('body', '{}'))
        action = body_data.get('action', 'login')
        
        if action == 'register':
            email = body_data.get('email', '').strip()
            password = body_data.get('password', '').strip()
            full_name = body_data.get('full_name', '').strip()
            
            if not email or not password or not full_name:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполните все поля'})
                }
            
            cursor.execute('SELECT id FROM users WHERE email = %s', (email,))
            if cursor.fetchone():
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Пользователь с таким email уже существует'})
                }
            
            password_hash = hash_password(password)
            cursor.execute(
                'INSERT INTO users (email, password_hash, full_name, is_admin) VALUES (%s, %s, %s, %s) RETURNING id, email, full_name, is_admin',
                (email, password_hash, full_name, False)
            )
            user = cursor.fetchone()
            conn.commit()
            
            token = jwt.encode({
                'user_id': user[0],
                'email': user[1],
                'full_name': user[2],
                'is_admin': user[3],
                'exp': datetime.utcnow() + timedelta(days=7)
            }, jwt_secret, algorithm='HS256')
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user[0],
                        'email': user[1],
                        'full_name': user[2],
                        'is_admin': user[3]
                    }
                })
            }
        
        elif action == 'login':
            email = body_data.get('email', '').strip()
            password = body_data.get('password', '').strip()
            
            if not email or not password:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполните все поля'})
                }
            
            cursor.execute(
                'SELECT id, email, password_hash, full_name, is_admin FROM users WHERE email = %s',
                (email,)
            )
            user = cursor.fetchone()
            
            if not user or not verify_password(password, user[2]):
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверный email или пароль'})
                }
            
            token = jwt.encode({
                'user_id': user[0],
                'email': user[1],
                'full_name': user[3],
                'is_admin': user[4],
                'exp': datetime.utcnow() + timedelta(days=7)
            }, jwt_secret, algorithm='HS256')
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'token': token,
                    'user': {
                        'id': user[0],
                        'email': user[1],
                        'full_name': user[3],
                        'is_admin': user[4]
                    }
                })
            }
        
        elif action == 'verify':
            token = body_data.get('token', '')
            
            if not token:
                return {
                    'statusCode': 401,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Токен отсутствует'})
                }
            
            try:
                payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'user': {
                            'id': payload['user_id'],
                            'email': payload['email'],
                            'full_name': payload['full_name'],
                            'is_admin': payload['is_admin']
                        }
                    })
                }
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
        
        else:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Неизвестное действие'})
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
