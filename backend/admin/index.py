"""
Business: API админ-панели для управления клиниками (только для администраторов)
Args: event с httpMethod (GET/POST/PUT/DELETE), body с данными клиники, headers с X-Auth-Token; context с request_id
Returns: HTTP response с результатом операции или ошибкой
"""
import json
import os
import jwt
import psycopg2
from typing import Dict, Any

def verify_admin(token: str, jwt_secret: str) -> tuple[bool, int]:
    try:
        payload = jwt.decode(token, jwt_secret, algorithms=['HS256'])
        return payload.get('is_admin', False), payload.get('user_id', 0)
    except:
        return False, 0

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
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
    
    is_admin, user_id = verify_admin(auth_token, jwt_secret)
    
    if not is_admin:
        return {
            'statusCode': 403,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Доступ запрещён. Требуются права администратора'})
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    try:
        if method == 'GET':
            cursor.execute('SELECT id, name, address, phone, email FROM clinics ORDER BY id')
            clinics = []
            for row in cursor.fetchall():
                clinics.append({
                    'id': row[0],
                    'name': row[1],
                    'address': row[2],
                    'phone': row[3],
                    'email': row[4]
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(clinics)
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            name = body_data.get('name', '').strip()
            image_url = body_data.get('image_url', '').strip()
            address = body_data.get('address', '').strip()
            phone = body_data.get('phone', '').strip()
            email = body_data.get('email', '').strip()
            website = body_data.get('website', '').strip()
            description = body_data.get('description', '').strip()
            services = body_data.get('services', [])
            schedule = body_data.get('schedule', {})
            
            if not all([name, image_url, address, phone, email, description]):
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Заполните все обязательные поля'})
                }
            
            cursor.execute('''
                INSERT INTO clinics (name, image_url, address, phone, email, website, description)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
            ''', (name, image_url, address, phone, email, website, description))
            
            clinic_id = cursor.fetchone()[0]
            
            for service in services:
                cursor.execute(
                    'INSERT INTO clinic_services (clinic_id, service_name) VALUES (%s, %s)',
                    (clinic_id, service)
                )
            
            for day_range, hours in schedule.items():
                cursor.execute(
                    'INSERT INTO clinic_schedules (clinic_id, day_range, hours) VALUES (%s, %s, %s)',
                    (clinic_id, day_range, hours)
                )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'id': clinic_id, 'message': 'Клиника успешно создана'})
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            clinic_id = body_data.get('id')
            
            if not clinic_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не указан ID клиники'})
                }
            
            update_fields = []
            params = []
            
            for field in ['name', 'image_url', 'address', 'phone', 'email', 'website', 'description']:
                if field in body_data:
                    update_fields.append(f'{field} = %s')
                    params.append(body_data[field])
            
            if update_fields:
                params.append(clinic_id)
                cursor.execute(
                    f'UPDATE clinics SET {", ".join(update_fields)} WHERE id = %s',
                    params
                )
            
            if 'services' in body_data:
                cursor.execute('DELETE FROM clinic_services WHERE clinic_id = %s', (clinic_id,))
                for service in body_data['services']:
                    cursor.execute(
                        'INSERT INTO clinic_services (clinic_id, service_name) VALUES (%s, %s)',
                        (clinic_id, service)
                    )
            
            if 'schedule' in body_data:
                cursor.execute('DELETE FROM clinic_schedules WHERE clinic_id = %s', (clinic_id,))
                for day_range, hours in body_data['schedule'].items():
                    cursor.execute(
                        'INSERT INTO clinic_schedules (clinic_id, day_range, hours) VALUES (%s, %s, %s)',
                        (clinic_id, day_range, hours)
                    )
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Клиника успешно обновлена'})
            }
        
        elif method == 'DELETE':
            body_data = json.loads(event.get('body', '{}'))
            clinic_id = body_data.get('id')
            
            if not clinic_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Не указан ID клиники'})
                }
            
            cursor.execute('DELETE FROM clinic_services WHERE clinic_id = %s', (clinic_id,))
            cursor.execute('DELETE FROM clinic_schedules WHERE clinic_id = %s', (clinic_id,))
            cursor.execute('DELETE FROM reviews WHERE clinic_id = %s', (clinic_id,))
            cursor.execute('DELETE FROM clinics WHERE id = %s', (clinic_id,))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'message': 'Клиника успешно удалена'})
            }
        
        else:
            return {
                'statusCode': 405,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'Метод не поддерживается'})
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
