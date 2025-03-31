from functools import wraps
#functools is a module in Python that provides functions for higher-order functions and operations on callable objects.
#functools.wraps is a decorator that copies the attributes of the original function to the wrapper function
#this is used to preserve the metadata of the original function
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
            #authorization header is used to send the token to the server
            #the token is sent in the authorization header in the format "Bearer"
            try:
                token = auth_header.split(" ")[1]
                #the token is extracted from the authorization header
            except IndexError:
                return jsonify({'message': 'Invalid token format'}), 401

        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            # Decode the token
            data = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
            #the token is decoded using the secret key
            #the secret key is used to verify the authenticity of the token
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
            #if the user role is artist, we will fetch the artist details from the artists table
            #if the user role is customer, we will fetch the customer details from the customers table
            #if the user role is gallery, we will fetch the gallery details from the galleries table
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
            #if someone not specified their roles we will return a 401 error response
            #if the user role is not one of the expected roles, we will return a 401 error response
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