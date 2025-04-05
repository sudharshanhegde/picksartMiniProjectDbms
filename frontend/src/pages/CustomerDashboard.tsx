import { useState } from 'react';
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
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

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

const CustomerDashboard = () => {
  const [tabValue, setTabValue] = useState(0);
  const user = useSelector((state: RootState) => state.auth.user);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
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
          <Grid container spacing={4}>
            {/* Map through order history */}
            {[].map(renderArtworkCard)}
          </Grid>
        </TabPanel>
      </Box>
    </Container>
  );
};

export default CustomerDashboard; 