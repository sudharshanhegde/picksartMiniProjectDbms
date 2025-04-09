import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Slider,
  Paper
} from '@mui/material';
import { fetchArtworks } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { useDispatch } from 'react-redux';
import { addToCart } from '../store/slices/cartSlice';
import PageLayout from '../components/PageLayout';

interface Artwork {
  artwork_id: number;
  title: string;
  description: string;
  price: number;
  image_url: string;
  artist_name: string;
  status: string;
}

function BrowseArt() {
  const dispatch = useDispatch();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [priceRange, setPriceRange] = useState<number[]>([0, 10000]);

  useEffect(() => {
    loadArtworks();
  }, []);

  const loadArtworks = async () => {
    try {
      const data = await fetchArtworks();
      setArtworks(data);
    } catch (err: any) {
      setError('Failed to load artworks');
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedArtworks = () => {
    return artworks
      .filter(artwork => 
        // Filter by search term
        artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        artwork.artist_name.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(artwork =>
        // Filter by price range
        artwork.price >= priceRange[0] && artwork.price <= priceRange[1]
      )
      .sort((a, b) => {
        // Sort by selected option
        switch (sortBy) {
          case 'priceAsc':
            return a.price - b.price;
          case 'priceDesc':
            return b.price - a.price;
          case 'newest':
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          default:
            return 0;
        }
      });
  };

  const handleAddToCart = (artwork: Artwork) => {
    dispatch(addToCart({
      artwork_id: artwork.artwork_id,
      title: artwork.title,
      price: artwork.price,
      image_url: artwork.image_url,
      artist_name: artwork.artist_name,
    }));
  };

  if (loading) {
    return <LoadingSpinner message="Loading artworks..." />;
  }

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Browse Artworks
        </Typography>

        {/* Filters and Search */}
        <Paper sx={{ p: 2, mb: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Search artworks"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, description, or artist"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel>Sort by</InputLabel>
                <Select
                  value={sortBy}
                  label="Sort by"
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <MenuItem value="newest">Newest First</MenuItem>
                  <MenuItem value="priceAsc">Price: Low to High</MenuItem>
                  <MenuItem value="priceDesc">Price: High to Low</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography gutterBottom>Price Range</Typography>
              <Slider
                value={priceRange}
                onChange={(_, newValue) => setPriceRange(newValue as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={10000}
                step={100}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">${priceRange[0]}</Typography>
                <Typography variant="body2">${priceRange[1]}</Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Typography color="error" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={3}>
          {filteredAndSortedArtworks().map((artwork) => (
            <Grid item xs={12} sm={6} md={4} key={artwork.artwork_id}>
              <Card>
                <CardMedia
                  component="img"
                  height="300"
                  image={artwork.image_url}
                  alt={artwork.title}
                  sx={{ objectFit: 'cover' }}
                  onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                    e.currentTarget.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                  }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {artwork.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    by {artwork.artist_name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {artwork.description}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${artwork.price.toLocaleString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    View Details
                  </Button>
                  <Button 
                    size="small" 
                    color="primary"
                    onClick={() => handleAddToCart(artwork)}
                  >
                    Add to Cart
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>

        {filteredAndSortedArtworks().length === 0 && (
          <Typography textAlign="center" sx={{ mt: 4 }}>
            No artworks found matching your criteria.
          </Typography>
        )}
      </Container>
    </PageLayout>
  );
}

export default BrowseArt; 