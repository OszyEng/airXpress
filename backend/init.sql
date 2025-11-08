
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(100),
  reservations INT DEFAULT 0,
  is_vip BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  seat_number VARCHAR(10) NOT NULL,
  passenger_name VARCHAR(100) NOT NULL,
  user_email VARCHAR(100) REFERENCES users(email) ON DELETE CASCADE,
  cui VARCHAR(13) NOT NULL,
  has_luggage BOOLEAN DEFAULT FALSE,
  class_type VARCHAR(20) CHECK (class_type IN ('negocios', 'economica')) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  reservation_date TIMESTAMP DEFAULT NOW(),
  modified BOOLEAN DEFAULT FALSE,
  modified_at TIMESTAMP,
  UNIQUE(seat_number)
);

CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_email);
CREATE INDEX IF NOT EXISTS idx_reservations_cui ON reservations(cui);
CREATE INDEX IF NOT EXISTS idx_reservations_seat ON reservations(seat_number);

CREATE OR REPLACE FUNCTION update_modified_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.modified_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_reservation ON reservations;
CREATE TRIGGER trg_update_reservation
  BEFORE UPDATE ON reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_at();

INSERT INTO users (email, password, name, is_vip) VALUES
('admin@airxpress.com', '$2b$10$examplehashedpassword', 'Admin', true)
ON CONFLICT (email) DO NOTHING;