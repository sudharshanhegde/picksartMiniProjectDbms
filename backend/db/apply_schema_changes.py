import mysql.connector
import os
import sys

# Add parent directory to path so we can import from config
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from app.config import Config
except ImportError:
    # Fallback if the import doesn't work
    class Config:
        MYSQL_HOST = 'localhost'
        MYSQL_USER = 'root'
        MYSQL_PASSWORD = ''
        MYSQL_DB = 'picksart'

def get_db_connection():
    return mysql.connector.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB
    )

def execute_query(cursor, query):
    try:
        cursor.execute(query)
        print(f"Executed: {query}")
        return True
    except mysql.connector.Error as err:
        print(f"Error executing query: {err}")
        return False

def apply_schema_changes():
    conn = None
    cursor = None
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # Check if address column exists
        cursor.execute("SHOW COLUMNS FROM customers LIKE 'address'")
        address_exists = cursor.fetchone() is not None
        
        # Check if phone_number column exists
        cursor.execute("SHOW COLUMNS FROM customers LIKE 'phone_number'")
        phone_number_exists = cursor.fetchone() is not None
        
        # Add columns if they don't exist
        if not address_exists:
            execute_query(cursor, "ALTER TABLE customers ADD COLUMN address VARCHAR(255)")
        else:
            print("Column 'address' already exists in customers table")
            
        if not phone_number_exists:
            execute_query(cursor, "ALTER TABLE customers ADD COLUMN phone_number VARCHAR(20)")
        else:
            print("Column 'phone_number' already exists in customers table")
        
        # Check if shipping_details table exists
        cursor.execute("SHOW TABLES LIKE 'shipping_details'")
        shipping_table_exists = cursor.fetchone() is not None
        
        if not shipping_table_exists:
            # Create shipping_details table
            execute_query(cursor, """
                CREATE TABLE IF NOT EXISTS shipping_details (
                    shipping_id INT PRIMARY KEY AUTO_INCREMENT,
                    order_id INT NOT NULL,
                    address VARCHAR(255) NOT NULL,
                    phone_number VARCHAR(20) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (order_id) REFERENCES orders(order_id)
                )
            """)
        else:
            print("Table 'shipping_details' already exists")
        
        conn.commit()
        print("Schema changes applied successfully")
        
    except mysql.connector.Error as err:
        print(f"Error: {err}")
    finally:
        if cursor:
            cursor.close()
        if conn:
            conn.close()

if __name__ == "__main__":
    apply_schema_changes() 