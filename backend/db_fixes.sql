-- Make shipping_address nullable in orders table
ALTER TABLE orders MODIFY COLUMN shipping_address text NULL;

-- Add quantity column to order_items
ALTER TABLE order_items ADD COLUMN quantity INT NOT NULL DEFAULT 1;

-- Drop existing foreign keys
ALTER TABLE order_items DROP FOREIGN KEY order_items_ibfk_1;
ALTER TABLE order_items DROP FOREIGN KEY order_items_ibfk_2;

-- Make foreign key columns non-nullable in order_items
ALTER TABLE order_items MODIFY COLUMN order_id INT NOT NULL;
ALTER TABLE order_items MODIFY COLUMN artwork_id INT NOT NULL;

-- Recreate foreign keys with RESTRICT instead of SET NULL
ALTER TABLE order_items 
ADD CONSTRAINT order_items_ibfk_1 
FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE RESTRICT;

ALTER TABLE order_items 
ADD CONSTRAINT order_items_ibfk_2 
FOREIGN KEY (artwork_id) REFERENCES artworks(artwork_id) ON DELETE RESTRICT;

-- Set default value for total_amount in orders
ALTER TABLE orders MODIFY COLUMN total_amount decimal(10,2) NOT NULL DEFAULT 0.00;