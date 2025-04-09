import {
  Container,
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  IconButton,
  Button,
  Grid,
  Divider,
} from '@mui/material';
import { Add as AddIcon, Remove as RemoveIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { removeFromCart, updateQuantity, clearCart, syncCart, checkoutCart, fetchCart } from '../store/slices/cartSlice';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppDispatch } from '../store/store';
import LoadingSpinner from '../components/LoadingSpinner';
import axiosInstance from '../utils/axios';

function Cart() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { items, total, loading, error } = useSelector((state: RootState) => state.cart);
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (user && user.role === 'customer') {
      dispatch(fetchCart());
    } else if (!user) {
      navigate('/login', { state: { from: '/cart' } });
    }
  }, [dispatch, user, navigate]);

  useEffect(() => {
    if (user && user.role === 'customer' && items.length > 0) {
      dispatch(syncCart());
    }
  }, [dispatch, items, user]);

  const handleUpdateQuantity = (artwork_id: number, currentQuantity: number, change: number) => {
    dispatch(updateQuantity({ artwork_id, quantity: currentQuantity + change }));
  };

  const handleRemoveItem = (artwork_id: number) => {
    dispatch(removeFromCart(artwork_id));
  };

  const handleCheckout = async () => {
    try {
      const response = await axiosInstance.post('/api/cart/checkout');
      // Navigate to the shipping page with the order details
      navigate('/shipping', { 
        state: { order: response.data.order }
      });
    } catch (error) {
      console.error('Checkout failed:', error);
      // Handle error (show error message to user)
    }
  };

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h5" textAlign="center">
          Please log in to view your cart
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/login')}
          >
            Login
          </Button>
        </Box>
      </Container>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading cart..." />;
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography color="error" textAlign="center">
          {error}
        </Typography>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h5" textAlign="center">
          Your cart is empty
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/browse')}
          >
            Browse Artworks
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shopping Cart
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          {items.map((item) => (
            <Card key={item.artwork_id} sx={{ display: 'flex', mb: 2 }}>
              <CardMedia
                component="img"
                sx={{ width: 151 }}
                image={item.image_url}
                alt={item.title}
                onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
                  e.currentTarget.src = 'https://via.placeholder.com/151x151?text=Image+Not+Available';
                }}
              />
              <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <CardContent sx={{ flex: '1 0 auto' }}>
                  <Typography component="h6" variant="h6">
                    {item.title}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary">
                    by {item.artist_name}
                  </Typography>
                  <Typography variant="h6" color="primary">
                    ${item.price.toLocaleString()}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                    <IconButton 
                      onClick={() => handleUpdateQuantity(item.artwork_id, item.quantity, -1)}
                      disabled={item.quantity <= 1 || loading}
                    >
                      <RemoveIcon />
                    </IconButton>
                    <Typography sx={{ mx: 2 }}>{item.quantity}</Typography>
                    <IconButton 
                      onClick={() => handleUpdateQuantity(item.artwork_id, item.quantity, 1)}
                      disabled={loading}
                    >
                      <AddIcon />
                    </IconButton>
                    <IconButton 
                      color="error" 
                      onClick={() => handleRemoveItem(item.artwork_id)}
                      disabled={loading}
                      sx={{ ml: 2 }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </CardContent>
              </Box>
            </Card>
          ))}
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography>Subtotal</Typography>
              <Typography>${total.toLocaleString()}</Typography>
            </Box>
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                onClick={handleCheckout}
                disabled={items.length === 0}
                sx={{ py: 1.5 }}
              >
                Proceed to Checkout
              </Button>
              <Button
                variant="outlined"
                color="error"
                fullWidth
                onClick={() => dispatch(clearCart())}
                disabled={loading}
              >
                Clear Cart
              </Button>
            </Box>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Cart; 