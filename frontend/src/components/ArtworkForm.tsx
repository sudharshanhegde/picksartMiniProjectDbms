import { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Typography,
  Alert,
  InputAdornment,
  Grid,
  MenuItem,
  Card,
  CardMedia
} from '@mui/material';
import axiosInstance from '../utils/axios';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface ArtworkFormData {
  title: string;
  description: string;
  price: string;
  image_url: string;
}

interface ArtworkFormProps {
  onArtworkAdded?: () => void;
}

// Sample image URLs from Unsplash
const sampleImages = [
  {
    url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6b5',
    label: 'Abstract Art'
  },
  {
    url: 'https://images.unsplash.com/photo-1578926288207-a90a5366759d',
    label: 'Oil Painting'
  },
  {
    url: 'https://images.unsplash.com/photo-1579783901586-d88db74b4fe4',
    label: 'Modern Art'
  },
  {
    url: 'https://images.unsplash.com/photo-1579783928621-7a13d66a62d1',
    label: 'Digital Art'
  }
];

function ArtworkForm({ onArtworkAdded }: ArtworkFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const user = useSelector((state: RootState) => state.auth.user);
  const [formData, setFormData] = useState<ArtworkFormData>({
    title: '',
    description: '',
    price: '',
    image_url: ''
  });

  useEffect(() => {
    // Debug logging for auth state
    console.log('Auth state:', {
      user,
      token: localStorage.getItem('token'),
      isArtist: user?.role === 'artist',
      role: user?.role
    });
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSampleImageSelect = (url: string) => {
    setFormData(prev => ({
      ...prev,
      image_url: url
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    console.log('Submit attempt - User state:', {
      id: user?.id,
      artist_id: user?.artist_id,
      role: user?.role,
      token: localStorage.getItem('token')
    });

    if (!user) {
      setError('You must be logged in to upload artworks');
      setLoading(false);
      return;
    }

    if (user.role !== 'artist') {
      setError(`Only artists can upload artworks. Your role is: ${user.role}`);
      setLoading(false);
      return;
    }

    try {
      const priceNum = parseFloat(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        throw new Error('Please enter a valid price');
      }

      try {
        new URL(formData.image_url);
      } catch {
        throw new Error('Please enter a valid image URL');
      }

      const payload = {
        ...formData,
        price: priceNum,
        artist_id: user.artist_id || user.id
      };

      console.log('Request payload:', payload);
      console.log('Request headers:', {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json'
      });

      const response = await axiosInstance.post('/api/artworks', payload);
      console.log('Server response:', response.data);

      setSuccess('Artwork added successfully!');
      setFormData({
        title: '',
        description: '',
        price: '',
        image_url: ''
      });
      
      if (onArtworkAdded) {
        onArtworkAdded();
      }
    } catch (err: any) {
      console.error('Error details:', {
        response: err.response?.data,
        status: err.response?.status,
        message: err.message,
        headers: err.response?.headers
      });
      setError(err.response?.data?.error || 'Failed to add artwork. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Add New Artwork
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Artwork Title"
              name="title"
              value={formData.title}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              multiline
              rows={4}
              id="description"
              label="Description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="price"
              label="Price"
              name="price"
              type="number"
              value={formData.price}
              onChange={handleChange}
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              id="image_url"
              label="Image URL"
              name="image_url"
              type="url"
              value={formData.image_url}
              onChange={handleChange}
              helperText="Enter a valid image URL or select from samples below"
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3 }}
              disabled={loading}
            >
              {loading ? 'Adding...' : 'Add Artwork'}
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Typography variant="h6" gutterBottom>
            Preview
          </Typography>
          {formData.image_url && (
            <Card sx={{ mb: 2 }}>
              <CardMedia
                component="img"
                height="300"
                image={formData.image_url}
                alt="Artwork preview"
                sx={{ objectFit: 'cover' }}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Invalid+Image+URL';
                }}
              />
            </Card>
          )}

          <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
            Sample Images
          </Typography>
          <Grid container spacing={1}>
            {sampleImages.map((image, index) => (
              <Grid item xs={6} key={index}>
                <Card 
                  sx={{ 
                    cursor: 'pointer',
                    border: formData.image_url === image.url ? '2px solid #1976d2' : 'none'
                  }}
                  onClick={() => handleSampleImageSelect(image.url)}
                >
                  <CardMedia
                    component="img"
                    height="100"
                    image={image.url}
                    alt={image.label}
                    sx={{ objectFit: 'cover' }}
                  />
                </Card>
                <Typography variant="caption" display="block" textAlign="center">
                  {image.label}
                </Typography>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  );
}

export default ArtworkForm; 