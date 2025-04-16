import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

const TestPage = () => {
  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
      }}
    >
      <Paper
        elevation={3}
        sx={{
          padding: 4,
          borderRadius: 2,
          textAlign: 'center',
          background: 'rgba(255, 255, 255, 0.9)',
        }}
      >
        <Typography variant="h2" gutterBottom sx={{ color: '#2c3e50' }}>
          Hello World! 👋
        </Typography>
        <Typography variant="h4" sx={{ color: '#34495e' }}>
          Welcome to QuizCraze
        </Typography>
        
        {/* Simple Animation */}
        <Box
          sx={{
            width: 100,
            height: 100,
            margin: '20px auto',
            borderRadius: '50%',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            animation: 'pulse 2s infinite',
            '@keyframes pulse': {
              '0%': {
                transform: 'scale(0.95)',
                boxShadow: '0 0 0 0 rgba(33, 150, 243, 0.7)',
              },
              '70%': {
                transform: 'scale(1)',
                boxShadow: '0 0 0 10px rgba(33, 150, 243, 0)',
              },
              '100%': {
                transform: 'scale(0.95)',
                boxShadow: '0 0 0 0 rgba(33, 150, 243, 0)',
              },
            },
          }}
        />
      </Paper>
    </Box>
  );
};

export default TestPage;
