import os
#os is used to access the environment variables
from mysql.connector import pooling
#pooling is used to create a connection pool to the database
from dotenv import load_dotenv
#load_dotenv is used to load the environment variables from the .env file

# Load environment variables from .env file
load_dotenv()

class Config:
    MYSQL_HOST = os.environ.get('MYSQL_HOST', 'localhost')
    MYSQL_USER = os.environ.get('MYSQL_USER', 'root')
    MYSQL_PASSWORD = os.environ.get('MYSQL_PASSWORD', 'sudhi@46') 
    MYSQL_DB = os.environ.get('MYSQL_DB', 'picksart')
    SECRET_KEY = os.environ.get('SECRET_KEY', 'sudhi123')
    ENV = os.environ.get('FLASK_ENV', 'development')

# Database configuration
# The dbconfig dictionary contains the configuration parameters for the MySQL database connection.
#pool size is the number of connections in the pool
#pool_name is the name of the pool
dbconfig = {
    "host": Config.MYSQL_HOST,
    "user": Config.MYSQL_USER,
    "password": Config.MYSQL_PASSWORD,
    "database": Config.MYSQL_DB,
    "pool_name": "mypool",
    "pool_size": 20,  # Increase pool size from 5 to 20
    "pool_reset_session": True  # Reset session after returning to pool
}
# Create a connection pool
# The pool_name parameter is used to identify the pool, and the pool_size parameter is used to set the number of connections in the pool.   


try:
    connection_pool = pooling.MySQLConnectionPool(**dbconfig)
    #The MySQLConnectionPool class is used to create a connection pool to the MySQL database.
    ##dbconfig is the dictionary which contains the configuration parameters for the MySQL database connection.
    #The ** operator is used to unpack the dictionary and pass the key-value pairs as keyword arguments to the MySQLConnectionPool constructor.
except Exception as e:
    print(f"Error creating connection pool: {e}")
    connection_pool = None
    #If an exception occurs while creating the connection pool, the connection_pool variable is set to None.

def get_db_connection():
    try:
        if connection_pool:
            return connection_pool.get_connection()
        else:
            raise Exception("Connection pool not initialized")
    except Exception as e:
        print(f"Error getting database connection: {e}")
        raise 