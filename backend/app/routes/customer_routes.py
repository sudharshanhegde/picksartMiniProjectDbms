from flask import Blueprint, request, jsonify
from app.config import get_db_connection
from app.auth import token_required

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

# Get customer profile
@customer_routes.route('/customers/profile', methods=['GET'])
@token_required
def get_customer_profile(current_user):
    if not current_user or current_user['role'] != 'customer':
        return jsonify({'message': 'Unauthorized'}), 403
        
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT customer_id, name, email, address, phone_number FROM customers WHERE customer_id = %s",
        (current_user['user_id'],)
    )
    customer = cursor.fetchone()
    cursor.close()
    conn.close()
    
    if not customer:
        return jsonify({'message': 'Customer not found'}), 404
        
    return jsonify(customer)

# Update customer profile
@customer_routes.route('/customers/profile', methods=['PUT'])
@token_required
def update_customer_profile(current_user):
    if not current_user or current_user['role'] != 'customer':
        return jsonify({'message': 'Unauthorized'}), 403
        
    data = request.get_json()
    
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        query = """
            UPDATE customers 
            SET 
                name = %s,
                address = %s,
                phone_number = %s
            WHERE customer_id = %s
        """
        cursor.execute(query, (
            data.get('name', current_user['name']),
            data.get('address', ''),
            data.get('phone_number', ''),
            current_user['user_id']
        ))
        
        conn.commit()
        cursor.close()
        conn.close()
        
        return jsonify({'message': 'Profile updated successfully'}), 200
    except Exception as e:
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({'message': f'Error updating profile: {str(e)}'}), 500

# Add a new customer
@customer_routes.route('/customers', methods=['POST'])
def add_customer():
    data = request.get_json()
    name = data['name']
    email = data['email']
    address = data.get('address', '')
    phone_number = data.get('phone_number', '')

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO customers (name, email, address, phone_number, password_hash) 
        VALUES (%s, %s, %s, %s, %s)
    """, (name, email, address, phone_number, "password_hash"))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Customer added successfully!"}), 201
