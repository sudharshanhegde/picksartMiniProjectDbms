import React, { useEffect, useState } from 'react';
import {
  Typography,
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Tabs,
  Tab,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import PageLayout from '../components/PageLayout';
import api from '../services/api';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ExpandMore as ExpandMoreIcon, Download as DownloadIcon } from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface Order {
  order_id: number;
  date: string;
  total_amount: number;
  status: string;
  artwork_title: string;
  artist_name: string;
  quantity: number;
  price: number;
  shipping_address: string;
  shipping_phone: string;
}

interface OrdersResponse {
  orders: Order[];
}

const CustomerDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const user = useSelector((state: RootState) => state.auth.user);
  const [orders, setOrders] = useState<Order[]>([]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await api.get<OrdersResponse>('/dashboard/customer/orders');
        setOrders(response.data.orders);
      } catch (error) {
        console.error('Error fetching orders:', error);
      }
    };

    fetchOrders();
  }, []);

  const handleDownloadReceipt = (order: Order) => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(20);
    doc.text('Order Receipt', 105, 20, { align: 'center' });
    
    // Add order details
    doc.setFontSize(12);
    doc.text(`Order ID: ${order.order_id}`, 20, 40);
    doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 20, 50);
    doc.text(`Status: ${order.status}`, 20, 60);
    
    // Add shipping details
    doc.text('Shipping Details:', 20, 80);
    doc.text(`Address: ${order.shipping_address}`, 20, 90);
    doc.text(`Phone: ${order.shipping_phone}`, 20, 100);
    
    // Add items table
    const tableColumn = ["Item", "Artist", "Quantity", "Price", "Total"];
    const tableRows = [[
      order.artwork_title,
      order.artist_name,
      order.quantity,
      `$${order.price.toFixed(2)}`,
      `$${(order.price * order.quantity).toFixed(2)}`
    ]];
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 110,
      theme: 'striped',
      headStyles: { fillColor: [40, 50, 120] }
    });
    
    // Add total amount
    const finalY = doc.lastAutoTable.finalY || 110;
    doc.text(`Total Amount: $${order.total_amount.toFixed(2)}`, 150, finalY + 20, { align: 'right' });
    
    // Save the PDF
    doc.save(`order-${order.order_id}.pdf`);
  };

  const renderArtworkCard = (artwork: any) => (
    <Grid item xs={12} sm={6} md={4} key={artwork.id}>
      <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <CardMedia
          component="img"
          sx={{
            height: 250,
            objectFit: 'cover',
            objectPosition: 'center',
          }}
          image={artwork.image_url}
          alt={artwork.title}
          onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
            e.currentTarget.src = 'https://via.placeholder.com/400x250?text=Image+Not+Available';
          }}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h6" component="h2">
            {artwork.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {artwork.artist_name}
          </Typography>
          <Typography variant="h6" color="primary">
            ${artwork.price?.toLocaleString()}
          </Typography>
        </CardContent>
      </Card>
    </Grid>
  );

  return (
    <PageLayout>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            My Collection
          </Typography>

          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange}>
              <Tab label="My Purchases" />
              <Tab label="Wishlist" />
              <Tab label="Order History" />
            </Tabs>
          </Box>

          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={4}>
              {/* Map through purchased artworks */}
              {[].map(renderArtworkCard)}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={4}>
              {/* Map through wishlist items */}
              {[].map(renderArtworkCard)}
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Grid container spacing={3}>
              {orders.map((order) => (
                <Grid item xs={12} key={order.order_id}>
                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                        <Typography>
                          Order #{order.order_id} - {new Date(order.date).toLocaleDateString()}
                        </Typography>
                        <Typography sx={{ color: 'text.secondary' }}>
                          ${order.total_amount.toFixed(2)}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom>
                            Order Details
                          </Typography>
                          <Typography>Status: {order.status}</Typography>
                          <Typography>Artwork: {order.artwork_title}</Typography>
                          <Typography>Artist: {order.artist_name}</Typography>
                          <Typography>Quantity: {order.quantity}</Typography>
                          <Typography>Price per item: ${order.price.toFixed(2)}</Typography>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Typography variant="subtitle1" gutterBottom>
                            Shipping Details
                          </Typography>
                          <Typography>Address: {order.shipping_address}</Typography>
                          <Typography>Phone: {order.shipping_phone}</Typography>
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            variant="contained"
                            color="secondary"
                            startIcon={<DownloadIcon />}
                            onClick={() => handleDownloadReceipt(order)}
                          >
                            Download Receipt
                          </Button>
                        </Grid>
                      </Grid>
                    </AccordionDetails>
                  </Accordion>
                </Grid>
              ))}
            </Grid>
          </TabPanel>
        </Box>
      </Container>
    </PageLayout>
  );
};

export default CustomerDashboard; 