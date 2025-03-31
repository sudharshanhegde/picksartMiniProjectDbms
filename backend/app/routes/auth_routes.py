from flask import Blueprint, request, jsonify
from app.config import get_db_connection
import bcrypt
#bcrypt is a library that is used to hash passwords
#it is used to hash the passwords before storing them in the database
import jwt
#jwt is a library that is used to generate and verify JSON Web Tokens
#it is used to generate a token when a user logs in
from datetime import datetime, timedelta
from app.config import Config
import logging
#logging is a module that is used to log messages

auth_routes = Blueprint('auth_routes', __name__)

def hash_password(password):
    salt = bcrypt.gensalt()
    #gensalt() function will generate a random salt
    #salt is a random value that is added to the password before hashing
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')  # Store as string
#hash_password() function will hash the password using bcrypt
#it will return the hashed password as a string

def check_password(password, hashed):
    try:
        return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))
    except Exception as e:
        print(f"Password check error: {str(e)}")
        return False
#check_password() function will check if the password matches the hashed password
#it will return True if the password matches the hashed password
def generate_token(user_id, role):
    return jwt.encode({
        'user_id': user_id,
        'role': role,
        'exp': datetime.utcnow() + timedelta(days=1)
    }, Config.SECRET_KEY, algorithm='HS256')
#generate_token() function will generate a JSON Web Token
#it will contain the user_id, role, and expiration time
#it will return the token as a string
@auth_routes.route('/auth/signup', methods=['POST'])
def signup():
    try:
        print("Received signup request")
        data = request.get_json()
        print(f"Signup data: {data}")
        
        if not data or 'email' not in data or 'password' not in data or 'name' not in data or 'role' not in data:
            return jsonify({"error": "Name, email, password, and role are required"}), 400
            #telling about all the requirments for a signup to be happening
        # Check if email already exists
        role = data['role'].lower()
        if role not in ['customer', 'artist', 'gallery']:
            return jsonify({"error": "Invalid role"}), 400
        #the variety of roles provided in our website is specified here.
            
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        #dictionary=True will return the rows as dictionaries
        # Check if email exists in any table
        tables = ['customers', 'artists', 'galleries']
        for table in tables:
            cursor.execute(f"SELECT * FROM {table} WHERE email = %s", (data['email'],))
            if cursor.fetchone():
                cursor.close()
                conn.close()
                return jsonify({"error": "Email already exists"}), 400
        #this will check if the email already exists in any of the tables
        # Hash password
        hashed_password = hash_password(data['password'])
        #this is a try catch block where i will shuffle between the roles such as customer artist and gallery.
        try:
            if role == 'customer':
                cursor.execute("""
                    INSERT INTO customers (name, email, password_hash)
                    VALUES (%s, %s, %s)
                """, (data['name'], data['email'], hashed_password))
                table_name = 'customers'
                id_field = 'customer_id'
                
            elif role == 'artist':
                cursor.execute("""
                    INSERT INTO artists (name, email, password_hash, bio, specialization)
                    VALUES (%s, %s, %s, %s, %s)
                """, (data['name'], data['email'], hashed_password, 
                     data.get('bio', ''), data.get('specialization', '')))
                table_name = 'artists'
                id_field = 'artist_id'
                
            elif role == 'gallery':
                cursor.execute("""
                    INSERT INTO galleries (name, email, password_hash, description, location)
                    VALUES (%s, %s, %s, %s, %s)
                """, (data['name'], data['email'], hashed_password,
                     data.get('description', ''), data.get('location', '')))
                table_name = 'galleries'
                id_field = 'gallery_id'

            conn.commit()
            user_id = cursor.lastrowid

            # Fetch the created user
            cursor.execute(f"SELECT * FROM {table_name} WHERE {id_field} = %s", (user_id,))
            user = cursor.fetchone()

            print(f"Successfully created {role}: {user}")

            return jsonify({
                "message": f"{role.capitalize()} account created successfully",
                "user": {
                    "id": user[id_field],
                    "name": user['name'],
                    "email": user['email'],
                    "role": role
                }
            }), 201

        except Exception as e:
            print(f"Database error: {str(e)}")
            conn.rollback()
            return jsonify({"error": "Database error occurred"}), 500
#if we are having some error in the database then we will rollback the changes and return a 500 error
    except Exception as e:
        print(f"Signup error: {str(e)}")
        return jsonify({"error": "Failed to create account"}), 500
#this is if we are facing a problem while creating the account then we will return a 500 error
    finally:
        try:
            cursor.close()
            conn.close()
        except:
            pass
#pass is used to handle the exception
#it will not do anything if an exception occurs
#this is used to close the cursor and connection
#by these we will be done with our signup part.
@auth_routes.route('/auth/login', methods=['POST'])
def login():
    try:
        print("Received login request")
        data = request.get_json()
        print(f"Login request data: {data}")
        
        if not data or 'email' not in data or 'password' not in data or 'role' not in data:
            return jsonify({"error": "Email, password, and role are required"}), 400

        role = data['role'].lower()
        if role not in ['customer', 'artist', 'gallery']:
            return jsonify({"error": "Invalid role"}), 400

        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)

        # Get user by email from appropriate table
        if role == 'customer':
            table_name = 'customers'
            id_field = 'customer_id'
        elif role == 'artist':
            table_name = 'artists'
            id_field = 'artist_id'
        else:
            table_name = 'galleries'
            id_field = 'gallery_id'

        # Debug: Print the query being executed
        query = f"SELECT * FROM {table_name} WHERE email = %s"
        print(f"Executing query: {query} with email: {data['email']}")
        
        cursor.execute(query, (data['email'],))
        user = cursor.fetchone()
        
        if user:
            print(f"Found user: {user['email']}")  # Debug log
            # Debug password check
            password_match = check_password(data['password'], user['password_hash'])
            print(f"Password check result: {password_match}")  # Debug log
        else:
            print(f"No user found with email: {data['email']}")  # Debug log

        cursor.close()
        conn.close()

        if not user:
            return jsonify({"error": "User not found"}), 401
            
        if not password_match:
            return jsonify({"error": "Invalid password"}), 401

        # Generate token
        token = generate_token(user[id_field], role)

        # Return user data including the appropriate ID field
        user_data = {
            "id": user[id_field],
            "email": user['email'],
            "name": user['name'],
            "role": role
        }
        
        # Add the specific role ID field
        if role == 'artist':
            user_data["artist_id"] = user[id_field]
        elif role == 'customer':
            user_data["customer_id"] = user[id_field]
        elif role == 'gallery':
            user_data["gallery_id"] = user[id_field]

        return jsonify({
            "token": token,
            "user": user_data
        }), 200

    except Exception as e:
        print(f"Login error: {str(e)}")
        return jsonify({"error": "Login failed"}), 500 
    
    #at here we are done with our login part.