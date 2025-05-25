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
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from '@mui/icons-material';
import axios from 'axios';

const statusOptions = [
  'pending',
  'approved',
  'rejected',
  'completed',
  'cancelled',
];

const Transfers = () => {
  const { user } = useSelector((state) => state.auth);
  const [transfers, setTransfers] = useState([]);
  const [assets, setAssets] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    assets: [{ asset: '', quantity: 1 }],
    toBase: '',
    reason: '',
    priority: 'MEDIUM',
    scheduledDate: new Date().toISOString().split('T')[0],
    transportDetails: {
      method: '',
      vehicleId: '',
      driver: '',
      escort: ''
    }
  });

  const priorityOptions = [
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' },
    { value: 'URGENT', label: 'Urgent' }
  ];

  const transportMethods = [
    { value: 'GROUND', label: 'Ground Transport' },
    { value: 'AIR', label: 'Air Transport' },
    { value: 'SEA', label: 'Sea Transport' }
  ];

  const bases = [
    'Alpha Base',
    'Bravo Base',
    'Charlie Base',
    'Delta Base'
  ];

  useEffect(() => {
    fetchTransfers();
    fetchAssets();
  }, []);

  const fetchTransfers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/transfers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTransfers(response.data.data);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    }
  };

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/assets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAssets(response.data.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (transfer = null) => {
    if (transfer) {
      setSelectedTransfer(transfer);
      setFormData({
        assets: transfer.assets.map(a => ({
          asset: a.asset._id,
          quantity: a.quantity
        })),
        toBase: transfer.toBase,
        reason: transfer.reason,
        priority: transfer.priority,
        scheduledDate: new Date(transfer.scheduledDate).toISOString().split('T')[0],
        transportDetails: transfer.transportDetails || {
          method: '',
          vehicleId: '',
          driver: '',
          escort: ''
        }
      });
    } else {
      setSelectedTransfer(null);
      setFormData({
        assets: [{ asset: '', quantity: 1 }],
        toBase: '',
        reason: '',
        priority: 'MEDIUM',
        scheduledDate: new Date().toISOString().split('T')[0],
        transportDetails: {
          method: '',
          vehicleId: '',
          driver: '',
          escort: ''
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedTransfer(null);
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddAsset = () => {
    setFormData(prev => ({
      ...prev,
      assets: [...prev.assets, { asset: '', quantity: 1 }]
    }));
  };

  const handleRemoveAsset = (index) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.filter((_, i) => i !== index)
    }));
  };

  const handleAssetChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      assets: prev.assets.map((asset, i) => 
        i === index ? { ...asset, [field]: value } : asset
      )
    }));
  };

  const handleTransportDetailsChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      transportDetails: {
        ...prev.transportDetails,
        [field]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      
      // Format the data according to the backend requirements
      const data = {
        assets: formData.assets.map(asset => ({
          asset: asset.asset,
          quantity: parseInt(asset.quantity) || 1
        })),
        toBase: formData.toBase,
        reason: formData.reason,
        priority: formData.priority,
        scheduledDate: new Date(formData.scheduledDate).toISOString(),
        transportDetails: formData.transportDetails
      };

      console.log('Submitting transfer data:', data);

      if (selectedTransfer) {
        await axios.patch(
          `http://localhost:5000/api/transfers/${selectedTransfer._id}/status`,
          { status: formData.status },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        const response = await axios.post(
          'http://localhost:5000/api/transfers',
          data,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Transfer created:', response.data);
      }
      fetchTransfers();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving transfer:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Error saving transfer';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transfer?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/transfers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchTransfers();
      } catch (error) {
        console.error('Error deleting transfer:', error);
      }
    }
  };

  const filteredTransfers = transfers.filter((transfer) => {
    const matchesSearch = transfer.assets.some(assetData => 
      assetData.asset?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) || transfer.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? transfer.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography component="h2" variant="h6" color="primary">
                Asset Transfers
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleOpenDialog()}
              >
                New Transfer
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
                    <TableCell>Assets</TableCell>
                    <TableCell>Source Base</TableCell>
                    <TableCell>Destination Base</TableCell>
                    <TableCell>Reason</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Requested By</TableCell>
                    <TableCell>Requested At</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransfers
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((transfer) => (
                      <TableRow key={transfer._id}>
                        <TableCell>
                          {transfer.assets.map((assetData, index) => (
                            <div key={index}>
                              {assetData.asset?.name} (Qty: {assetData.quantity})
                            </div>
                          ))}
                        </TableCell>
                        <TableCell>{transfer.fromBase}</TableCell>
                        <TableCell>{transfer.toBase}</TableCell>
                        <TableCell>{transfer.reason}</TableCell>
                        <TableCell>{transfer.status}</TableCell>
                        <TableCell>{transfer.requestedBy?.fullName}</TableCell>
                        <TableCell>
                          {new Date(transfer.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenDialog(transfer)}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(transfer._id)}
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
              count={filteredTransfers.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedTransfer ? 'Edit Transfer' : 'New Transfer Request'}
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              {/* Assets Section */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Assets
                </Typography>
                {formData.assets.map((asset, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                    <TextField
                      select
                      label="Asset"
                      value={asset.asset}
                      onChange={(e) => handleAssetChange(index, 'asset', e.target.value)}
                      required
                      sx={{ flex: 2 }}
                    >
                      {assets
                        .filter(a => a.status === 'AVAILABLE')
                        .map((asset) => (
                          <MenuItem key={asset._id} value={asset._id}>
                            {asset.name} - {asset.serialNumber}
                          </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                      type="number"
                      label="Quantity"
                      value={asset.quantity}
                      onChange={(e) => handleAssetChange(index, 'quantity', parseInt(e.target.value))}
                      required
                      sx={{ flex: 1 }}
                    />
                    {index > 0 && (
                      <IconButton
                        color="error"
                        onClick={() => handleRemoveAsset(index)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}
                <Button
                  variant="outlined"
                  onClick={handleAddAsset}
                  startIcon={<AddIcon />}
                  sx={{ mb: 2 }}
                >
                  Add Asset
                </Button>
              </Grid>

              {/* Transfer Details */}
              <Grid item xs={12}>
                <TextField
                  select
                  fullWidth
                  label="Destination Base"
                  name="toBase"
                  value={formData.toBase}
                  onChange={handleInputChange}
                  required
                >
                  {bases
                    .filter(base => base !== user.base)
                    .map((base) => (
                      <MenuItem key={base} value={base}>
                        {base}
                      </MenuItem>
                    ))}
                </TextField>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Reason"
                  name="reason"
                  value={formData.reason}
                  onChange={handleInputChange}
                  required
                  multiline
                  rows={3}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  label="Priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  required
                >
                  {priorityOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  type="date"
                  label="Scheduled Date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleInputChange}
                  required
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>

              {/* Transport Details */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Transport Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="Transport Method"
                      value={formData.transportDetails.method}
                      onChange={(e) => handleTransportDetailsChange('method', e.target.value)}
                    >
                      {transportMethods.map((method) => (
                        <MenuItem key={method.value} value={method.value}>
                          {method.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Vehicle ID"
                      value={formData.transportDetails.vehicleId}
                      onChange={(e) => handleTransportDetailsChange('vehicleId', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Driver"
                      value={formData.transportDetails.driver}
                      onChange={(e) => handleTransportDetailsChange('driver', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Escort"
                      value={formData.transportDetails.escort}
                      onChange={(e) => handleTransportDetailsChange('escort', e.target.value)}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedTransfer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Transfers; 