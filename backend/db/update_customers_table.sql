-- Add address and phone_number columns to the customers table
ALTER TABLE customers 
ADD COLUMN address VARCHAR(255),
ADD COLUMN phone_number VARCHAR(20);

-- Create a new shipping_details table to store order-specific shipping information
CREATE TABLE IF NOT EXISTS shipping_details (
    shipping_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id INT NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id)
); 