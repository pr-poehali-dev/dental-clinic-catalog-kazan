"""
Business: API для получения списка клиник и детальной информации о клинике
Args: event с httpMethod (GET), queryStringParameters с clinic_id, search, service; context с request_id
Returns: HTTP response со списком клиник или данными клиники
"""
import json
import os
import psycopg2
from typing import Dict, Any, List

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    database_url = os.environ.get('DATABASE_URL')
    
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Database configuration missing'})
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    try:
        params = event.get('queryStringParameters') or {}
        clinic_id = params.get('clinic_id')
        search = params.get('search', '').lower()
        service_filter = params.get('service', '')
        
        if clinic_id:
            cursor.execute('''
                SELECT c.id, c.name, c.image_url, c.address, c.phone, c.email, c.website, c.description,
                       COALESCE(AVG(r.rating), 0) as avg_rating,
                       COUNT(r.id) as review_count
                FROM clinics c
                LEFT JOIN reviews r ON c.id = r.clinic_id
                WHERE c.id = %s
                GROUP BY c.id
            ''', (clinic_id,))
            
            clinic_row = cursor.fetchone()
            
            if not clinic_row:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Клиника не найдена'})
                }
            
            cursor.execute('SELECT service_name FROM clinic_services WHERE clinic_id = %s', (clinic_id,))
            services = [row[0] for row in cursor.fetchall()]
            
            cursor.execute('SELECT day_range, hours FROM clinic_schedules WHERE clinic_id = %s', (clinic_id,))
            schedule = {row[0]: row[1] for row in cursor.fetchall()}
            
            cursor.execute('''
                SELECT r.id, r.rating, r.review_text, r.created_at, u.full_name
                FROM reviews r
                JOIN users u ON r.user_id = u.id
                WHERE r.clinic_id = %s
                ORDER BY r.created_at DESC
            ''', (clinic_id,))
            
            reviews = []
            for review_row in cursor.fetchall():
                reviews.append({
                    'id': review_row[0],
                    'rating': review_row[1],
                    'text': review_row[2],
                    'date': review_row[3].isoformat(),
                    'author': review_row[4]
                })
            
            clinic = {
                'id': clinic_row[0],
                'name': clinic_row[1],
                'image': clinic_row[2],
                'address': clinic_row[3],
                'phone': clinic_row[4],
                'email': clinic_row[5],
                'website': clinic_row[6],
                'description': clinic_row[7],
                'rating': round(float(clinic_row[8]), 1),
                'reviewCount': clinic_row[9],
                'services': services,
                'schedule': schedule,
                'reviews': reviews
            }
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(clinic)
            }
        
        else:
            query = '''
                SELECT c.id, c.name, c.image_url, c.address, c.phone, c.email, c.website, c.description,
                       COALESCE(AVG(r.rating), 0) as avg_rating,
                       COUNT(DISTINCT r.id) as review_count
                FROM clinics c
                LEFT JOIN reviews r ON c.id = r.clinic_id
            '''
            
            conditions = []
            query_params: List[Any] = []
            
            if search:
                conditions.append('(LOWER(c.name) LIKE %s OR LOWER(c.address) LIKE %s)')
                search_param = f'%{search}%'
                query_params.extend([search_param, search_param])
            
            if service_filter:
                conditions.append('c.id IN (SELECT clinic_id FROM clinic_services WHERE service_name = %s)')
                query_params.append(service_filter)
            
            if conditions:
                query += ' WHERE ' + ' AND '.join(conditions)
            
            query += ' GROUP BY c.id ORDER BY avg_rating DESC, review_count DESC'
            
            cursor.execute(query, query_params)
            
            clinics = []
            for row in cursor.fetchall():
                clinic_id_val = row[0]
                
                cursor.execute('SELECT service_name FROM clinic_services WHERE clinic_id = %s', (clinic_id_val,))
                services = [s[0] for s in cursor.fetchall()]
                
                cursor.execute('SELECT day_range, hours FROM clinic_schedules WHERE clinic_id = %s', (clinic_id_val,))
                schedule = {d[0]: d[1] for d in cursor.fetchall()}
                
                clinics.append({
                    'id': row[0],
                    'name': row[1],
                    'image': row[2],
                    'address': row[3],
                    'phone': row[4],
                    'email': row[5],
                    'website': row[6],
                    'description': row[7],
                    'rating': round(float(row[8]), 1),
                    'reviewCount': row[9],
                    'services': services,
                    'schedule': schedule
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps(clinics)
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
