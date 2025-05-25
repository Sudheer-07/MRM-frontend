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
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import axios from 'axios';

const assetTypes = [
  { value: 'WEAPON', label: 'Weapon' },
  { value: 'VEHICLE', label: 'Vehicle' },
  { value: 'AMMUNITION', label: 'Ammunition' },
  { value: 'EQUIPMENT', label: 'Equipment' },
];

const assetStatus = [
  { value: 'AVAILABLE', label: 'Available' },
  { value: 'ASSIGNED', label: 'Assigned' },
  { value: 'MAINTENANCE', label: 'Maintenance' },
  { value: 'DECOMMISSIONED', label: 'Decommissioned' },
];

const assetConditions = [
  { value: 'NEW', label: 'New' },
  { value: 'GOOD', label: 'Good' },
  { value: 'FAIR', label: 'Fair' },
  { value: 'POOR', label: 'Poor' },
];

const bases = [
  'Alpha Base',
  'Bravo Base',
  'Charlie Base',
  'Delta Base',
];

const Assets = () => {
  const { user } = useSelector((state) => state.auth);
  const [assets, setAssets] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    assetId: '',
    name: '',
    type: '',
    category: '',
    serialNumber: '',
    status: 'AVAILABLE',
    condition: 'NEW',
    purchaseDate: '',
    purchasePrice: '',
    supplier: '',
    specifications: {},
    currentBase: user?.role === 'admin' ? '' : user?.base || '',
  });

  useEffect(() => {
    console.log('Current user:', user); // Debug log
    if (user) {
      fetchAssets();
    }
  }, [user]);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      setError('');
      const token = localStorage.getItem('token');
      console.log('Fetching assets with token:', token); // Debug log

      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get('http://localhost:5000/api/assets', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Assets response:', response.data); // Debug log
      setAssets(response.data.data);
    } catch (error) {
      console.error('Error fetching assets:', error);
      setError(error.response?.data?.message || 'Failed to fetch assets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDialog = (asset = null) => {
    if (asset) {
      setSelectedAsset(asset);
      setFormData({
        assetId: asset.assetId,
        name: asset.name,
        type: asset.type,
        category: asset.category,
        serialNumber: asset.serialNumber,
        status: asset.status,
        condition: asset.condition,
        purchaseDate: asset.purchaseDate.split('T')[0],
        purchasePrice: asset.purchasePrice,
        supplier: asset.supplier,
        specifications: asset.specifications || {},
        currentBase: asset.currentBase,
      });
    } else {
      setSelectedAsset(null);
      setFormData({
        assetId: '',
        name: '',
        type: '',
        category: '',
        serialNumber: '',
        status: 'AVAILABLE',
        condition: 'NEW',
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: '',
        supplier: '',
        specifications: {},
        currentBase: user?.role === 'admin' ? '' : user?.base || '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedAsset(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      if (selectedAsset) {
        await axios.patch(
          `http://localhost:5000/api/assets/${selectedAsset._id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        await axios.post(
          'http://localhost:5000/api/assets',
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      handleCloseDialog();
      fetchAssets();
    } catch (error) {
      console.error('Error saving asset:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this asset?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:5000/api/assets/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        fetchAssets();
      } catch (error) {
        console.error('Error deleting asset:', error);
      }
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.assetId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || asset.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">
          Please log in to view assets.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" component="h2">
                Assets
              </Typography>
              {(user.role === 'admin' || user.role === 'logistics_officer') && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleOpenDialog()}
                >
                  Add Asset
                </Button>
              )}
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loading ? (
              <Typography>Loading assets...</Typography>
            ) : (
              <>
                <Box sx={{ mb: 2 }}>
                  <TextField
                    label="Search"
                    variant="outlined"
                    size="small"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    sx={{ mr: 2 }}
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
                    {assetStatus.map((status) => (
                      <MenuItem key={status.value} value={status.value}>
                        {status.label}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                {filteredAssets.length === 0 ? (
                  <Alert severity="info">
                    No assets found. {user.role === 'admin' || user.role === 'logistics_officer' ? 'Click "Add Asset" to create one.' : ''}
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Asset ID</TableCell>
                          <TableCell>Name</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Condition</TableCell>
                          <TableCell>Base</TableCell>
                          <TableCell>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredAssets
                          .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                          .map((asset) => (
                            <TableRow key={asset._id}>
                              <TableCell>{asset.assetId}</TableCell>
                              <TableCell>{asset.name}</TableCell>
                              <TableCell>{asset.type}</TableCell>
                              <TableCell>{asset.status}</TableCell>
                              <TableCell>{asset.condition}</TableCell>
                              <TableCell>{asset.currentBase}</TableCell>
                              <TableCell>
                                {(user.role === 'admin' || user.role === 'logistics_officer') && (
                                  <>
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenDialog(asset)}
                                    >
                                      <EditIcon />
                                    </IconButton>
                                    {user.role === 'admin' && (
                                      <IconButton
                                        size="small"
                                        onClick={() => handleDelete(asset._id)}
                                      >
                                        <DeleteIcon />
                                      </IconButton>
                                    )}
                                  </>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <TablePagination
                  rowsPerPageOptions={[5, 10, 25]}
                  component="div"
                  count={filteredAssets.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedAsset ? 'Edit Asset' : 'Add New Asset'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              name="assetId"
              label="Asset ID"
              value={formData.assetId}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <TextField
              name="name"
              label="Name"
              value={formData.name}
              onChange={handleInputChange}
              required
              fullWidth
            />
            <TextField
              select
              name="type"
              label="Type"
              value={formData.type}
              onChange={handleInputChange}
              required
              fullWidth
            >
              {assetTypes.map((type) => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="category"
              label="Category"
              value={formData.category}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="serialNumber"
              label="Serial Number"
              value={formData.serialNumber}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              select
              name="status"
              label="Status"
              value={formData.status}
              onChange={handleInputChange}
              required
              fullWidth
            >
              {assetStatus.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              name="condition"
              label="Condition"
              value={formData.condition}
              onChange={handleInputChange}
              required
              fullWidth
            >
              {assetConditions.map((condition) => (
                <MenuItem key={condition.value} value={condition.value}>
                  {condition.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="purchaseDate"
              label="Purchase Date"
              type="date"
              value={formData.purchaseDate}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              name="purchasePrice"
              label="Purchase Price"
              type="number"
              value={formData.purchasePrice}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              name="supplier"
              label="Supplier"
              value={formData.supplier}
              onChange={handleInputChange}
              fullWidth
            />
            {user.role === 'admin' && (
              <TextField
                select
                name="currentBase"
                label="Base"
                value={formData.currentBase}
                onChange={handleInputChange}
                required
                fullWidth
              >
                {bases.map((base) => (
                  <MenuItem key={base} value={base}>
                    {base}
                  </MenuItem>
                ))}
              </TextField>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {selectedAsset ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Assets; 