import os
from mysql.connector import pooling
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Config:
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'sudhi@46')  # Default empty for safety
    MYSQL_DB = os.environ.get('MYSQL_DB', 'picksart')
    SECRET_KEY = os.environ.get('SECRET_KEY', 'sudhi123')
    ENV = os.environ.get('FLASK_ENV', 'development')

# Database configuration
dbconfig = {
    "host": Config.MYSQL_HOST,
    "user": Config.MYSQL_USER,
    "password": Config.MYSQL_PASSWORD,
    "database": Config.MYSQL_DB,
    "pool_name": "mypool",
    "pool_size": 5
}

try:
    connection_pool = pooling.MySQLConnectionPool(**dbconfig)
except Exception as e:
    print(f"Error creating connection pool: {e}")
    connection_pool = None

def get_db_connection():
    try:
        if connection_pool:
            return connection_pool.get_connection()
        else:
            raise Exception("Connection pool not initialized")
    except Exception as e:
        print(f"Error getting database connection: {e}")
        raise 