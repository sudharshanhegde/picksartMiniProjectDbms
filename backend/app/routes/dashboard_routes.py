from flask import Blueprint, jsonify, request
from app.auth import token_required, admin_required
from app.config import get_db_connection
from datetime import datetime

dashboard_bp = Blueprint('dashboard', __name__)

@dashboard_bp.route('/dashboard/admin/transactions', methods=['GET'])
@token_required
@admin_required
def get_all_transactions(current_user):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True, buffered=True)
        
        # Check if orders table exists without using SHOW TABLES
        try:
            cursor.execute("SELECT 1 FROM orders LIMIT 1")
            result = cursor.fetchall()  # Consume the result
            orders_table_exists = True
        except Exception as e:
            print(f"Orders table check error: {e}")
            orders_table_exists = False
        
        if not orders_table_exists:
            return jsonify({'transactions': [], 'message': 'No orders table found'}), 200
        
        # Get ALL orders - not just limited to 5
        query = """
        SELECT * FROM orders
        """
        cursor.execute(query)
        orders = cursor.fetchall()
        
        # If we have orders, construct proper transactions response
        if orders:
            transactions = []
            for order in orders:
                # Create a new cursor for each sub-query to avoid unread result issues
                item_cursor = conn.cursor(dictionary=True, buffered=True)
                customer_cursor = conn.cursor(dictionary=True, buffered=True)
                
                # Get order items for this order
                try:
                    item_cursor.execute("""
                        SELECT oi.*, a.title as artwork_title, ar.name as artist_name 
                        FROM order_items oi 
                        JOIN artworks a ON oi.artwork_id = a.artwork_id
                        JOIN artists ar ON a.artist_id = ar.artist_id
                        WHERE oi.order_id = %s
                    """, (order['order_id'],))
                    items = item_cursor.fetchall()
                except Exception as e:
                    print(f"Error getting order items: {e}")
                    items = []
                finally:
                    item_cursor.close()
                
                # Get customer details
                try:
                    customer_cursor.execute("""
                        SELECT name as customer_name 
                        FROM customers 
                        WHERE customer_id = %s
                    """, (order['customer_id'],))
                    customer = customer_cursor.fetchone()
                except Exception as e:
                    print(f"Error getting customer details: {e}")
                    customer = None
                finally:
                    customer_cursor.close()
                
                # Create transaction entry for each order item
                if items:
                    for item in items:
                        transaction = {
                            'order_id': order['order_id'],
                            'status': order.get('status', 'Unknown'),
                            'customer_name': customer['customer_name'] if customer else 'Unknown',
                            'artwork_title': item.get('artwork_title', 'Unknown'),
                            'artist_name': item.get('artist_name', 'Unknown'),
                            'quantity': item.get('quantity', 0)
                        }
                        transactions.append(transaction)
                else:
                    # If no items, add basic transaction info
                    transaction = {
                        'order_id': order['order_id'],
                        'status': order.get('status', 'Unknown'),
                        'customer_name': customer['customer_name'] if customer else 'Unknown',
                        'artwork_title': 'N/A',
                        'artist_name': 'N/A',
                        'quantity': 0
                    }                   
                    transactions.append(transaction)
        else:
            # If no orders found, return empty list
            transactions = []
        
        return jsonify({'transactions': transactions}), 200
    except Exception as e:
        print(f"Error in admin transactions: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@dashboard_bp.route('/dashboard/admin/artists', methods=['GET'])
@token_required
@admin_required
def get_artists_stats(current_user):
    conn = None
    cursor = None
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True, buffered=True)
        
        # Check if artists table exists
        try:
            cursor.execute("SELECT 1 FROM artists LIMIT 1")
            result = cursor.fetchall()  # Consume the result
            artists_table_exists = True
        except Exception as e:
            print(f"Artists table check error: {e}")
            return jsonify({'artists_stats': [], 'message': 'No artists table found'}), 200
        
        # First get all artists
        try:
            cursor.execute("SELECT * FROM artists")
            artists = cursor.fetchall()  # Consume the result
        except Exception as e:
            print(f"Error getting artists: {e}")
            return jsonify({'artists_stats': [], 'message': 'Error retrieving artists'}), 500
        
        if not artists:
            return jsonify({'artists_stats': [], 'message': 'No artists found'}), 200
        
        stats = []
        for artist in artists:
            # Use new cursors for each query
            artworks_cursor = conn.cursor(dictionary=True, buffered=True)
            sales_cursor = conn.cursor(dictionary=True, buffered=True)
            
            # Count artworks for this artist
            try:
                artworks_cursor.execute("""
                    SELECT COUNT(*) as total_artworks
                    FROM artworks
                    WHERE artist_id = %s
                """, (artist['artist_id'],))
                total_result = artworks_cursor.fetchone()
                total_artworks = total_result['total_artworks'] if total_result else 0
            except Exception as e:
                print(f"Error counting artworks for artist {artist['artist_id']}: {e}")
                total_artworks = 0
            finally:
                artworks_cursor.close()
                
            # Count sold artworks
            try:
                sales_cursor.execute("""
                    SELECT COUNT(DISTINCT oi.order_item_id) as sold_artworks
                    FROM artworks a
                    JOIN order_items oi ON a.artwork_id = oi.artwork_id
                    WHERE a.artist_id = %s
                """, (artist['artist_id'],))
                sales_result = sales_cursor.fetchone()
                sold_artworks = sales_result['sold_artworks'] if sales_result else 0
            except Exception as e:
                print(f"Error counting sold artworks for artist {artist['artist_id']}: {e}")
                sold_artworks = 0
            finally:
                sales_cursor.close()
                
            stats.append({
                'artist_name': artist['name'],
                'total_artworks': total_artworks,
                'sold_artworks': sold_artworks
            })
        
        return jsonify({'artists_stats': stats}), 200
    except Exception as e:
        print(f"Error in admin artists stats: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@dashboard_bp.route('/dashboard/artist/stats', methods=['GET'])
@token_required
def get_artist_stats(current_user):
    conn = None
    cursor = None
    try:
        if current_user['role'] != 'artist':
            return jsonify({'error': 'Unauthorized'}), 403
            
        print(f"Getting stats for artist: {current_user}")
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True, buffered=True)
        
        # Get artist's total artworks
        cursor.execute("""
            SELECT COUNT(*) as total_artworks
            FROM artworks
            WHERE artist_id = %s
        """, (current_user['user_id'],))
        total_result = cursor.fetchone()
        total_artworks = total_result['total_artworks'] if total_result else 0
        
        print(f"Found {total_artworks} artworks for artist {current_user['user_id']}")
        
        # Use a new cursor for each query
        sales_count_cursor = conn.cursor(dictionary=True, buffered=True)
        sales_details_cursor = conn.cursor(dictionary=True, buffered=True)
        
        # Check if there are any sales
        try:
            sales_count_cursor.execute("""
                SELECT COUNT(*) as sale_count
                FROM artworks a
                JOIN order_items oi ON a.artwork_id = oi.artwork_id
                JOIN orders o ON oi.order_id = o.order_id
                WHERE a.artist_id = %s
            """, (current_user['user_id'],))
            sale_result = sales_count_cursor.fetchone()
            sale_count = sale_result['sale_count'] if sale_result else 0
        except Exception as e:
            print(f"Error counting sales: {e}")
            sale_count = 0
        finally:
            sales_count_cursor.close()
            
        sales_results = []
        
        if sale_count > 0:
            # Get artist's sold artworks
            try:
                sales_details_cursor.execute("""
                    SELECT a.title, oi.quantity, c.name as customer_name, o.date
                    FROM artworks a
                    JOIN order_items oi ON a.artwork_id = oi.artwork_id
                    JOIN orders o ON oi.order_id = o.order_id
                    JOIN customers c ON o.customer_id = c.customer_id
                    WHERE a.artist_id = %s
                """, (current_user['user_id'],))
                sales_results = sales_details_cursor.fetchall()
                
                # Convert datetime objects to ISO format strings
                for sale in sales_results:
                    if isinstance(sale.get('date'), datetime):
                        sale['date'] = sale['date'].isoformat()
                    elif sale.get('date'):
                        sale['date'] = str(sale['date'])
                    else:
                        sale['date'] = 'N/A'
            except Exception as e:
                print(f"Error getting sales details: {e}")
                sales_results = []
            finally:
                sales_details_cursor.close()
        
        return jsonify({
            'total_artworks': total_artworks,
            'sales': sales_results
        }), 200
    except Exception as e:
        print(f"Error in artist stats: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

@dashboard_bp.route('/dashboard/customer/orders', methods=['GET'])
@token_required
def get_customer_orders(current_user):
    conn = None
    cursor = None
    try:
        if current_user['role'] != 'customer':
            return jsonify({'error': 'Unauthorized'}), 403
            
        print(f"Getting orders for customer: {current_user}")
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True, buffered=True)
        
        # Check if orders table exists and has data for this customer
        cursor.execute("""
            SELECT COUNT(*) as order_count 
            FROM orders 
            WHERE customer_id = %s
        """, (current_user['user_id'],))
        order_count_result = cursor.fetchone()
        order_count = order_count_result['order_count'] if order_count_result else 0
        
        print(f"Found {order_count} orders for customer {current_user['user_id']}")
        
        if order_count == 0:
            return jsonify({'orders': []}), 200
        
        # Create a new cursor for orders query
        orders_cursor = conn.cursor(dictionary=True, buffered=True)
        
        # Get customer's orders with items and shipping details
        orders_cursor.execute("""
            SELECT * FROM orders 
            WHERE customer_id = %s 
            ORDER BY date DESC
        """, (current_user['user_id'],))
        orders = orders_cursor.fetchall()
        orders_cursor.close()
        
        order_results = []
        for order in orders:
            # Create new cursors for each sub-query
            items_cursor = conn.cursor(dictionary=True, buffered=True)
            shipping_cursor = conn.cursor(dictionary=True, buffered=True)
            
            # Get order items
            try:
                items_cursor.execute("""
                    SELECT oi.*, a.title as artwork_title, ar.name as artist_name
                    FROM order_items oi
                    JOIN artworks a ON oi.artwork_id = a.artwork_id
                    JOIN artists ar ON a.artist_id = ar.artist_id
                    WHERE oi.order_id = %s
                """, (order['order_id'],))
                items = items_cursor.fetchall()
            except Exception as e:
                print(f"Error getting order items: {e}")
                items = []
            finally:
                items_cursor.close()
            
            # Get shipping details if available
            try:
                shipping_cursor.execute("""
                    SELECT * FROM shipping_details
                    WHERE order_id = %s
                """, (order['order_id'],))
                shipping = shipping_cursor.fetchone()
            except Exception as e:
                print(f"Error getting shipping details: {e}")
                shipping = None
            finally:
                shipping_cursor.close()
            
            # Create order entries
            for item in items:
                order_entry = {
                    'order_id': order['order_id'],
                    'date': order['date'].isoformat() if hasattr(order.get('date', None), 'isoformat') else str(order.get('date', 'N/A')),
                    'total_amount': order.get('total_amount', 0),
                    'status': order.get('status', 'Unknown'),
                    'artwork_title': item.get('artwork_title', 'Unknown'),
                    'artist_name': item.get('artist_name', 'Unknown'),
                    'quantity': item.get('quantity', 0),
                    'price': item.get('price', 0)
                }
                
                if shipping:
                    order_entry['shipping_address'] = shipping.get('address', 'N/A')
                    order_entry['shipping_phone'] = shipping.get('phone_number', 'N/A')
                else:
                    order_entry['shipping_address'] = 'N/A'
                    order_entry['shipping_phone'] = 'N/A'
                
                order_results.append(order_entry)
        
        return jsonify({'orders': order_results}), 200
    except Exception as e:
        print(f"Error in customer orders: {str(e)}")
        return jsonify({'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close() 