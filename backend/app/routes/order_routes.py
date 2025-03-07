 
from flask import Blueprint, request, jsonify
from app.config import get_db_connection

order_routes = Blueprint('order_routes', __name__)

# Fetch all orders
@order_routes.route('/orders', methods=['GET'])
def get_orders():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM orders")
    orders = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(orders)

# Add a new order
@order_routes.route('/orders', methods=['POST'])
def add_order():
    data = request.get_json()
    customer_id = data['customer_id']
    order_date = data['order_date']
    payment_status = data['payment_status']
    total_amount = data['total_amount']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO orders (customer_id, order_date, payment_status, total_amount) VALUES (%s, %s, %s, %s)", 
                   (customer_id, order_date, payment_status, total_amount))
    order_id = cursor.lastrowid  # Get the last inserted order ID
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Order placed successfully!", "order_id": order_id}), 201

# Delete an order
@order_routes.route('/orders/<int:order_id>', methods=['DELETE'])
def delete_order(order_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM orders WHERE order_id = %s", (order_id,))
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Order deleted successfully!"})
