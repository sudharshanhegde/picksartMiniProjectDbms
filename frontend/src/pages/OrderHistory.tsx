import React, { useEffect, useState } from 'react';
import { Container, Typography, Paper, Grid, Card, CardMedia, CardContent, Accordion, AccordionSummary, AccordionDetails, Box, CircularProgress } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import axiosInstance from '../utils/axios';

interface OrderItem {
  artwork_id: number;
  title: string;
  quantity: number;
  price: number;
  image_url: string;
  artist_name: string;
}

interface Order {
  order_id: number;
  total_amount: number;
  status: string;
  date: string;
  items: OrderItem[];
}

const OrderHistory = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axiosInstance.get('/api/orders');
        setOrders(response.data.orders);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch orders');
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography color="error" sx={{ mt: 4 }}>
          {error}
        </Typography>
      </Container>
    );
  }

  if (orders.length === 0) {
    return (
      <Container>
        <Paper elevation={3} sx={{ p: 4, mt: 4, textAlign: 'center' }}>
          <Typography variant="h5">No orders found</Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
            You haven't placed any orders yet.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" sx={{ mt: 4, mb: 3 }}>
        Your Orders
      </Typography>

      {orders.map((order) => (
        <Accordion key={order.order_id} sx={{ mb: 2 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle1">
                  Order #{order.order_id}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  {new Date(order.date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="body2" color="text.secondary">
                  Status: {order.status}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Typography variant="subtitle1">
                  Total: ${order.total_amount.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container spacing={3}>
              {order.items.map((item) => (
                <Grid item xs={12} sm={6} md={4} key={`${order.order_id}-${item.artwork_id}`}>
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
          </AccordionDetails>
        </Accordion>
      ))}
    </Container>
  );
};

export default OrderHistory; 