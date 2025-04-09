from flask import current_app
from mysql.connector import pooling
from .config import Config, get_db_connection

# This is a placeholder for the db object that routes can use
# In our case, we'll use the get_db_connection() function directly
db = None

def init_db(app):
    """
    Initialize the database connection pool.
    This function is called when the application starts.
    """
    # The connection pool is already initialized in config.py
    # We just need to make sure the app has access to the configuration
    app.config.from_object(Config)
    
    # Test the connection
    try:
        conn = get_db_connection()
        conn.close()
        print("Database connection successful")
    except Exception as e:
        print(f"Error connecting to database: {e}")
        raise 