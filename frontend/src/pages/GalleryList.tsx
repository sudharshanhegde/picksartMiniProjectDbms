import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress
} from '@mui/material';
import axiosInstance from '../utils/axios';

interface Gallery {
  gallery_id: number;
  name: string;
  email: string;
  description: string;
  location: string;
}

const GalleryList: React.FC = () => {
  const [galleries, setGalleries] = useState<Gallery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchGalleries = async () => {
      try {
        const response = await axiosInstance.get('/api/galleries');
        setGalleries(response.data);
      } catch (err: any) {
        setError(err.response?.data?.error || 'Failed to fetch galleries');
      } finally {
        setLoading(false);
      }
    };

    fetchGalleries();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Art Galleries
        </Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Grid container spacing={3}>
          {galleries.map((gallery) => (
            <Grid item xs={12} sm={6} md={4} key={gallery.gallery_id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h2">
                    {gallery.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {gallery.description || 'No description available'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    📍 {gallery.location}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    component={Link} 
                    to={`/galleries/${gallery.gallery_id}`}
                  >
                    View Gallery
                  </Button>
                  <Button 
                    size="small" 
                    href={`mailto:${gallery.email}`}
                  >
                    Contact
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {galleries.length === 0 && !error && (
          <Box textAlign="center" mt={4}>
            <Typography variant="h6" color="text.secondary">
              No galleries found
            </Typography>
            <Button
              component={Link}
              to="/gallery-registration"
              variant="contained"
              sx={{ mt: 2 }}
            >
              Register Your Gallery
            </Button>
          </Box>
        )}
      </Box>
    </Container>
  );
};

export default GalleryList; 