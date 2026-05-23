require('dotenv').config();

const testLogin = async () => {
  try {
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    const email = process.argv[2] || 'admin@example.com';
    const password = process.argv[3] || 'TestPassword123';

    console.log(`\n📝 Testing login...\n`);
    console.log(`API URL: ${apiUrl}`);
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}\n`);

    const response = await fetch(`${apiUrl}/api/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('✅ Login successful!\n');
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('❌ Login failed!\n');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(data, null, 2));
    }
  } catch (error) {
    console.log('❌ Connection failed!\n');
    console.log('Error:', error.message);
  }
};

testLogin();
