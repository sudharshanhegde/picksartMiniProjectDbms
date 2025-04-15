import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Card, CardContent, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';
import PageLayout from '../components/PageLayout';
import api, { createArtwork } from '../services/api';

interface Sale {
  artwork_title: string;
  quantity: number;
  customer_name: string;
  date: string;
}

interface ArtistStatsResponse {
  total_artworks: number;
  sales: Sale[];
}

const ArtistDashboard = () => {
  const [stats, setStats] = useState<ArtistStatsResponse>({
    total_artworks: 0,
    sales: []
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [newArtwork, setNewArtwork] = useState({
    title: '',
    description: '',
    price: 0,
    image_url: ''
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get<ArtistStatsResponse>('/dashboard/artist/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching artist stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewArtwork(prev => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createArtwork(newArtwork);
      // Refresh stats after adding new artwork
      const response = await api.get<ArtistStatsResponse>('/dashboard/artist/stats');
      setStats(response.data);
      handleCloseDialog();
      setNewArtwork({
        title: '',
        description: '',
        price: 0,
        image_url: ''
      });
    } catch (error) {
      console.error('Error creating artwork:', error);
    }
  };

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4">
            Artist Dashboard
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpenDialog}>
            Add New Artwork
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Total Artworks Card */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Total Artworks
                </Typography>
                <Typography variant="h3">
                  {stats.total_artworks}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Sales Table */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Sales History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Artwork Title</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {stats.sales.map((sale, index) => (
                      <TableRow key={index}>
                        <TableCell>{sale.artwork_title}</TableCell>
                        <TableCell>{sale.customer_name}</TableCell>
                        <TableCell align="right">{sale.quantity}</TableCell>
                        <TableCell>{new Date(sale.date).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>

        {/* Add Artwork Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Add New Artwork</DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent>
              <TextField
                autoFocus
                margin="dense"
                name="title"
                label="Title"
                type="text"
                fullWidth
                required
                value={newArtwork.title}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="description"
                label="Description"
                type="text"
                fullWidth
                required
                multiline
                rows={4}
                value={newArtwork.description}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="price"
                label="Price"
                type="number"
                fullWidth
                required
                value={newArtwork.price}
                onChange={handleInputChange}
              />
              <TextField
                margin="dense"
                name="image_url"
                label="Image URL"
                type="text"
                fullWidth
                required
                value={newArtwork.image_url}
                onChange={handleInputChange}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Cancel</Button>
              <Button type="submit" variant="contained" color="primary">
                Add Artwork
              </Button>
            </DialogActions>
          </form>
        </Dialog>
      </Container>
    </PageLayout>
  );
};

export default ArtistDashboard; 