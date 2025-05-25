import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Box,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';
import config from '../config/config';

const statusOptions = [
  'pending',
  'active',
  'completed',
  'cancelled',
];

const Assignments = () => {
  const { user } = useSelector((state) => state.auth);
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    assetId: '',
    assignedToId: '',
    purpose: '',
    conditionAtAssignment: 'GOOD'
  });

  const conditionOptions = [
    { value: 'NEW', label: 'New' },
    { value: 'GOOD', label: 'Good' },
    { value: 'FAIR', label: 'Fair' },
    { value: 'POOR', label: 'Poor' }
  ];

  useEffect(() => {
    fetchAssignments();
    fetchAssets();
    fetchUsers();
  }, []);

  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/assignments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssignments(response.data.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    }
  };

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/assets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssets(response.data.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${config.API_URL}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (assignment = null) => {
    if (assignment) {
      setSelectedAssignment(assignment);
      setFormData({
        assetId: assignment.asset._id,
        assignedToId: assignment.assignedTo._id,
        purpose: assignment.purpose,
        conditionAtAssignment: assignment.conditionAtAssignment,
        status: assignment.status,
      });
    } else {
      setSelectedAssignment(null);
      setFormData({
        assetId: '',
        assignedToId: '',
        purpose: '',
        conditionAtAssignment: 'GOOD',
        status: 'pending',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAssignment(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const data = {
        assetId: formData.assetId,
        assignedToId: formData.assignedToId,
        purpose: formData.purpose,
        conditionAtAssignment: formData.conditionAtAssignment
      };

      console.log('Submitting assignment data:', data);

      if (selectedAssignment) {
        await axios.patch(
          `${config.API_URL}/assignments/${selectedAssignment._id}/status`,
          { status: formData.status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const response = await axios.post(
          `${config.API_URL}/assignments`,
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Assignment created:', response.data);
      }
      fetchAssignments();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving assignment:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error saving assignment';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this assignment?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${config.API_URL}/assignments/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAssignments();
      } catch (error) {
        console.error('Error deleting assignment:', error);
      }
    }
  };

  const filteredAssignments = assignments.filter((assignment) => {
    const matchesSearch = assignment.asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      assignment.purpose.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? assignment.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography component="h2" variant="h6" color="primary">
                Asset Assignments
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenDialog()}
              >
                New Assignment
              </Button>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
              <TextField
                label="Search"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <TextField
                select
                label="Status"
                variant="outlined"
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="">All</MenuItem>
                {statusOptions.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Asset</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                    <TableCell>Purpose</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Assigned By</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredAssignments
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((assignment) => (
                      <TableRow key={assignment._id}>
                        <TableCell>{assignment.asset.name}</TableCell>
                        <TableCell>{assignment.assignedTo.fullName}</TableCell>
                        <TableCell>
                          {new Date(assignment.startDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {new Date(assignment.endDate).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{assignment.purpose}</TableCell>
                        <TableCell>{assignment.status}</TableCell>
                        <TableCell>{assignment.assignedBy.name}</TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(assignment)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(assignment._id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredAssignments.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedAssignment ? 'Edit Assignment' : 'New Assignment'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Asset"
                  name="assetId"
                  value={formData.assetId}
                  onChange={handleInputChange}
                  required
                >
                  {assets
                    .filter(asset => asset.status === 'AVAILABLE')
                    .map((asset) => (
                      <MenuItem key={asset._id} value={asset._id}>
                        {asset.name} - {asset.serialNumber}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Assigned To"
                  name="assignedToId"
                  value={formData.assignedToId}
                  onChange={handleInputChange}
                  required
                >
                  {users
                    .filter(user => user.base === user.base)
                    .map((user) => (
                      <MenuItem key={user._id} value={user._id}>
                        {user.fullName}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  select
                  label="Condition at Assignment"
                  name="conditionAtAssignment"
                  value={formData.conditionAtAssignment}
                  onChange={handleInputChange}
                  required
                >
                  {conditionOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Purpose"
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={3}
                />
              </Grid>
              {selectedAssignment && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    {statusOptions.map((status) => (
                      <MenuItem key={status} value={status}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedAssignment ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Assignments; 