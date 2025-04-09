import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Badge,
  Box,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  ShoppingCart as ShoppingCartIcon,
  AccountCircle,
} from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store/store';
import { logout } from '../store/slices/authSlice';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { items } = useSelector((state: RootState) => state.cart);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    handleClose();
    navigate('/login');
  };

  return (
    <AppBar 
      position="fixed" 
      sx={{ 
        boxShadow: 'none',
        backgroundColor: 'primary.main'
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{ flexGrow: 1, textDecoration: 'none', color: 'inherit' }}
        >
          PicksArt
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <Button
            component={Link}
            to="/browse"
            sx={{ color: 'white' }}
          >
            Browse Arts
          </Button>
          <Button
            component={Link}
            to="/galleries"
            sx={{ color: 'white' }}
          >
            Galleries
          </Button>
          {!user && (
            <>
              <Button
                component={Link}
                to="/gallery-registration"
                sx={{ color: 'white' }}
              >
                Register Gallery
              </Button>
              <Button
                component={Link}
                to="/admin-login"
                sx={{ color: 'white' }}
              >
                Admin Login
              </Button>
            </>
          )}
          <IconButton
            color="inherit"
            component={Link}
            to="/cart"
          >
            <Badge badgeContent={items.length} color="error">
              <ShoppingCartIcon />
            </Badge>
          </IconButton>

          {user ? (
            <>
              <IconButton
                size="large"
                aria-label="account of current user"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleMenu}
                color="inherit"
              >
                <AccountCircle />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                {user.role === 'artist' && (
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      navigate('/artist-dashboard');
                    }}
                  >
                    Artist Dashboard
                  </MenuItem>
                )}
                {user.role === 'admin' && (
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      navigate('/admin-dashboard');
                    }}
                  >
                    Admin Dashboard
                  </MenuItem>
                )}
                {user.role === 'customer' && (
                  <MenuItem
                    onClick={() => {
                      handleClose();
                      navigate('/customer-dashboard');
                    }}
                  >
                    Customer Dashboard
                  </MenuItem>
                )}
                <MenuItem onClick={handleLogout}>Logout</MenuItem>
              </Menu>
            </>
          ) : (
            <>
              <Button color="inherit" component={Link} to="/login">
                Login
              </Button>
              <Button color="inherit" component={Link} to="/signup">
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 