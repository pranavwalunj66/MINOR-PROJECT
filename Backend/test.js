const axios = require('axios');

const API_URL = 'http://localhost:5000';

async function testRegistration() {
  try {
    const response = await axios.post(`${API_URL}/api/auth/register`, {
      name: 'Test Teacher',
      email: 'test.teacher@example.com',
      phone: '1234567890',
      password: 'Test@123',
      role: 'teacher'
    });
    console.log('Registration Response:', response.data);
  } catch (error) {
    console.error('Registration Error:', error.response ? error.response.data : error.message);
  }
}

testRegistration();
