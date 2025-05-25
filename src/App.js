import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useSelector } from 'react-redux';
import theme from './theme';

// Components
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import Profile from './pages/Profile';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useSelector((state) => state.auth);
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="assets" element={<Assets />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="assignments" element={<Assignments />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
}

export default App;
