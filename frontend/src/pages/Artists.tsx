import { Container, Typography, Box, Grid, Card, CardContent, CardMedia, Avatar, Alert } from '@mui/material';
import { useState, useEffect } from 'react';
import { fetchArtists } from '../services/api';
import { Artist } from '../types/api';
import LoadingSpinner from '../components/LoadingSpinner';
import PageLayout from '../components/PageLayout';

function Artists() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    const loadArtists = async () => {
      try {
        setLoading(true);
        const data = await fetchArtists();
        setArtists(data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load artists. Please try again later.');
        console.error('Error loading artists:', err);
      } finally {
        setLoading(false);
      }
    };

    loadArtists();
  }, []);

  if (loading) {
    return (
      <PageLayout>
        <Container maxWidth="lg">
          <LoadingSpinner message="Loading artists..." />
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Artists
          </Typography>
          <Typography variant="body1" gutterBottom sx={{ mb: 4 }}>
            Discover talented artists and their unique creative journeys.
          </Typography>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {artists.length === 0 && !error ? (
            <Typography variant="body1" color="text.secondary" align="center">
              No artists available at the moment.
            </Typography>
          ) : (
            <Grid container spacing={3}>
              {artists.map((artist) => (
                <Grid item xs={12} sm={6} md={4} key={artist.id}>
                  <Card>
                    {artist.imageUrl ? (
                      <CardMedia
                        component="img"
                        height="200"
                        image={artist.imageUrl}
                        alt={artist.name}
                      />
                    ) : (
                      <Box
                        sx={{
                          height: 200,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'grey.100'
                        }}
                      >
                        <Avatar
                          sx={{
                            width: 100,
                            height: 100,
                            fontSize: '2rem'
                          }}
                        >
                          {artist.name.charAt(0)}
                        </Avatar>
                      </Box>
                    )}
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        {artist.name}
                      </Typography>
                      {artist.bio && (
                        <Typography variant="body2" color="text.secondary">
                          {artist.bio}
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Container>
    </PageLayout>
  );
}

export default Artists; 