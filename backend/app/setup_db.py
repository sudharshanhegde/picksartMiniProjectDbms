from config import get_db_connection
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def setup_database():
    # SQL statements to create tables
    create_tables_sql = """
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
        user_id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Artists table
    CREATE TABLE IF NOT EXISTS artists (
        artist_id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        bio TEXT,
        specialization VARCHAR(255),
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

    -- Artworks table
    CREATE TABLE IF NOT EXISTS artworks (
        artwork_id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        artist_id INT,
        image_url VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (artist_id) REFERENCES artists(artist_id)
    );
    """

    # Sample data for testing
    sample_data_sql = """
    -- Insert sample artists
    INSERT IGNORE INTO artists (name, email, bio, specialization) VALUES
    ('John Smith', 'john@example.com', 'Contemporary artist specializing in abstract art', 'Abstract'),
    ('Maria Garcia', 'maria@example.com', 'Traditional oil painting artist', 'Oil Painting'),
    ('David Lee', 'david@example.com', 'Digital artist and illustrator', 'Digital Art');

    -- Insert sample artworks
    INSERT IGNORE INTO artworks (title, description, price, artist_id, image_url) 
    SELECT 'Abstract Harmony', 'A vibrant abstract composition', 1200.00, artist_id, 'https://source.unsplash.com/random/800x600?abstract'
    FROM artists WHERE email = 'john@example.com'
    UNION ALL
    SELECT 'Sunset Valley', 'Traditional oil painting of a valley at sunset', 2500.00, artist_id, 'https://source.unsplash.com/random/800x600?landscape'
    FROM artists WHERE email = 'maria@example.com'
    UNION ALL
    SELECT 'Digital Dreams', 'Modern digital art piece', 800.00, artist_id, 'https://source.unsplash.com/random/800x600?digital'
    FROM artists WHERE email = 'david@example.com';
    """

    try:
        # Get database connection
        conn = get_db_connection()
        cursor = conn.cursor()

        # Split SQL statements and execute them one by one
        for statement in create_tables_sql.split(';'):
            if statement.strip():
                cursor.execute(statement)
                print(f"Executed: {statement[:50]}...")

        # Insert sample data
        for statement in sample_data_sql.split(';'):
            if statement.strip():
                cursor.execute(statement)
                print(f"Executed: {statement[:50]}...")

        conn.commit()
        print("Database setup completed successfully!")

    except Exception as e:
        print(f"Error setting up database: {str(e)}")
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    setup_database() 