from functools import wraps
from flask import request, jsonify
import jwt
from .config import Config, get_db_connection

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Check if token is in headers
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            try:
                token = auth_header.split(" ")[1]
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            # Decode the token
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            user_id = data['user_id']
            user_role = data.get('role')
            
            print(f"Token decoded: user_id={user_id}, role={user_role}")

            # Get user details from the appropriate table based on role
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            if user_role == 'artist':
                cursor.execute('''
                    SELECT artist_id, artist_id as user_id, name, email, 'artist' as role 
                    FROM artists WHERE artist_id = %s
                ''', (user_id,))
            elif user_role == 'customer':
                cursor.execute('''
                    SELECT customer_id, customer_id as user_id, name, email, 'customer' as role 
                    FROM customers WHERE customer_id = %s
                ''', (user_id,))
            elif user_role == 'gallery':
                cursor.execute('''
                    SELECT gallery_id, gallery_id as user_id, name, email, 'gallery' as role 
                    FROM galleries WHERE gallery_id = %s
                ''', (user_id,))
            else:
                return jsonify({'message': 'Invalid user role'}), 401

            current_user = cursor.fetchone()
            cursor.close()
            conn.close()
            
            print(f"Current user from DB: {current_user}")

            if current_user is None:
                return jsonify({'message': 'User not found'}), 401

            return f(current_user, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401
        except Exception as e:
            print(f"Token validation error: {str(e)}")
            return jsonify({'message': f'Error: {str(e)}'}), 500

    return decorated 