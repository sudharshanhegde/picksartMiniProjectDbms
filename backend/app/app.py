from flask import Flask, jsonify, request
from flask_cors import CORS
from .config import Config, get_db_connection
from .routes.auth_routes import auth_routes
from .routes.artist_routes import artist_routes
from .routes.gallery_routes import gallery_routes
from .routes.customer_routes import customer_routes
from .routes.artwork_routes import artwork_routes
from .routes.order_routes import order_routes
from .routes.order_item_routes import order_item_routes
#these all are just importing the routes from the routes folder
from .routes.cart_routes import cart
from .utils import CustomJSONEncoder
#customJSONEncoder is used to serialize the data into json format
import logging
from logging.handlers import RotatingFileHandler
#RotatingFileHandler is used to log the data into a file
#logging is important because it helps in debugging the code
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    #this is used to get the configuration from the config file
    #this is the main file that runs the application
    
    # Set up JSON encoder
    app.json_encoder = CustomJSONEncoder
    
    # Configure logging
    if not os.path.exists('logs'):
        os.mkdir('logs')
        #this is used to create a folder called logs in the root directory
    file_handler = RotatingFileHandler('logs/picksart.log', maxBytes=10240, backupCount=10)
    #rotating file handler is used to log the data into a file called picksart.log
    #maxBytes is the maximum size of the file that can be logged
    #backupCount is the number of files that can be logged
    #rotating file handler takes file name, maxBytes and backupCount as arguments
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    #this is used to format the data that is being logged
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
    app.logger.info('PicksArt startup')

    # Configure CORS
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)
    #CORS SETUP is done here
    #this is used to allow the frontend to access the backend
    #resources is the url that is being accessed
    #origins is the url that is allowed to access the backend
    # * signifies that all the urls are allowed to access the backend
    #supports_credentials is set to True to allow the frontend to send cookies to the backend
    #cors takes app and resources as arguments
    # Error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        app.logger.error(f'Page not found: {request.url}')
        return jsonify({"error": "Resource not found"}), 404

    @app.errorhandler(500)
    def internal_error(error):
        app.logger.error(f'Server Error: {error}')
        return jsonify({"error": "Internal server error"}), 500

    @app.errorhandler(Exception)
    def unhandled_exception(e):
        app.logger.error(f'Unhandled Exception: {str(e)}')
        return jsonify({"error": "An unexpected error has occurred"}), 500
    #all these are various error handlers that are used to handle the errors that occur in the application
    #these are used to log the errors and return a json response with the error message and status code
    # Define a homepage route
    @app.route('/')
    def home():
        return jsonify({
            "message": "Welcome to PicksArt API!",
            "version": "1.0",
            "endpoints": {
                "auth": {
                    "login": "/api/auth/login",
                    "signup": "/api/auth/signup"
                },
                "artists": "/api/artists",
                "galleries": "/api/galleries",
                "customers": "/api/customers",
                "artworks": "/api/artworks",
                "orders": "/api/orders"
            }
        })
    #front end will access the backend through these endpoints
    #these are the various endpoints that are available in the application
    #endpoints are the urls that can be accessed by the frontend
    # Register Blueprints with URL Prefix
    app.register_blueprint(auth_routes, url_prefix='/api')
    app.register_blueprint(artist_routes, url_prefix='/api')
    app.register_blueprint(gallery_routes, url_prefix='/api')
    app.register_blueprint(customer_routes, url_prefix='/api')
    app.register_blueprint(artwork_routes, url_prefix='/api')
    app.register_blueprint(order_routes, url_prefix='/api')
    app.register_blueprint(order_item_routes, url_prefix='/api')
    app.register_blueprint(cart, url_prefix='/api')
    #register_blueprint is used to register the blueprints with the URL prefix
    #this is used to register the routes with the URL prefix
    #this is used to define the URL prefix for the routes
    #this is the main file that runs the application
    return app

if __name__ == '__main__':
    # Run on port 8000 to match frontend expectations
    app.run(host='0.0.0.0', port=8000, debug=app.config['ENV'] == 'development')
#run the application on port 8000
#these environment is still in the development stage 
#run takes host, port and debug as arguments
#port signifies the port number on which the application is running
#host signifies the host on which the application is running
#debug is set to True to enable debugging mode