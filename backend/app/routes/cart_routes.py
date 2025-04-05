from flask import Blueprint, request, jsonify
from ..config import get_db_connection
from ..auth import token_required
#token_required is a decorator that we created in the auth.py file
#it is used to check if the user is authenticated before accessing the cart functionality
from mysql.connector import Error
from decimal import Decimal

cart = Blueprint('cart', __name__)

@cart.route('/cart/sync', methods=['POST'])
@token_required
def sync_cart(current_user):
    conn = None
    cursor = None
    if not current_user or current_user['role'] != 'customer':
        return jsonify({'message': 'Only customers can access cart functionality'}), 403

    try:
        data = request.get_json()
        print(f"Received cart data: {data}")
        cart_items = data.get('items', [])
        print(f"Cart items: {cart_items}")
        
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True, buffered=True)  # Use buffered cursor

        # Check if user has a pending order
        cursor.execute(
            "SELECT order_id FROM orders WHERE customer_id = %s AND status = 'pending'",
            (current_user['user_id'],)
        )
        existing_order = cursor.fetchone()
        #this query will check if the user has a pending order
        #if the user has a pending order, the order_id will be returned
        print(f"Existing order: {existing_order}")

        if existing_order:
            order_id = existing_order['order_id']
            print(f"Using existing order: {order_id}")
            # Clear existing items
            cursor.execute(
                "DELETE FROM order_items WHERE order_id = %s",
                (order_id,)
            )
        else:
            print(f"Creating new order for customer: {current_user['user_id']}")
            # Create new order with NULL shipping_address
            cursor.execute(
                "INSERT INTO orders (customer_id, total_amount, status) VALUES (%s, 0, 'pending')",
                (current_user['user_id'],)
            )
            order_id = cursor.lastrowid
            print(f"Created new order: {order_id}")

        # Add new items
        total_amount = 0
        for item in cart_items:
            print(f"Processing item: {item}")
            try:
                cursor.execute(
                    """
                    INSERT INTO order_items 
                    (order_id, artwork_id, quantity, price_at_time) 
                    VALUES (%s, %s, %s, %s)
                    """,
                    (order_id, item['artwork_id'], item['quantity'], item['price'])
                )
                #this query will insert the items into the order_items table
                #the order_id will be the ID of the order that was created or found
                total_amount += float(item['price']) * int(item['quantity'])
            except Exception as item_error:
                print(f"Error inserting item: {str(item_error)}")
                raise

        # Update order total
        cursor.execute(
            "UPDATE orders SET total_amount = %s WHERE order_id = %s",
            (total_amount, order_id)
        )

        conn.commit()
        return jsonify({
            'message': 'Cart synced successfully',
            'order_id': order_id
        }), 200

    except Exception as e:
        print(f"Cart sync error: {str(e)}")
        if conn:
            try:
                conn.rollback()
            except Exception as rollback_error:
                print(f"Error during rollback: {str(rollback_error)}")
        return jsonify({'message': f'Database error occurred: {str(e)}'}), 500
    finally:
        try:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
                print("Database connection closed successfully")
        except Exception as e:
            print(f"Error closing database connection: {str(e)}")

@cart.route('/cart', methods=['GET'])
@token_required
def get_cart(current_user):
    conn = None
    cursor = None
    if not current_user or current_user['role'] != 'customer':
        return jsonify({'message': 'Only customers can access cart functionality'}), 403

    try:
        print(f"Getting cart for customer: {current_user['user_id']}")
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True, buffered=True)

        # First, get the pending order ID
        cursor.execute(
            """
            SELECT order_id, total_amount
            FROM orders
            WHERE customer_id = %s AND status = 'pending'
            ORDER BY created_at DESC
            LIMIT 1
            """,
            (current_user['user_id'],)
        )
        #this query will get the pending order for the customer
        #the order_id and total_amount will be returned
        
        order = cursor.fetchone()
        if not order:
            return jsonify({'items': [], 'total': 0}), 200

        # Then get all items for this order
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
        #this query will get all the items in the order_items table
        #the items will be joined with the artworks table to get the title and image_url
        items = cursor.fetchall()
        print(f"Found {len(items)} cart items")

        cart_items = []
        for item in items:
            print(f"Processing cart item: {item}")
            cart_items.append({
                'artwork_id': item['artwork_id'],
                'title': item['title'],
                'price': float(item['price_at_time']) if item['price_at_time'] else 0,
                'quantity': item['quantity'] if item['quantity'] else 1,
                'image_url': item['image_url'],
                'artist_name': item['artist_name']
            })

        return jsonify({
            'items': cart_items,
            'total': float(order['total_amount']) if order['total_amount'] else 0
        }), 200

    except Exception as e:
        print(f"Error getting cart: {str(e)}")
        return jsonify({'message': f'Database error occurred: {str(e)}'}), 500
    finally:
        try:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
                print("Database connection closed successfully")
        except Exception as e:
            print(f"Error closing database connection: {str(e)}")

@cart.route('/cart/checkout', methods=['POST'])
@token_required
def checkout(current_user):
    conn = None
    cursor = None
    if not current_user or current_user['role'] != 'customer':
        return jsonify({'message': 'Only customers can access cart functionality'}), 403

    try:
        print(f"Processing checkout for customer: {current_user}")
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True, buffered=True)

        # Get pending order with items
        cursor.execute(
            """
            SELECT 
                o.order_id, 
                o.total_amount,
                o.created_at,
                oi.artwork_id,
                oi.quantity,
                oi.price_at_time,
                a.title,
                a.image_url,
                ar.name as artist_name
            FROM orders o
            JOIN order_items oi ON o.order_id = oi.order_id
            JOIN artworks a ON oi.artwork_id = a.artwork_id
            JOIN artists ar ON a.artist_id = ar.artist_id
            WHERE o.customer_id = %s AND o.status = 'pending'
            ORDER BY o.order_id DESC
            """,
            (current_user['user_id'],)
        )
        #this query will get the pending order for the customer
        #it will also get the items in the order_items table
        #the items will be joined with the artworks table to get the title and image_url
        #the items will be joined with the artists table to get the artist name and email
        items = cursor.fetchall()
        print(f"Found order items: {items}")

        if not items:
            return jsonify({'message': 'No pending order found'}), 404

        order_id = items[0]['order_id']
        order_items = []
        total_amount = 0

        for item in items:
            order_items.append({
                'artwork_id': item['artwork_id'],
                'title': item['title'],
                'quantity': item['quantity'],
                'price': float(item['price_at_time']),
                'image_url': item['image_url'],
                'artist_name': item['artist_name']
            })
            total_amount += float(item['price_at_time']) * item['quantity']

        # Update order status to confirmed
        cursor.execute(
            "UPDATE orders SET status = 'confirmed' WHERE order_id = %s",
            (order_id,)
        )
        #this query will update the status of the order to confirmed

        conn.commit()
        print(f"Successfully processed checkout for order: {order_id}")
        
        # Return complete order details for confirmation page
        return jsonify({
            'message': 'Order placed successfully',
            'order': {
                'order_id': order_id,
                'total_amount': total_amount,
                'date': items[0]['created_at'].isoformat() if items[0]['created_at'] else None,
                'status': 'confirmed',
                'customer_name': current_user['name'],
                'items': order_items
            }
        }), 200

    except Exception as e:
        print(f"Checkout error: {str(e)}")
        if conn:
            try:
                conn.rollback()
            except Exception as rollback_error:
                print(f"Error during rollback: {str(rollback_error)}")
        return jsonify({'message': f'Database error occurred: {str(e)}'}), 500
    finally:
        try:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
                print("Database connection closed successfully")
        except Exception as e:
            print(f"Error closing database connection: {str(e)}")

@cart.route('/orders', methods=['GET'])
@token_required
def get_orders(current_user):
    conn = None
    cursor = None
    if not current_user or current_user['role'] != 'customer':
        return jsonify({'message': 'Only customers can access orders'}), 403

    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True, buffered=True)

        # Get all confirmed orders for the customer
        cursor.execute(
            """
            SELECT DISTINCT
                o.order_id,
                o.total_amount,
                o.status,
                o.created_at
            FROM orders o
            WHERE o.customer_id = %s AND o.status = 'confirmed'
            ORDER BY o.created_at DESC
            """,
            (current_user['user_id'],)
        )
        #this query will get all the confirmed orders for the customer
        #the order_id, total_amount, status, and created_at will be returned            
        orders = cursor.fetchall()
        
        if not orders:
            return jsonify({
                'orders': [],
                'message': 'No orders found'
            }), 200

        # Get items for each order
        order_list = []
        for order in orders:
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
            #this query will get all the items in the order_items table
        #the items will be joined with the artworks table to get the title and image_url
            items = cursor.fetchall()
            
            order_data = {
                'order_id': order['order_id'],
                'total_amount': order['total_amount'],  # CustomJSONEncoder will handle conversion
                'status': order['status'],
                'date': order['created_at'],  # CustomJSONEncoder will handle conversion
                'items': [{
                    'artwork_id': item['artwork_id'],
                    'title': item['title'],
                    'quantity': item['quantity'],
                    'price': item['price_at_time'],  # CustomJSONEncoder will handle conversion
                    'image_url': item['image_url'],
                    'artist_name': item['artist_name']
                } for item in items]
            }
            order_list.append(order_data)
       #we are creating a list of dictionaries for each order
        #each dictionary will contain the order_id, total_amount, status, and created_at
        return jsonify({
            'orders': order_list
        }), 200

    except Exception as e:
        print(f"Error getting orders: {str(e)}")
        return jsonify({
            'message': 'Failed to fetch orders',
            'error': str(e)
        }), 500
    finally:
        try:
            if cursor:
                cursor.close()
            if conn:
                conn.close()
        except Exception as e:
            print(f"Error closing database connection: {str(e)}") 