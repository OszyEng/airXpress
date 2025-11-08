require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/utils', require('./routes/utils'));

const PORT = process.env.PORT || 3000;
app.use('/api/reports', require('./routes/reports'));
app.listen(PORT, () => console.log(`API en puerto ${PORT}`));
