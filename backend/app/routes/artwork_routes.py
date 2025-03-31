from flask import Blueprint, request, jsonify

from ..config import get_db_connection
from ..auth import token_required
import logging
from decimal import Decimal
from mysql.connector import Error

artwork_routes = Blueprint('artwork_routes', __name__)

# Helper function to serialize Decimal
def serialize_artwork(artwork):
    if artwork:
        # Convert Decimal to float for JSON serialization
        if 'price' in artwork and isinstance(artwork['price'], Decimal):
            artwork['price'] = float(artwork['price'])
    return artwork
#well we are using a function serialize_artwork() to convert the price from Decimal to float
#this is done because JSON does not support Decimal type
#so we need to convert it to float before sending it as a response  
@artwork_routes.route('/artworks', methods=['GET'])
def get_artworks():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT a.*, ar.name as artist_name, ar.email as artist_email 
            FROM artworks a 
            LEFT JOIN artists ar ON a.artist_id = ar.artist_id
            WHERE a.status = 'available'
            ORDER BY a.created_at DESC
        """)
        #this query will fetch all the artworks from the database
        #it will also fetch the name and email of the artist who created the artwork
        #it will only fetch the artworks that are available
        #it will order the artworks by the created_at column in descending order
        artworks = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Serialize each artwork
        artworks = [serialize_artwork(artwork) for artwork in artworks]
        return jsonify(artworks)
    except Exception as e:
        print(f"Error fetching artworks: {str(e)}")
        return jsonify({"error": "Failed to fetch artworks"}), 500
#if anything goes wrong while fetching the artworks, we will return a 500 error response
#otherwise we will return the artworks as a JSON response
#we are using jsonify() function to convert the list of dictionaries into a JSON response
@artwork_routes.route('/artworks', methods=['POST'])
@token_required
def create_artwork(current_user):
    try:
        print(f"Current user attempting to create artwork: {current_user}")
        data = request.get_json()
        print(f"Artwork data received: {data}")
        
        # Validate required fields
        required_fields = ['title', 'description', 'price', 'image_url']
        if not all(field in data for field in required_fields):
            print(f"Missing required fields. Required: {required_fields}, Received: {data.keys()}")
            return jsonify({"error": "Missing required fields"}), 400
            
        # Validate that current user is an artist
        if current_user['role'] != 'artist':
            print(f"User role not artist: {current_user['role']}")
            return jsonify({"error": "Only artists can create artworks"}), 403
            
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Use the artist_id from the current_user
        artist_id = current_user['artist_id']
        print(f"Using artist_id: {artist_id}")
        
        cursor.execute("""
            INSERT INTO artworks (title, description, price, image_url, artist_id, status)
            VALUES (%s, %s, %s, %s, %s, 'available')
        """, (
            data['title'],
            data['description'],
            data['price'],
            data['image_url'],
            artist_id
        ))
        #these will insert the artwork into the database
        #the status of the artwork will be set to 'available'
        
        conn.commit()
        artwork_id = cursor.lastrowid
        #lastrowid is used to get the ID of the last inserted row

        print(f"Created artwork with ID: {artwork_id}")
        
        # Fetch the created artwork
        cursor.execute("""
            SELECT a.*, ar.name as artist_name 
            FROM artworks a 
            LEFT JOIN artists ar ON a.artist_id = ar.artist_id
            WHERE a.artwork_id = %s
        """, (artwork_id,))
        #this query will fetch the artwork that was just created
        #it will also fetch the name of the artist who created the artwork
        
        artwork = cursor.fetchone()
        cursor.close()
        conn.close()
        
        if artwork:
            print(f"Returning artwork: {artwork}")
            # Serialize the artwork before returning
            return jsonify(serialize_artwork(artwork)), 201
        else:
            print("Error: Could not retrieve created artwork")
            return jsonify({"error": "Failed to retrieve created artwork"}), 500
    except Exception as e:
        print(f"Error creating artwork: {str(e)}")
        return jsonify({"error": f"Failed to create artwork: {str(e)}"}), 500

@artwork_routes.route('/artworks/artist/<int:artist_id>', methods=['GET'])
@token_required
#this route will be used to fetch all the artworks created by a specific artist
#methods=['GET'] will allow only GET requests to this route
#<int:artist_id> is a URL parameter that will be used to specify the artist_id
#token_required decorator is used to protect this route
#only authenticated users can access this route
#the decorator will also provide the current_user object to the route function
#this object will contain information about the authenticated user
#the artist_id will be used to fetch the artworks created by the artist
#the current_user object will be used to verify that the authenticated user is the artist
#only the artist can fetch their own artworks
#other users will receive an unauthorized error
#the route will return a JSON response containing the artworks created by the artist
#the artworks will be serialized before returning the response
#this is done to convert the Decimal price to float
#this is necessary because JSON does not support Decimal type
#so we need to convert it to float before sending it as a response
#the route will return a 500 error response if an error occurs while fetching the artworks
def get_artist_artworks(current_user, artist_id):
    try:
        # Verify the artist is requesting their own artworks
        if not current_user or current_user.get('artist_id') != artist_id:
            return jsonify({"error": "Unauthorized"}), 403
            
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        cursor.execute("""
            SELECT * FROM artworks 
            WHERE artist_id = %s 
            ORDER BY created_at DESC
        """, (artist_id,))
        #this query will fetch all the artworks created by the artist
        #it will order the artworks by the created_at column in descending order
        
        artworks = cursor.fetchall()
        cursor.close()
        conn.close()
        
        # Serialize each artwork
        artworks = [serialize_artwork(artwork) for artwork in artworks]
        return jsonify(artworks)
    except Exception as e:
        print(f"Error fetching artist artworks: {str(e)}")
        return jsonify({"error": "Failed to fetch artworks"}), 500
