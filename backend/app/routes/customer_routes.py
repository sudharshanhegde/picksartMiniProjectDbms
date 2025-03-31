from flask import Blueprint, request, jsonify
from app.config import get_db_connection

customer_routes = Blueprint('customer_routes', __name__)

# Fetch all customers
@customer_routes.route('/customers', methods=['GET'])
def get_customers():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM customers")
    customers = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(customers)

# Add a new customer
@customer_routes.route('/customers', methods=['POST'])
def add_customer():
    data = request.get_json()
    name = data['name']
    email = data['email']
    phone = data['phone']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO customers (name, email, phone,password_hash) VALUES (%s, %s, %s,%s)", 
                   (name, email, phone,"password_hash"))
    #these here is used to insert the customer into the database
    #password_hash is set to a default value of "password_hash"
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Customer added successfully!"}), 201
