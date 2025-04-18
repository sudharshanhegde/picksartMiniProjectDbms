from flask import Blueprint, request, jsonify
from app.config import get_db_connection

order_item_routes = Blueprint('order_item_routes', __name__)

# Fetch all order items
@order_item_routes.route('/order_items', methods=['GET'])
def get_order_items():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM order_item")
    order_items = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(order_items)

# Add an artwork to an order
@order_item_routes.route('/order_items', methods=['POST'])
def add_order_item():
    data = request.get_json()
    order_id = data['order_id']
    artwork_id = data['artwork_id']
    quantity = data['quantity']

    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO order_item (order_id, artwork_id, quantity) VALUES (%s, %s, %s)",
        (order_id, artwork_id, quantity)
    )
    # Get the last inserted order item id
    # This is used to get the order item id of the order item that was just inserted
    cursor.execute("SELECT LAST_INSERT_ID()")
    order_item_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Order item added successfully!", "order_item_id": order_item_id}), 201

# Delete an order item
@order_item_routes.route('/order_items/<int:item_id>', methods=['DELETE'])
def delete_order_item(item_id):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM order_item WHERE item_id = %s", (item_id,))
    # Get the order id of the order item that was just deleted
    # This is used to get the order id of the order item that was just deleted
    # This is used to update the order status to "Completed" if all order items are deleted
    cursor.execute("SELECT order_id FROM order_item WHERE item_id = %s", (item_id,))
    order_id = cursor.fetchone()[0]
    conn.commit()
    cursor.close()
    conn.close()
    return jsonify({"message": "Order item deleted successfully!", "order_id": order_id})
