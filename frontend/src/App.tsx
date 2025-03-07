import { ThemeProvider, createTheme } from '@mui/material/styles';
import { Box, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import BrowseArt from './pages/BrowseArt';
import ArtistDashboard from './pages/ArtistDashboard';
import Cart from './pages/Cart';
import PrivateRoute from './components/PrivateRoute';
import OrderConfirmation from './pages/OrderConfirmation';
import OrderHistory from './pages/OrderHistory';
import GalleryRegistration from './pages/GalleryRegistration';
import GalleryList from './pages/GalleryList';
import NotFound from './pages/NotFound';

console.log('App component loaded');

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

function App() {
  console.log('App component rendering');
  
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, py: 3 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/browse" element={<BrowseArt />} />
              <Route path="/cart" element={<Cart />} />
              <Route
                path="/artist-dashboard"
                element={
                  <PrivateRoute>
                    <ArtistDashboard />
                  </PrivateRoute>
                }
              />
              <Route path="/404" element={<NotFound />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
              <Route path="/orders" element={<OrderHistory />} />
              <Route path="/gallery-registration" element={<GalleryRegistration />} />
              <Route path="/galleries" element={<GalleryList />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App; 