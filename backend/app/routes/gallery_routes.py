 
from flask import Blueprint, request, jsonify
from app.config import get_db_connection

gallery_routes = Blueprint('gallery_routes', __name__)

# Fetch all galleries
@gallery_routes.route('/galleries', methods=['GET'])
def get_galleries():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM galleries")
    galleries = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(galleries)

# Add a new gallery
@gallery_routes.route('/galleries', methods=['POST'])
def add_gallery():
    data = request.get_json()
    name = data['name']
    location = data['location']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO galleries (name, location) VALUES (%s, %s)", (name, location))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Gallery added successfully!"}), 201
