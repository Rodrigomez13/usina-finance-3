-- Función para crear todas las tablas si no existen
CREATE OR REPLACE FUNCTION create_tables_if_not_exist()
RETURNS void AS $$
BEGIN
  -- Crear tabla de propietarios de clientes
  CREATE TABLE IF NOT EXISTS client_owners (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Crear tabla de clientes
  CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id INTEGER REFERENCES client_owners(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- Crear tabla de transacciones
  CREATE TABLE IF NOT EXISTS transactions (
    id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(id),
    type TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    notes TEXT,
    payment_method TEXT,
    category TEXT,
    cost_per_lead NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL
  );
  
  -- Crear tabla de gastos administrativos
  CREATE TABLE IF NOT EXISTS admin_expenses (
    id SERIAL PRIMARY KEY,
    concept TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    date DATE NOT NULL,
    paid_by TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by TEXT NOT NULL
  );
  
  -- Crear tabla de distribuciones de gastos
  CREATE TABLE IF NOT EXISTS expense_distributions (
    id SERIAL PRIMARY KEY,
    expense_id INTEGER NOT NULL REFERENCES admin_expenses(id),
    client_id INTEGER NOT NULL REFERENCES clients(id),
    percentage NUMERIC NOT NULL,
    amount NUMERIC NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql;
