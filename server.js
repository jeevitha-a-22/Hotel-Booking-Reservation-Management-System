require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const authRoutes = require('./routes/authRoutes');
const hotelRoutes = require('./routes/hotelRoutes');
const roomTypeRoutes = require('./routes/roomTypeRoutes');
const roomRoutes = require('./routes/roomRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const pricingRoutes = require('./routes/pricingRoutes');
const guestRoutes = require('./routes/guestRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

connectDB();

app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'Hotel Booking API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/roomtypes', roomTypeRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/pricing-rules', pricingRoutes);
app.use('/api/guests', guestRoutes);
app.use('/api/admin', adminRoutes);

app.use(notFound);
app.use(errorHandler);

// Safety net: never let an unhandled promise rejection crash the whole server.
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err && err.message ? err.message : err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;
