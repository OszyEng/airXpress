const router = require('express').Router();
const pool = require('../config/db');

router.get('/', async (req, res) => {
  try {
    const users = await pool.query('SELECT COUNT(*) as total FROM users');
    const totalUsers = parseInt(users.rows[0].total);

    const totalRes = await pool.query('SELECT COUNT(*) as total FROM reservations');
    const totalReservations = parseInt(totalRes.rows[0].total);

    const business = await pool.query("SELECT COUNT(*) as total FROM reservations WHERE class_type = 'negocios'");
    const businessOccupied = parseInt(business.rows[0].total);
    const businessFree = 12 - businessOccupied;

    const economy = await pool.query("SELECT COUNT(*) as total FROM reservations WHERE class_type = 'economica'");
    const economyOccupied = parseInt(economy.rows[0].total);
    const economyFree = 45 - economyOccupied;

    const vip = await pool.query('SELECT COUNT(*) as total FROM users WHERE is_vip = true');
    const vipUsers = parseInt(vip.rows[0].total);

    res.json({
      totalUsers,
      totalReservations,
      businessOccupied,
      businessFree,
      economyOccupied,
      economyFree,
      vipUsers
    });
  } catch (err) {
    console.error('Error en reportes:', err);
    res.status(500).json({ error: 'Error interno' });
  }
});

module.exports = router;