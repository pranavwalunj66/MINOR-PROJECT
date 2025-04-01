import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  TextField,
  Button,
  Box,
  Typography,
  MenuItem,
  Link as MuiLink,
  FormControl,
  Select,
  InputLabel,
} from '@mui/material';
import { authService } from '../../services/auth.service';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'student',
    department: '',
    prn: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await authService.register(formData);
      toast.success('Registration successful! Please verify your OTP.');
      navigate('/verify-otp', { state: { email: formData.email } });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Full Name"
        name="name"
        autoComplete="name"
        autoFocus
        value={formData.name}
        onChange={handleChange}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email Address"
        name="email"
        autoComplete="email"
        value={formData.email}
        onChange={handleChange}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        id="phone"
        label="Phone Number"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={handleChange}
        inputProps={{
          pattern: "[+][0-9]{12}",
          title: "Phone number format: +919876543210"
        }}
      />

      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="new-password"
        value={formData.password}
        onChange={handleChange}
      />

      <FormControl fullWidth margin="normal">
        <InputLabel id="role-label">Role</InputLabel>
        <Select
          labelId="role-label"
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          label="Role"
        >
          <MenuItem value="student">Student</MenuItem>
          <MenuItem value="teacher">Teacher</MenuItem>
        </Select>
      </FormControl>

      {formData.role === 'student' && (
        <>
          <TextField
            margin="normal"
            required
            fullWidth
            id="department"
            label="Department"
            name="department"
            value={formData.department}
            onChange={handleChange}
          />

          <TextField
            margin="normal"
            required
            fullWidth
            id="prn"
            label="PRN"
            name="prn"
            value={formData.prn}
            onChange={handleChange}
            inputProps={{
              maxLength: 12,
              pattern: "[0-9]{12}",
              title: "PRN must be 12 digits"
            }}
          />
        </>
      )}

      <Button
        type="submit"
        fullWidth
        variant="contained"
        sx={{ mt: 3, mb: 2 }}
      >
        Register
      </Button>

      <Box sx={{ textAlign: 'center', mt: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Already have an account?{' '}
          <MuiLink component={Link} to="/login" variant="body2">
            Sign in here
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;
