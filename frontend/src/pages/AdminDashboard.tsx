import React, { useEffect, useState } from 'react';
import { Box, Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Card, CardContent } from '@mui/material';
import PageLayout from '../components/PageLayout';
import api from '../services/api';

interface Transaction {
  order_id: number;
  status: string;
  customer_name: string;
  artwork_title: string;
  artist_name: string;
  quantity: number;
  // Optional fields that might be present in old responses but not in new ones
  date?: string;
  price?: number;
  total_amount?: number;
}

interface ArtistStats {
  artist_name: string;
  total_artworks: number;
  sold_artworks: number;
}

interface TransactionsResponse {
  transactions: Transaction[];
}

interface ArtistsStatsResponse {
  artists_stats: ArtistStats[];
}

const AdminDashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [artistsStats, setArtistsStats] = useState<ArtistStats[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [transactionsRes, artistsRes] = await Promise.all([
          api.get<TransactionsResponse>('/dashboard/admin/transactions'),
          api.get<ArtistsStatsResponse>('/dashboard/admin/artists')
        ]);
        setTransactions(transactionsRes.data.transactions);
        setArtistsStats(artistsRes.data.artists_stats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <PageLayout>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        <Grid container spacing={3}>
          {/* Artists Statistics */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Artists Statistics
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Artist Name</TableCell>
                      <TableCell align="right">Total Artworks</TableCell>
                      <TableCell align="right">Sold Artworks</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {artistsStats.map((artist) => (
                      <TableRow key={artist.artist_name}>
                        <TableCell>{artist.artist_name}</TableCell>
                        <TableCell align="right">{artist.total_artworks}</TableCell>
                        <TableCell align="right">{artist.sold_artworks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>

          {/* Transactions */}
          <Grid item xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                All Transactions
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Order ID</TableCell>
                      <TableCell>Customer</TableCell>
                      <TableCell>Artwork</TableCell>
                      <TableCell>Artist</TableCell>
                      <TableCell align="right">Quantity</TableCell>
                      <TableCell>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {transactions.map((transaction, index) => (
                      <TableRow key={`${transaction.order_id}-${index}`}>
                        <TableCell>{transaction.order_id}</TableCell>
                        <TableCell>{transaction.customer_name}</TableCell>
                        <TableCell>{transaction.artwork_title}</TableCell>
                        <TableCell>{transaction.artist_name}</TableCell>
                        <TableCell align="right">{transaction.quantity}</TableCell>
                        <TableCell>{transaction.status}</TableCell>
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

export default AdminDashboard; 