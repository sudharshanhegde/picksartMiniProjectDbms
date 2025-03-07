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
from .routes.cart_routes import cart
from .utils import CustomJSONEncoder
import logging
from logging.handlers import RotatingFileHandler
import os

# Initialize Flask app
app = Flask(__name__)
app.config.from_object(Config)
app.json_encoder = CustomJSONEncoder  # Use custom JSON encoder

# Configure logging
if not os.path.exists('logs'):
    os.mkdir('logs')
file_handler = RotatingFileHandler('logs/picksart.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('PicksArt startup')

# Configure CORS
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

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

# Register Blueprints with URL Prefix
app.register_blueprint(auth_routes, url_prefix='/api')
app.register_blueprint(artist_routes, url_prefix='/api')
app.register_blueprint(gallery_routes, url_prefix='/api')
app.register_blueprint(customer_routes, url_prefix='/api')
app.register_blueprint(artwork_routes, url_prefix='/api')
app.register_blueprint(order_routes, url_prefix='/api')
app.register_blueprint(order_item_routes, url_prefix='/api')
app.register_blueprint(cart, url_prefix='/api')

if __name__ == '__main__':
    # Run on port 8000 to match frontend expectations
    app.run(host='0.0.0.0', port=8000, debug=app.config['ENV'] == 'development')
