import { Container, Typography, Box, Grid, Button, Paper, useTheme, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Palette, Favorite, Brush, Museum } from '@mui/icons-material';

function Home() {
  const navigate = useNavigate();
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '90vh',
          minHeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          mb: 8,
        }}
      >
        <Box
          component="img"
          src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Lorenz_attractor_yb.svg/1200px-Lorenz_attractor_yb.svg.png"
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            filter: 'brightness(0.7)',
          }}
        />
        <Fade in timeout={1000}>
          <Box sx={{ position: 'relative', textAlign: 'center', color: 'common.white', px: 2 }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem' },
                fontWeight: 900,
                letterSpacing: '-0.05em',
                mb: 3,
                textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              }}
            >
              Discover & Collect
              <Box component="span" sx={{ color: 'secondary.main', ml: 1.5 }}>
                Digital Art
              </Box>
            </Typography>
            <Typography
              variant="h5"
              sx={{
                maxWidth: 680,
                mx: 'auto',
                mb: 4,
                fontWeight: 400,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              Explore a curated collection of unique digital artworks from visionary creators worldwide.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/browse')}
              sx={{
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                boxShadow: theme.shadows[6],
                '&:hover': { transform: 'translateY(-2px)' },
                transition: 'transform 0.2s',
              }}
            >
              Start Exploring
            </Button>
          </Box>
        </Fade>
      </Box>

      {/* Feature Cards */}
      <Container maxWidth="lg">
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {[
            {
              icon: <Palette fontSize="large" />,
              title: 'For Creators',
              text: 'Showcase your digital creations to a global audience and monetize your talent.',
              action: 'Join as Artist',
              route: '/signup',
              color: 'primary',
            },
            {
              icon: <Favorite fontSize="large" />,
              title: 'For Collectors',
              text: 'Discover and collect exclusive digital artworks from emerging talents.',
              action: 'Browse Collection',
              route: '/browse',
              color: 'secondary',
            },
            {
              icon: <Museum fontSize="large" />,
              title: 'For Galleries',
              text: 'Present your curated collections in our virtual exhibition spaces.',
              action: 'Register Gallery',
              route: '/gallery-registration',
              color: 'success',
            },
          ].map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderRadius: 4,
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[6],
                  },
                }}
              >
                <Box
                  sx={{
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    bgcolor: `${card.color}.main`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'common.white',
                    mb: 3,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 700 }}>
                  {card.title}
                </Typography>
                <Typography
                  variant="body1"
                  paragraph
                  sx={{ textAlign: 'center', color: 'text.secondary', mb: 3 }}
                >
                  {card.text}
                </Typography>
                <Button
                  variant="outlined"
                  color={card.color}
                  onClick={() => navigate(card.route)}
                  sx={{
                    mt: 'auto',
                    px: 4,
                    borderRadius: 2,
                    borderWidth: 2,
                    '&:hover': { borderWidth: 2 },
                  }}
                >
                  {card.action}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* CTA Section */}
        <Box
          sx={{
            bgcolor: 'background.paper',
            borderRadius: 4,
            p: 8,
            textAlign: 'center',
            boxShadow: theme.shadows[2],
            mb: 8,
          }}
        >
          <Typography variant="h2" component="h2" gutterBottom sx={{ fontWeight: 900 }}>
            Ready to Dive Into the
            <Box component="span" sx={{ color: 'secondary.main', ml: 1.5 }}>
              Future of Art?
            </Box>
          </Typography>
          <Typography
            variant="h6"
            component="p"
            sx={{ maxWidth: 600, mx: 'auto', mb: 4, color: 'text.secondary' }}
          >
            Join thousands of creators and collectors in our vibrant digital art community.
          </Typography>
          <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/signup')}
              sx={{
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                '&:hover': { transform: 'translateY(-2px)' },
                transition: 'transform 0.2s',
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={() => navigate('/browse')}
              sx={{
                px: 6,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 2,
                borderWidth: 2,
                '&:hover': { borderWidth: 2, transform: 'translateY(-2px)' },
                transition: 'transform 0.2s',
              }}
            >
              Explore Trending
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

export default Home;