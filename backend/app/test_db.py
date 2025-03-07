# filepath: /C:/miniproject/backend/app/test_db.py
from config import get_db_connection

def test_connection():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        
        # Test artists table
        cursor.execute("SELECT * FROM artists")
        artists = cursor.fetchall()
        print("\nArtists in database:")
        for artist in artists:
            print(f"- {artist['name']} ({artist['email']})")
        
        # Test artworks table
        cursor.execute("SELECT * FROM artworks")
        artworks = cursor.fetchall()
        print("\nArtworks in database:")
        for artwork in artworks:
            print(f"- {artwork['title']} (${artwork['price']})")
        
        # Test galleries table
        cursor.execute("SELECT * FROM galleries")
        galleries = cursor.fetchall()
        print("\nGalleries in database:")
        for gallery in galleries:
            print(f"- {gallery['name']} ({gallery['location']})")
            
        cursor.close()
        conn.close()
        print("\nDatabase connection test successful!")
        
    except Exception as e:
        print(f"\nError connecting to database: {str(e)}")

if __name__ == "__main__":
    test_connection()