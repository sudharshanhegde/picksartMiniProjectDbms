import React, { useState, useEffect } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  TextField, 
  Button, 
  Paper, 
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import axiosInstance from '../utils/axios';
import PageLayout from '../components/PageLayout';

interface ShippingResponse {
  message: string;
  shipping_id: number;
  order_id: number;
  order: {
    order_id: number;
    total_amount: number;
    date: string;
    status: string;
    customer_name: string;
    items: Array<{
      artwork_id: number;
      title: string;
      quantity: number;
      price: number;
      image_url: string;
      artist_name: string;
    }>
  };
  shipping_details: {
    address: string;
    phoneNumber: string;
  };
}

const Shipping: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state: RootState) => state.auth.user);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    address: '',
    phoneNumber: ''
  });

  useEffect(() => {
    // Check if user is logged in and has customer role
    if (!user || user.role !== 'customer') {
      navigate('/login');
    }

    // Fetch existing address and phone if available
    const fetchCustomerDetails = async () => {
      try {
        const response = await axiosInstance.get('/api/customers/profile');
        if (response.data.address || response.data.phone_number) {
          setFormData({
            address: response.data.address || '',
            phoneNumber: response.data.phone_number || ''
          });
        }
      } catch (err) {
        console.error('Error fetching customer details:', err);
      }
    };

    fetchCustomerDetails();
  }, [user, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate form data
      if (!formData.address.trim()) {
        throw new Error('Address is required');
      }

      if (!formData.phoneNumber.trim()) {
        throw new Error('Phone number is required');
      }

      // Save the shipping information
      const response = await axiosInstance.post('/api/shipping', {
        address: formData.address,
        phone_number: formData.phoneNumber
      });

      const data = response.data as ShippingResponse;

      // Proceed to order confirmation
      navigate('/order-confirmation', { 
        state: { 
          order: data.order,
          shippingDetails: {
            address: formData.address,
            phoneNumber: formData.phoneNumber
          }
        } 
      });
    } catch (err: any) {
      console.error('Shipping error:', err);
      setError(err.message || 'Failed to save shipping information');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <Container maxWidth="md">
        <Box sx={{ py: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Shipping Information
          </Typography>

          <Paper elevation={3} sx={{ p: 4, mt: 3 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="address"
                    name="address"
                    label="Shipping Address"
                    value={formData.address}
                    onChange={handleChange}
                    multiline
                    rows={3}
                    placeholder="Enter your complete shipping address"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    required
                    fullWidth
                    id="phoneNumber"
                    name="phoneNumber"
                    label="Phone Number"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Enter your contact phone number"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                    <Button 
                      variant="outlined" 
                      onClick={() => navigate('/cart')}
                    >
                      Back to Cart
                    </Button>
                    <Button 
                      type="submit" 
                      variant="contained" 
                      color="primary"
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Continue to Payment'}
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </Paper>
        </Box>
      </Container>
    </PageLayout>
  );
};

export default Shipping; 