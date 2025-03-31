from flask import Blueprint, request, jsonify
from app.config import get_db_connection

artist_routes = Blueprint('artist_routes', __name__)

# Fetch all artists
@artist_routes.route('/artists', methods=['GET'])
def get_artists():
    """
    Retrieve a list of all artists from the database.
    Returns a JSON array of artist objects with their details.
    """
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)  # Use dictionary=True to get results as dictionaries
    cursor.execute("SELECT artist_id, name, email, specialization FROM artists")
    artists = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(artists)

# Add a new artist
@artist_routes.route('/artists', methods=['POST'])
def add_artist():
    """
    Add a new artist to the database.
    Expects JSON data with name, email, and specialization fields.
    Returns a success message with 201 Created status.
    """
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
    """
    Delete an artist from the database by their ID.
    Returns a success message upon completion.
    """
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM artists WHERE artist_id = %s", (artist_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Artist deleted successfully!"})
