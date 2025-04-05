import { Container, Typography, Box, Grid, Button, Paper, useTheme, Fade, keyframes } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Palette, Favorite, Brush, Museum } from '@mui/icons-material';
import { Link } from 'react-router-dom';

// Create keyframe animations
const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
`;

const gradientBackground = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

function Home() {
  const navigate = useNavigate();
  const theme = useTheme();

  const featureCards = [
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
      color: 'primary',
    },
  ] as const;

  return (
    <Box 
      sx={{ 
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        padding: 0,
        margin: 0,
        overflow: 'hidden'
      }}
    >
      {/* Hero Section */}
      <Box
        sx={{
          position: 'relative',
          height: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          margin: 0,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(45deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
            opacity: 0.9,
            zIndex: 1,
          },
        }}
      >
        <Box
          component="img"
          src="https://science.oregonstate.edu/sites/science.oregonstate.edu/files/styles/2000_x_1100/public/2019-07/oct2018_math-on-the-canvas-acclaimed-artist-explores-math-as-art.jpg?h=acf9f222&itok=bfRTAzoo"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            mixBlendMode: 'multiply',
            filter: 'grayscale(100%) blur(2px)',
          }}
          alt="Art background"
        />
        
        <Fade in timeout={1000}>
          <Box sx={{ 
            position: 'relative', 
            textAlign: 'center', 
            color: 'common.white', 
            px: 2,
            zIndex: 2,
          }}>
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4.5rem', lg: '5.5rem' },
                fontWeight: 900,
                letterSpacing: '-0.05em',
                mb: 3,
                textShadow: '0 4px 20px rgba(0,0,0,0.3)',
                animation: `${float} 6s ease-in-out infinite`,
              }}
            >
              Discover & Collect
              <Box component="span" sx={{ 
                background: `linear-gradient(45deg, ${theme.palette.secondary.light} 30%, ${theme.palette.primary.light} 90%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                ml: 1.5,
              }}>
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
                fontStyle: 'italic',
                opacity: 0.9,
              }}
            >
              Explore a curated collection of unique digital artworks from visionary creators worldwide.
            </Typography>
            
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/browse')}
              sx={{
                px: 8,
                py: 2,
                fontSize: '1.2rem',
                borderRadius: 50,
                background: `linear-gradient(45deg, ${theme.palette.secondary.main} 0%, ${theme.palette.primary.main} 100%)`,
                boxShadow: `0 8px 24px ${theme.palette.secondary.dark}40`,
                '&:hover': { 
                  transform: 'scale(1.05)',
                  boxShadow: `0 12px 32px ${theme.palette.secondary.dark}60`,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            >
              Start Exploring
            </Button>
          </Box>
        </Fade>
      </Box>

      {/* Feature Cards Section */}
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: 8,
          position: 'relative',
          zIndex: 3,
          backgroundColor: 'background.default'
        }}
      >
        <Grid container spacing={4} sx={{ mb: 8 }}>
          {featureCards.map((card, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Paper
                sx={{
                  p: 4,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  borderRadius: 4,
                  background: `linear-gradient(145deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`,
                  border: `1px solid ${theme.palette.divider}`,
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-8px)',
                    boxShadow: theme.shadows[6],
                    '&::before': {
                      opacity: 1,
                    }
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: `linear-gradient(45deg, ${theme.palette[card.color].main}20 0%, ${theme.palette[card.color].dark}20 100%)`,
                    opacity: 0,
                    transition: 'opacity 0.3s',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <Box
                  sx={{
                    width: 100,
                    height: 100,
                    borderRadius: '50%',
                    background: `linear-gradient(45deg, ${theme.palette[card.color].main} 0%, ${theme.palette[card.color].dark} 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    mb: 3,
                  }}
                >
                  {card.icon}
                </Box>
                <Typography variant="h5" component="h3" gutterBottom align="center">
                  {card.title}
                </Typography>
                <Typography align="center" color="text.secondary" paragraph>
                  {card.text}
                </Typography>
                <Button
                  variant="contained"
                  color={card.color}
                  component={Link}
                  to={card.route}
                  sx={{ mt: 'auto' }}
                >
                  {card.action}
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* Enhanced CTA Section */}
        <Box
          sx={{
            background: `
              linear-gradient(135deg, 
                ${theme.palette.background.paper} 0%, 
                ${theme.palette.background.default} 100%
              ),
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                ${theme.palette.divider} 10px,
                ${theme.palette.divider} 20px
              )
            `,
            borderRadius: 6,
            p: 8,
            textAlign: 'center',
            boxShadow: `0 24px 48px ${theme.palette.divider}`,
            mb: 8,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -50,
              right: -50,
              width: 200,
              height: 200,
              background: theme.palette.secondary.main,
              borderRadius: '50%',
              filter: 'blur(80px)',
              opacity: 0.1,
            },
          }}
        >
          <Typography 
            variant="h2" 
            component="h2" 
            gutterBottom 
            sx={{ 
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.2,
              mb: 4,
            }}
          >
            Ready to Dive Into the
            <Box 
              component="span" 
              sx={{ 
                ml: 2,
                background: `linear-gradient(45deg, ${theme.palette.secondary.main} 30%, ${theme.palette.primary.main} 90%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Future of Art?
            </Box>
          </Typography>
          
          <Typography
            variant="h6"
            component="p"
            sx={{ 
              maxWidth: 600,
              mx: 'auto', 
              mb: 6, 
              color: 'text.secondary',
              fontSize: '1.3rem',
            }}
          >
            Join thousands of creators and collectors in our vibrant digital art community.
          </Typography>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 3, 
            justifyContent: 'center', 
            flexWrap: 'wrap',
            position: 'relative',
            zIndex: 1,
          }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/signup')}
              sx={{
                px: 8,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 50,
                background: `
                  linear-gradient(45deg, 
                    ${theme.palette.primary.main} 0%, 
                    ${theme.palette.secondary.main} 100%
                  )`,
                boxShadow: `0 8px 24px ${theme.palette.primary.dark}30`,
                '&:hover': { 
                  transform: 'scale(1.05)',
                  boxShadow: `0 12px 32px ${theme.palette.primary.dark}50`,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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
                px: 8,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: 50,
                borderWidth: 2,
                background: `linear-gradient(45deg, 
                  ${theme.palette.background.paper} 0%, 
                  ${theme.palette.background.default} 100%
                )`,
                '&:hover': { 
                  borderWidth: 2,
                  transform: 'scale(1.05)',
                  background: `${theme.palette.action.hover}20`,
                },
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
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