from flask import Blueprint, request, jsonify
from ..config import get_db_connection
from ..auth import token_required
from mysql.connector import Error

shipping = Blueprint('shipping', __name__)

@shipping.route('/shipping', methods=['POST'])
@token_required
def add_shipping_info(current_user):
    conn = None
    cursor = None
    
    if not current_user or current_user['role'] != 'customer':
        return jsonify({'message': 'Only customers can add shipping information'}), 403

    try:
        data = request.get_json()
        if not data:
            return jsonify({'message': 'No data provided'}), 400
            
        address = data.get('address')
        phone_number = data.get('phone_number')
        
        if not address or not address.strip():
            return jsonify({'message': 'Address is required'}), 400
            
        if not phone_number or not phone_number.strip():
            return jsonify({'message': 'Phone number is required'}), 400
            
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # First, update the customer profile with the shipping details
        try:
            cursor.execute(
                "UPDATE customers SET address = %s, phone_number = %s WHERE customer_id = %s",
                (address, phone_number, current_user['user_id'])
            )
        except Exception as e:
            print(f"Error updating customer profile: {str(e)}")
            return jsonify({'message': 'Failed to update customer profile'}), 500
        
        # Then, get the latest pending order for this customer
        cursor.execute(
            """
            SELECT order_id FROM orders 
            WHERE customer_id = %s AND status = 'pending'
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (current_user['user_id'],)
        )
        
        order = cursor.fetchone()
        if not order:
            return jsonify({'message': 'No pending order found'}), 404
            
        # Check if shipping details already exist for this order
        cursor.execute(
            "SELECT shipping_id FROM shipping_details WHERE order_id = %s",
            (order['order_id'],)
        )
        
        existing_shipping = cursor.fetchone()
        if existing_shipping:
            # Update existing shipping details
            cursor.execute(
                """
                UPDATE shipping_details 
                SET address = %s, phone_number = %s 
                WHERE order_id = %s
                """,
                (address, phone_number, order['order_id'])
            )
            shipping_id = existing_shipping['shipping_id']
        else:
            # Add new shipping details to the shipping_details table
            cursor.execute(
                """
                INSERT INTO shipping_details (order_id, address, phone_number)
                VALUES (%s, %s, %s)
                """,
                (order['order_id'], address, phone_number)
            )
            shipping_id = cursor.lastrowid
        
        # Update order status to 'confirmed'
        cursor.execute(
            "UPDATE orders SET status = 'confirmed' WHERE order_id = %s",
            (order['order_id'],)
        )
        
        conn.commit()
        
        # Get the complete order details with shipping for the confirmation page
        cursor.execute(
            """
            SELECT 
                o.order_id, 
                o.total_amount,
                o.status,
                o.created_at,
                c.name as customer_name,
                s.address,
                s.phone_number,
                s.shipping_id
            FROM orders o
            JOIN customers c ON o.customer_id = c.customer_id
            JOIN shipping_details s ON o.order_id = s.order_id
            WHERE o.order_id = %s
            """,
            (order['order_id'],)
        )
        
        order_info = cursor.fetchone()
        
        # Get order items
        cursor.execute(
            """
            SELECT 
                oi.artwork_id,
                oi.quantity,
                oi.price_at_time,
                a.title,
                a.image_url,
                ar.name as artist_name
            FROM order_items oi
            JOIN artworks a ON oi.artwork_id = a.artwork_id
            JOIN artists ar ON a.artist_id = ar.artist_id
            WHERE oi.order_id = %s
            """,
            (order['order_id'],)
        )
        
        items = cursor.fetchall()
        order_items = []
        
        for item in items:
            order_items.append({
                'artwork_id': item['artwork_id'],
                'title': item['title'],
                'quantity': item['quantity'],
                'price': float(item['price_at_time']),
                'image_url': item['image_url'],
                'artist_name': item['artist_name']
            })
        
        return jsonify({
            'message': 'Shipping information added successfully',
            'shipping_id': shipping_id,
            'order_id': order['order_id'],
            'shipping_details': {
                'address': address,
                'phoneNumber': phone_number
            },
            'order': {
                'order_id': order_info['order_id'],
                'total_amount': float(order_info['total_amount']),
                'date': order_info['created_at'].isoformat() if order_info['created_at'] else None,
                'status': order_info['status'],
                'customer_name': order_info['customer_name'],
                'items': order_items
            }
        }), 200
        
    except Exception as e:
        print(f"Error adding shipping info: {str(e)}")
        if conn:
            conn.rollback()
        return jsonify({'message': f'Database error occurred: {str(e)}'}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()
            
@shipping.route('/shipping/<int:order_id>', methods=['GET'])
@token_required
def get_shipping_info(current_user, order_id):
    conn = None
    cursor = None
    
    if not current_user:
        return jsonify({'message': 'Authentication required'}), 401

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Check if order belongs to this customer
        cursor.execute(
            """
            SELECT o.order_id FROM orders o
            WHERE o.order_id = %s AND o.customer_id = %s
            """,
            (order_id, current_user['user_id'])
        )
        
        order = cursor.fetchone()
        if not order and current_user['role'] != 'admin':
            return jsonify({'message': 'Order not found or unauthorized'}), 404
            
        # Get shipping details
        cursor.execute(
            """
            SELECT shipping_id, order_id, address, phone_number, created_at
            FROM shipping_details
            WHERE order_id = %s
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (order_id,)
        )
        
        shipping = cursor.fetchone()
        if not shipping:
            return jsonify({'message': 'No shipping information found for this order'}), 404
            
        return jsonify(shipping), 200
        
    except Exception as e:
        print(f"Error fetching shipping info: {str(e)}")
        return jsonify({'message': f'Database error occurred: {str(e)}'}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close() 