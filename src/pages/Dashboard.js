import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import axios from 'axios';
import config from '../config/config';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [metrics, setMetrics] = useState({
    totalAssets: 0,
    activeAssets: 0,
    pendingTransfers: 0,
    activeAssignments: 0,
    statusDistribution: {}
  });
  const [recentActivities, setRecentActivities] = useState([]);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/assets/metrics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Metrics response:', response.data);
      setMetrics(response.data.data);
    } catch (error) {
      console.error('Error fetching metrics:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    // Set up polling to refresh metrics every 30 seconds
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  // Format data for the chart
  const chartData = Object.entries(metrics.statusDistribution).map(([status, count]) => ({
    status,
    count
  }));

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Welcome, {user?.fullName}
      </Typography>
      <Grid container spacing={3}>
        {/* Metrics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Total Assets
            </Typography>
            <Typography component="p" variant="h4">
              {metrics.totalAssets}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Active Assets
            </Typography>
            <Typography component="p" variant="h4">
              {metrics.activeAssets}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Pending Transfers
            </Typography>
            <Typography component="p" variant="h4">
              {metrics.pendingTransfers}
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 140,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Active Assignments
            </Typography>
            <Typography component="p" variant="h4">
              {metrics.activeAssignments}
            </Typography>
          </Paper>
        </Grid>

        {/* Asset Status Distribution Chart */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 400,
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Asset Status Distribution
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={4}>
          <Paper
            sx={{
              p: 2,
              display: 'flex',
              flexDirection: 'column',
              height: 400,
              overflow: 'auto'
            }}
          >
            <Typography component="h2" variant="h6" color="primary" gutterBottom>
              Recent Activities
            </Typography>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={activity._id}>
                  <ListItem>
                    <ListItemText
                      primary={activity.description}
                      secondary={new Date(activity.timestamp).toLocaleString()}
                    />
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 
