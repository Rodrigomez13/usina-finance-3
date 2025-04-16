-- Script completo para crear todas las tablas necesarias

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

-- Crear tabla para roles de usuario (necesaria para RLS)
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Función para verificar si RLS está habilitado en una tabla
CREATE OR REPLACE FUNCTION check_rls_enabled(table_name TEXT)
RETURNS BOOLEAN AS $
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE oid = (table_name::regclass)::oid;
  
  RETURN rls_enabled;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener las políticas de una tabla
CREATE OR REPLACE FUNCTION get_table_policies(table_name TEXT)
RETURNS TEXT[] AS $
DECLARE
  policies TEXT[];
BEGIN
  SELECT array_agg(polname::TEXT) INTO policies
  FROM pg_policy
  WHERE polrelid = (table_name::regclass)::oid;
  
  RETURN policies;
END;
$ LANGUAGE plpgsql SECURITY DEFINER;
