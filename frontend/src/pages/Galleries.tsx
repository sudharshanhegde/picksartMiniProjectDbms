import { Container, Typography, Box } from '@mui/material';

function Galleries() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Galleries
        </Typography>
        <Typography variant="body1">
          Explore prestigious galleries and their exclusive collections.
        </Typography>
      </Box>
    </Container>
  );
}

export default Galleries; 