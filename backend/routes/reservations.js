const router = require('express').Router();
const pool = require('../config/db');
const { sendEmail } = require('../utils/email.service');
const { validateCUI } = require('../utils/cui.validator');

const PRICES = {
  negocios: 1200,
  economica: 600
};

router.post('/', async (req, res) => {
  const { seatNumber, passengerName, cui, hasLuggage, classType = 'economica', userEmail } = req.body;

  if (!seatNumber || !passengerName || !cui || !userEmail) {
    return res.status(400).json({ error: 'Datos incompletos' });
  }

  if (!validateCUI(cui)) {
    return res.status(400).json({ error: 'CUI inválido' });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const userRes = await client.query('SELECT * FROM users WHERE email = $1 FOR UPDATE', [userEmail]);
    const user = userRes.rows[0];
    if (!user) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Usuario no encontrado' });
    }

    const seatCheck = await client.query('SELECT id FROM reservations WHERE seat_number = $1', [seatNumber]);
    if (seatCheck.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Asiento ya ocupado' });
    }

    const basePrice = PRICES[classType] || PRICES.economica;
    const price = user.is_vip ? Math.round(basePrice * 0.9) : basePrice;

    await client.query(
      'INSERT INTO reservations (seat_number, passenger_name, user_email, cui, has_luggage, class_type, price) VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [seatNumber, passengerName, userEmail, cui, hasLuggage, classType, price]
    );

    const newCount = (user.reservations || 0) + 1;
    const newIsVip = newCount >= 5;
    await client.query('UPDATE users SET reservations = $1, is_vip = $2 WHERE email = $3', [newCount, newIsVip, userEmail]);

    await client.query('COMMIT');

    try {
      await sendEmail(
        userEmail,
        'Reserva Confirmada - AIRXPRESS',
        '¡Tu asiento está reservado!',
        `
          <p>¡Hola!</p>
          <p>Tu reserva ha sido confirmada:</p>
          <ul>
            <li><strong>Asiento:</strong> <span class="highlight">${seatNumber}</span></li>
            <li><strong>Pasajero:</strong> ${passengerName}</li>
            <li><strong>Clase:</strong> ${classType ? classType.toUpperCase() : 'N/A'}</li>
            <li><strong>Precio:</strong> Q${price}</li>
            <li><strong>Maleta:</strong> ${hasLuggage ? 'Sí' : 'No'}</li>
          </ul>
          <p><em>Fecha: ${new Date().toLocaleString('es-GT')}</em></p>
        `,
        'Imprime este correo como comprobante.'
      );
    } catch (emailErr) {
      console.error('Error enviando email de reserva:', emailErr.message || emailErr);
    }

    res.json({ success: true, price });
  } catch (err) {
    if (client) {
      try { await client.query('ROLLBACK'); } catch (_) {}
    }
    res.status(500).json({ error: err.message });
  } finally {
    if (client) client.release();
  }
});

router.get('/', async (req, res) => {
  const userEmail = req.query.userEmail;
  try {
    let result;
    if (userEmail) {
      result = await pool.query('SELECT * FROM reservations WHERE user_email = $1', [userEmail]);
    } else {
      result = await pool.query('SELECT * FROM reservations');
    }
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/modify', async (req, res) => {
  const { reservationId, newSeat, cui, oldSeat } = req.body;
  if (!newSeat || (!reservationId && !(cui && oldSeat))) {
    return res.status(400).json({ error: 'Se requiere newSeat y reservationId o (cui y oldSeat)' });
  }

  try {
    let reservation;
    if (reservationId) {
      const result = await pool.query('SELECT * FROM reservations WHERE id = $1', [reservationId]);
      reservation = result.rows[0];
    } else {
      const result = await pool.query('SELECT * FROM reservations WHERE cui = $1 AND seat_number = $2', [cui, oldSeat]);
      reservation = result.rows[0];
    }

    if (!reservation) return res.status(404).json({ error: 'Reserva no encontrada' });

    const oldSeatVal = reservation.seat_number;
    const oldPrice = Number(reservation.price) || 0;
    const newPrice = +(oldPrice * 1.1).toFixed(2);

    await pool.query('UPDATE reservations SET seat_number = $1, price = $2 WHERE id = $3', [newSeat, newPrice, reservation.id]);

    try {
      await sendEmail(
        reservation.user_email,
        'Reserva Modificada - AIRXPRESS',
        'Asiento Actualizado',
        `
          <p>Tu reserva ha sido modificada:</p>
          <ul>
            <li><strong>De:</strong> ${oldSeatVal} → <strong>A:</strong> <span class="highlight">${newSeat}</span></li>
            <li><strong>Nuevo precio:</strong> Q${newPrice} (+10% por cambio)</li>
          </ul>
          <p><em>Modificado: ${new Date().toLocaleString('es-GT')}</em></p>
        `,
        'Gracias por tu flexibilidad.'
      );
    } catch (emailErr) {
      console.error('Error enviando email de modificación:', emailErr.message || emailErr);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/', async (req, res) => {
  const { cui, seat } = req.query;
  if (!cui || !seat) return res.status(400).json({ error: 'cui y seat son requeridos' });

  try {
    const result = await pool.query('SELECT * FROM reservations WHERE cui = $1 AND seat_number = $2', [cui, seat]);
    const reservation = result.rows[0];

    if (!reservation) return res.status(404).json({ error: 'No encontrada' });

    await pool.query('DELETE FROM reservations WHERE id = $1', [reservation.id]);

    try {
      await sendEmail(
        reservation.user_email,
        'Reserva Cancelada - AIRXPRESS',
        'Cancelación Confirmada',
        `
          <p>Tu reserva ha sido cancelada:</p>
          <ul>
            <li><strong>Asiento:</strong> ${seat}</li>
            <li><strong>Pasajero:</strong> ${reservation.passenger_name}</li>
          </ul>
          <p><em>Cancelado: ${new Date().toLocaleString('es-GT')}</em></p>
          <p>Si fue un error, puedes volver a reservar.</p>
        `,
        'Lamentamos tu cancelación.'
      );
    } catch (emailErr) {
      console.error('Error enviando email de cancelación:', emailErr.message || emailErr);
    }

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
