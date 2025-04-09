import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Card, CardContent } from '@mui/material';
import PageLayout from '../components/PageLayout';
import api from '../services/api';

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

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Artist Dashboard
        </Typography>

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
      </Container>
    </PageLayout>
  );
};

export default ArtistDashboard; 