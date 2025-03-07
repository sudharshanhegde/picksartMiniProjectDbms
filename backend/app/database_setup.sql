-- Create database if it doesn't exist
DROP DATABASE IF EXISTS picksarrt;
CREATE DATABASE IF NOT EXISTS picksarrt;
USE picksarrt;

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
    artist_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    bio TEXT,
    specialization VARCHAR(255),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE IF NOT EXISTS customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    shipping_address TEXT,
    billing_address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Galleries table
CREATE TABLE IF NOT EXISTS galleries (
    gallery_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Artworks table
CREATE TABLE IF NOT EXISTS artworks (
    artwork_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    artist_id INT,
    gallery_id INT,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    status ENUM('available', 'sold', 'reserved') DEFAULT 'available',
    image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id) ON DELETE SET NULL,
    FOREIGN KEY (gallery_id) REFERENCES galleries(gallery_id) ON DELETE SET NULL
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
    order_id INT PRIMARY KEY AUTO_INCREMENT,
    customer_id INT NOT NULL,
    status ENUM('pending', 'processing', 'completed', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Order Items table
CREATE TABLE IF NOT EXISTS order_items (
    order_item_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    artwork_id INT NOT NULL,
    quantity INT NOT NULL,
    price_at_time DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id),
    FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id)
);

-- Insert sample artists
INSERT IGNORE INTO artists (name, email, password_hash, bio, specialization) VALUES
('John Smith', 'john@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFX.gtkn.4xGxK2', 'Contemporary artist specializing in abstract art', 'Abstract'),
('Maria Garcia', 'maria@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFX.gtkn.4xGxK2', 'Traditional oil painting artist', 'Oil Painting'),
('David Lee', 'david@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFX.gtkn.4xGxK2', 'Digital artist and illustrator', 'Digital Art');

-- Insert sample customers
INSERT IGNORE INTO customers (name, email, password_hash, shipping_address, billing_address) VALUES
('Alice Johnson', 'alice@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFX.gtkn.4xGxK2', '123 Main St, New York, NY 10001', '123 Main St, New York, NY 10001');

-- Insert sample gallery
INSERT IGNORE INTO galleries (name, email, password_hash, description, location, contact_email, contact_phone) VALUES
('Modern Arts Gallery', 'gallery@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFX.gtkn.4xGxK2', 'Contemporary art gallery featuring emerging artists', 'New York, NY', 'contact@moderarts.com', '212-555-0123');

-- Insert sample artworks
INSERT IGNORE INTO artworks (title, artist_id, gallery_id, description, price, image_url) 
SELECT 'Abstract Harmony', artist_id, 1, 'A vibrant abstract composition', 1200.00, 'https://source.unsplash.com/random/800x600?abstract'
FROM artists WHERE email = 'john@example.com'
UNION ALL
SELECT 'Sunset Valley', artist_id, 1, 'Traditional oil painting of a valley at sunset', 2500.00, 'https://source.unsplash.com/random/800x600?landscape'
FROM artists WHERE email = 'maria@example.com'
UNION ALL
SELECT 'Digital Dreams', artist_id, 1, 'Modern digital art piece', 800.00, 'https://source.unsplash.com/random/800x600?digital'
FROM artists WHERE email = 'david@example.com';

-- Verify password hashes
SELECT email, password_hash FROM artists WHERE email = 'john@example.com';
SELECT email, password_hash FROM galleries WHERE email = 'gallery@example.com'; 