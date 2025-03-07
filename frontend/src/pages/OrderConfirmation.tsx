import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Grid, Button, Card, CardMedia, CardContent, Divider } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = location.state || {};

  if (!order) {
    return (
      <Container>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="h5">No order information found</Typography>
          <Button 
            variant="contained" 
            onClick={() => navigate('/browse')}
            sx={{ mt: 2 }}
          >
            Continue Shopping
          </Button>
        </Box>
      </Container>
    );
  }

  const formattedDate = order.date ? new Date(order.date).toLocaleDateString() : 'N/A';

  return (
    <Container>
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h4" gutterBottom>
            Order Confirmed!
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Thank you for your purchase, {order.customer_name}
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              Order Details
            </Typography>
            <Typography>Order ID: {order.order_id}</Typography>
            <Typography>Date: {formattedDate}</Typography>
            <Typography>Status: {order.status}</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>
              Total Amount: ${order.total_amount.toFixed(2)}
            </Typography>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="h6" gutterBottom>
          Order Items
        </Typography>
        <Grid container spacing={3}>
          {order.items.map((item: any) => (
            <Grid item xs={12} sm={6} md={4} key={item.artwork_id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={item.image_url}
                  alt={item.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Artist: {item.artist_name}
                  </Typography>
                  <Typography variant="body2">
                    Quantity: {item.quantity}
                  </Typography>
                  <Typography variant="body2">
                    Price: ${item.price.toFixed(2)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
          <Button 
            variant="outlined" 
            onClick={() => navigate('/orders')}
          >
            View All Orders
          </Button>
          <Button 
            variant="contained" 
            onClick={() => navigate('/browse')}
          >
            Continue Shopping
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default OrderConfirmation; 