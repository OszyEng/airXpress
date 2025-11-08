const router = require('express').Router();
const pool = require('../config/db');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const { sendEmail } = require('../utils/email.service');

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body || {};

    if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    if (!/@(gmail|outlook)\.com$/.test(String(email).toLowerCase())) {
      return res.status(400).json({ error: 'Dominio no permitido' });
    }

    const hashed = await bcrypt.hash(password, 10);

    try {
      const result = await pool.query(
        'INSERT INTO users (email, password, name) VALUES ($1,$2,$3) RETURNING id,email,name',
        [email, hashed, name]
      );

      try {
        await sendEmail(
          email,
          '¡Bienvenido a AIRXPRESS!',
          'Cuenta Creada Exitosamente',
          `
            <p>¡Hola <strong>${name || email}</strong>!</p>
            <p>Tu cuenta ha sido creada con éxito.</p>
            <p><strong>Email:</strong> ${email}</p>
            <p>Ya puedes iniciar sesión y reservar tu asiento.</p>
            <a href="http://localhost:4200/login" class="btn">Iniciar Sesión</a>
          `,
          'Gracias por elegirnos. ¡Te esperamos en tu vuelo!'
        );
      } catch (e) {
        console.error('Error enviando email de bienvenida:', e && e.message ? e.message : e);
      }

      return res.json(result.rows[0]);
    } catch (err) {
      console.error('DB error on register:', err && err.message ? err.message : err);
      return res.status(400).json({ error: 'Usuario ya existe' });
    }
  } catch (err) {
    console.error('Unexpected error in /register:', err && err.message ? err.message : err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];
  if (!user || !await bcrypt.compare(password, user.password)) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }
  res.json({ id: user.id, email: user.email, name: user.name, isVIP: user.is_vip, reservations: user.reservations });
});

router.get('/users/:email', async (req, res) => {
  const email = req.params.email;
  try {
    const result = await pool.query('SELECT id,email,name,is_vip,reservations FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ email: user.email, name: user.name, isVIP: user.is_vip, reservations: user.reservations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
