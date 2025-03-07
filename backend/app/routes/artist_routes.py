from flask import Blueprint, request, jsonify
from app.config import get_db_connection

artist_routes = Blueprint('artist_routes', __name__)

# Fetch all artists
@artist_routes.route('/artists', methods=['GET'])
def get_artists():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # Important: use dictionary=True
    cursor.execute("SELECT artist_id, name, email, specialization FROM artists")
    artists = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(artists)

# Add a new artist
@artist_routes.route('/artists', methods=['POST'])
def add_artist():
    data = request.get_json()
    name = data['name']
    email = data['email']
    specialization = data['specialization']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO artists (name, email, specialization,password_hash) VALUES (%s, %s, %s,%s)", 
                   (name, email, specialization, "password_hash"))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Artist added successfully!"}), 201

# Delete an artist
@artist_routes.route('/artists/<int:artist_id>', methods=['DELETE'])
def delete_artist(artist_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM artists WHERE artist_id = %s", (artist_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Artist deleted successfully!"})
