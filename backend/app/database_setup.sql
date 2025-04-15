-- Create database if not exists
CREATE DATABASE IF NOT EXISTS picksarrt;
USE picksarrt;

-- Drop tables if exist (in reverse order of dependencies)
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS artworks;
DROP TABLE IF EXISTS galleries;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS artists;

-- Artists table
CREATE TABLE artists (
    artist_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    phone int,
    adress varchar(50),
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Galleries table
CREATE TABLE galleries (
    gallery_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    location VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Artworks table (no gallery_id as per final version)
CREATE TABLE artworks (
    artwork_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist_id INT,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('available', 'sold', 'reserved') DEFAULT 'available',
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE SET NULL
);

-- Orders table
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT,
    status ENUM('pending', 'confirmed', 'delivered', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id) ON DELETE SET NULL
);

-- Order items table
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    artwork_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    price_at_time DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE RESTRICT,
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE RESTRICT
);

-- Create a new shipping_details table to store order-specific shipping information
CREATE TABLE IF NOT EXISTS shipping_details (
    shipping_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
); 
-- Sample artists
INSERT IGNORE INTO artists (name, email, password_hash) VALUES
('John Smith', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFX.gtkn.4xGxK2'),
('Maria Garcia', 'maria@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFX.gtkn.4xGxK2'),
('David Lee', 'david@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFX.gtkn.4xGxK2');

-- Sample customers
INSERT IGNORE INTO customers (name, email, password_hash) VALUES
('Alice Johnson', 'alice@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFX.gtkn.4xGxK2');

-- Sample galleries
INSERT IGNORE INTO galleries (name, email, password_hash, description, location) VALUES
('Modern Arts Gallery', 'contact@moderarts.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFX.gtkn.4xGxK2', 'Contemporary art gallery featuring emerging artists', 'New York, NY');

-- Sample artworks
INSERT IGNORE INTO artworks (title, artist_id, description, price, image_url)
SELECT 'Abstract Harmony', artist_id, 'A vibrant abstract composition', 1200.00, 'https://source.unsplash.com/random/800x600?abstract'
FROM artists WHERE email = 'john@example.com'
UNION ALL
SELECT 'Sunset Valley', artist_id, 'Traditional oil painting of a valley at sunset', 2500.00, 'https://source.unsplash.com/random/800x600?landscape'
FROM artists WHERE email = 'maria@example.com'
UNION ALL
SELECT 'Digital Dreams', artist_id, 'Modern digital art piece', 800.00, 'https://source.unsplash.com/random/800x600?digital'
FROM artists WHERE email = 'david@example.com';

-- View all data
SELECT * FROM artists;
SELECT * FROM customers;
SELECT * FROM galleries;
SELECT * FROM artworks;
SELECT * FROM orders;
SELECT * FROM order_items;
