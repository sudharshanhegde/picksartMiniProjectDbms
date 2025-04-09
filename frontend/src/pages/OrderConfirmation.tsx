import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Paper, Grid, Button, Card, CardMedia, CardContent, Divider } from '@mui/material';
import { CheckCircle, Download as DownloadIcon, LocalShipping } from '@mui/icons-material';
import PageLayout from '../components/PageLayout';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderConfirmation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { order, shippingDetails } = location.state || {};

  if (!order) {
    return (
      <PageLayout>
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
      </PageLayout>
    );
  }

  const formattedDate = order.date ? new Date(order.date).toLocaleDateString() : 'N/A';
  
  // Calculate expected delivery date (3 days from order date)
  const orderDate = order.date ? new Date(order.date) : new Date();
  const deliveryDate = new Date(orderDate);
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDeliveryDate = deliveryDate.toLocaleDateString();

  const handleDownloadReceipt = () => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Order Receipt', 105, 20, { align: 'center' });
    
    // Add order details
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.order_id}`, 20, 40);
    doc.text(`Date: ${formattedDate}`, 20, 50);
    doc.text(`Customer: ${order.customer_name}`, 20, 60);
    doc.text(`Status: ${order.status}`, 20, 70);
    
    // Add shipping details
    doc.text('Shipping Details:', 20, 90);
    doc.text(`Address: ${shippingDetails?.address || 'N/A'}`, 20, 100);
    doc.text(`Phone: ${shippingDetails?.phoneNumber || 'N/A'}`, 20, 110);
    doc.text(`Expected Delivery: ${formattedDeliveryDate}`, 20, 120);
    
    // Add items table
    const tableColumn = ["Item", "Artist", "Quantity", "Price", "Total"];
    const tableRows = order.items.map((item: any) => [
      item.title,
      item.artist_name,
      item.quantity,
      `$${item.price.toFixed(2)}`,
      `$${(item.price * item.quantity).toFixed(2)}`
    ]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 130,
      theme: 'striped',
      headStyles: { fillColor: [40, 50, 120] }
    });
    
    // Add total amount
    const finalY = doc.lastAutoTable.finalY || 130;
    doc.text(`Total Amount: $${order.total_amount.toFixed(2)}`, 150, finalY + 20, { align: 'right' });
    
    // Save the PDF
    doc.save(`order-${order.order_id}.pdf`);
  };

  return (
    <PageLayout>
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
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LocalShipping sx={{ mr: 1 }} />
                <Typography variant="h6">
                  Shipping Information
                </Typography>
              </Box>
              <Typography>Address: {shippingDetails?.address || 'N/A'}</Typography>
              <Typography>Phone: {shippingDetails?.phoneNumber || 'N/A'}</Typography>
              <Typography sx={{ fontWeight: 'bold', mt: 2 }}>
                Expected Delivery: {formattedDeliveryDate}
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
              color="secondary"
              startIcon={<DownloadIcon />}
              onClick={handleDownloadReceipt}
            >
              Download Receipt
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
    </PageLayout>
  );
};

export default OrderConfirmation; 