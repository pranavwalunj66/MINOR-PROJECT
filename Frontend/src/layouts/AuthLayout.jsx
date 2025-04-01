import { Outlet } from 'react-router-dom';
import { Box, Container, Paper, Typography } from '@mui/material';

const AuthLayout = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        bgcolor: 'grey.50',
        py: 12,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom>
            QuizCraze
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Quiz Management System
          </Typography>
        </Box>

        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Outlet />
        </Paper>
      </Container>
    </Box>
  );
};

export default AuthLayout;
