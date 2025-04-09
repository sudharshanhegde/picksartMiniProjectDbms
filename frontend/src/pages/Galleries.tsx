import { Container, Typography, Box } from '@mui/material';
import PageLayout from '../components/PageLayout';

function Galleries() {
  return (
    <PageLayout>
      <Container maxWidth="lg">
        <Box sx={{ py: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            Galleries
          </Typography>
          <Typography variant="body1">
            Explore prestigious galleries and their exclusive collections.
          </Typography>
        </Box>
      </Container>
    </PageLayout>
  );
}

export default Galleries; 