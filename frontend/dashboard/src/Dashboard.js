import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Chip,
  Button
} from '@mui/material';
import {
  Store as StoreIcon,
  Inventory as InventoryIcon,
  TrendingUp as TrendingIcon,
  ShoppingCart as CartIcon
} from '@mui/icons-material';

function Dashboard() {
  const [stats, setStats] = useState({
    totalShops: 0,
    lowStockItems: 0,
    pendingOrders: 0,
    revenue: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    // Fetch dashboard data
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // In production, fetch from API
    setStats({
      totalShops: 42,
      lowStockItems: 8,
      pendingOrders: 5,
      revenue: 125000
    });

    setRecentActivities([
      {
        id: 1,
        shop: 'Sri Lakshmi Stores',
        action: 'New shop registered',
        time: '5 min ago',
        type: 'success'
      },
      {
        id: 2,
        shop: 'Krishna Retail',
        action: 'Low stock alert: Maggi Noodles',
        time: '15 min ago',
        type: 'warning'
      },
      {
        id: 3,
        shop: 'MK Kirana',
        action: 'Order approved: ₹500',
        time: '1 hour ago',
        type: 'info'
      }
    ]);
  };

  const StatCard = ({ title, value, icon, color }) => (
    <Card elevation={2}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography color="textSecondary" variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div" sx={{ mt: 1 }}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: `${color}.light`,
              borderRadius: '50%',
              p: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        BharatAgent Dashboard
      </Typography>
      <Typography color="textSecondary" gutterBottom>
        Monitor your Kirana store network
      </Typography>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        {/* Stats Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Shops"
            value={stats.totalShops}
            icon={<StoreIcon sx={{ color: 'primary.main' }} />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Low Stock Items"
            value={stats.lowStockItems}
            icon={<InventoryIcon sx={{ color: 'warning.main' }} />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Pending Orders"
            value={stats.pendingOrders}
            icon={<CartIcon sx={{ color: 'info.main' }} />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Revenue (₹)"
            value={stats.revenue.toLocaleString()}
            icon={<TrendingIcon sx={{ color: 'success.main' }} />}
            color="success"
          />
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity) => (
                <ListItem key={activity.id} divider>
                  <ListItemText
                    primary={
                      <Box display="flex" alignItems="center" gap={1}>
                        <Typography variant="body1">
                          {activity.shop}
                        </Typography>
                        <Chip
                          label={activity.type}
                          size="small"
                          color={
                            activity.type === 'success'
                              ? 'success'
                              : activity.type === 'warning'
                              ? 'warning'
                              : 'info'
                          }
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        {activity.action}
                        <Typography
                          component="span"
                          variant="body2"
                          color="textSecondary"
                          sx={{ ml: 2 }}
                        >
                          • {activity.time}
                        </Typography>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="outlined">View All Activities</Button>
            </Box>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={4}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
              <Button variant="contained" fullWidth startIcon={<StoreIcon />}>
                Register New Shop
              </Button>
              <Button variant="outlined" fullWidth startIcon={<InventoryIcon />}>
                Check Inventory
              </Button>
              <Button variant="outlined" fullWidth startIcon={<CartIcon />}>
                View Orders
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
