import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Divider
} from '@mui/material';
import ArtworkForm from '../components/ArtworkForm';
import { fetchArtworks } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface Artwork {
  artwork_id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  artist_id: number;
}

function ArtistDashboard() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    loadArtworks();
  }, []);

  const loadArtworks = async () => {
    try {
      if (user?.artist_id) {
        const data = await fetchArtworks();
        // Filter artworks to show only the current artist's works
        const artistArtworks = data.filter((artwork: any) => artwork.artist_id === user.artist_id);
        setArtworks(artistArtworks);
      }
    } catch (err: any) {
      setError('Failed to load artworks');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading your dashboard..." />;
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Artist Dashboard
        </Typography>
        
        <ArtworkForm onArtworkAdded={loadArtworks} />
        
        <Divider sx={{ my: 4 }} />
        
        <Typography variant="h5" component="h2" gutterBottom>
          Your Artworks
        </Typography>
        
        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={3}>
          {artworks.map((artwork: any) => (
            <Grid item xs={12} sm={6} md={4} key={artwork.artwork_id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={artwork.image_url}
                  alt={artwork.title}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {artwork.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {artwork.description}
                  </Typography>
                  <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
                    ${artwork.price}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Container>
  );
}

export default ArtistDashboard; 