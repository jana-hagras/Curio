import axios from 'axios';

async function testPayment() {
  try {
    const res = await axios.post('http://localhost:7000/payments/', {
      order_id: 1, // Assume order 1 exists, or it doesn't matter for the test if it's not strictly checked
      buyer_id: 1, // Need valid user
      totalAmount: 100,
      paymentMethod: 'Card',
      status: 'Completed',
      paymentType: 'product'
    });
    console.log('Success:', res.data);
  } catch (err) {
    console.error('Error:', err.response?.data || err.message);
  }
}

testPayment();
