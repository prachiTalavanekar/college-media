const axios = require('axios');

async function testAPI() {
  try {
    // First login as nigel
    console.log('Logging in as nigel...');
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'nigelshivalkar6@gmail.com',
      password: 'nigel1234' // Adjust if password is different
    });

    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token.substring(0, 20) + '...\n');

    // Get notifications
    console.log('Fetching notifications...');
    const notifResponse = await axios.get('http://localhost:5000/api/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ Notifications fetched successfully');
    console.log('Total notifications:', notifResponse.data.notifications.length);
    console.log('Unread count:', notifResponse.data.unreadCount);
    console.log('\nNotifications:');
    notifResponse.data.notifications.forEach((notif, index) => {
      console.log(`${index + 1}. ${notif.title}`);
      console.log(`   Type: ${notif.type}`);
      console.log(`   From: ${notif.sender?.name}`);
      console.log(`   Message: ${notif.message}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testAPI();
