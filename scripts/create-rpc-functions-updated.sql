-- Función para crear la tabla de propietarios de clientes
CREATE OR REPLACE FUNCTION create_client_owners_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS client_owners (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear la tabla de clientes
CREATE OR REPLACE FUNCTION create_clients_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id INTEGER REFERENCES client_owners(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear la tabla de transacciones
CREATE OR REPLACE FUNCTION create_transactions_table()
RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear la tabla de gastos administrativos
CREATE OR REPLACE FUNCTION create_admin_expenses_table()
RETURNS void AS $$
BEGIN
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear la tabla de distribuciones de gastos
CREATE OR REPLACE FUNCTION create_expense_distributions_table()
RETURNS void AS $$
BEGIN
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear la tabla de roles de usuario
CREATE OR REPLACE FUNCTION create_user_roles_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear funciones auxiliares para RLS
CREATE OR REPLACE FUNCTION create_rls_helper_functions()
RETURNS void AS $$
BEGIN
  -- Función para verificar si RLS está habilitado en una tabla
  CREATE OR REPLACE FUNCTION check_rls_enabled(table_name TEXT)
  RETURNS BOOLEAN AS $func$
  DECLARE
    rls_enabled BOOLEAN;
  BEGIN
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE oid = (table_name::regclass)::oid;
    
    RETURN rls_enabled;
  END;
  $func$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Función para obtener las políticas de una tabla
  CREATE OR REPLACE FUNCTION get_table_policies(table_name TEXT)
  RETURNS TEXT[] AS $func$
  DECLARE
    policies TEXT[];
  BEGIN
    SELECT array_agg(polname::TEXT) INTO policies
    FROM pg_policy
    WHERE polrelid = (table_name::regclass)::oid;
    
    RETURN policies;
  END;
  $func$ LANGUAGE plpgsql SECURITY DEFINER;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para habilitar RLS en todas las tablas
CREATE OR REPLACE FUNCTION setup_rls()
RETURNS void AS $$
BEGIN
  ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
  ALTER TABLE client_owners ENABLE ROW LEVEL SECURITY;
  ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE admin_expenses ENABLE ROW LEVEL SECURITY;
  ALTER TABLE expense_distributions ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función simplificada para habilitar RLS en todas las tablas
CREATE OR REPLACE FUNCTION enable_rls_on_tables()
RETURNS void AS $$
BEGIN
  ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS client_owners ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS transactions ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS admin_expenses ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS expense_distributions ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear políticas para administradores
CREATE OR REPLACE FUNCTION create_admin_policies()
RETURNS void AS $$
BEGIN
  -- Función para verificar si un usuario es administrador
  CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
  RETURNS BOOLEAN AS $func$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM user_roles WHERE id = user_id AND role = 'admin'
    );
  END;
  $func$ LANGUAGE plpgsql SECURITY DEFINER;

  -- Política para clientes: los administradores pueden hacer todo
  DROP POLICY IF EXISTS admin_all_clients ON clients;
  CREATE POLICY admin_all_clients ON clients 
    FOR ALL 
    TO authenticated 
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

  -- Política para propietarios de clientes: los administradores pueden hacer todo
  DROP POLICY IF EXISTS admin_all_client_owners ON client_owners;
  CREATE POLICY admin_all_client_owners ON client_owners 
    FOR ALL 
    TO authenticated 
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

  -- Política para transacciones: los administradores pueden hacer todo
  DROP POLICY IF EXISTS admin_all_transactions ON transactions;
  CREATE POLICY admin_all_transactions ON transactions 
    FOR ALL 
    TO authenticated 
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

  -- Política para gastos administrativos: los administradores pueden hacer todo
  DROP POLICY IF EXISTS admin_all_admin_expenses ON admin_expenses;
  CREATE POLICY admin_all_admin_expenses ON admin_expenses 
    FOR ALL 
    TO authenticated 
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));

  -- Política para distribuciones de gastos: los administradores pueden hacer todo
  DROP POLICY IF EXISTS admin_all_expense_distributions ON expense_distributions;
  CREATE POLICY admin_all_expense_distributions ON expense_distributions 
    FOR ALL 
    TO authenticated 
    USING (is_admin(auth.uid()))
    WITH CHECK (is_admin(auth.uid()));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear políticas temporales para desarrollo
CREATE OR REPLACE FUNCTION create_dev_policies()
RETURNS void AS $$
BEGIN
  -- Política temporal para desarrollo: permitir todas las operaciones a usuarios autenticados
  DROP POLICY IF EXISTS dev_all_clients ON clients;
  CREATE POLICY dev_all_clients ON clients 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

  DROP POLICY IF EXISTS dev_all_client_owners ON client_owners;
  CREATE POLICY dev_all_client_owners ON client_owners 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

  DROP POLICY IF EXISTS dev_all_transactions ON transactions;
  CREATE POLICY dev_all_transactions ON transactions 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

  DROP POLICY IF EXISTS dev_all_admin_expenses ON admin_expenses;
  CREATE POLICY dev_all_admin_expenses ON admin_expenses 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);

  DROP POLICY IF EXISTS dev_all_expense_distributions ON expense_distributions;
  CREATE POLICY dev_all_expense_distributions ON expense_distributions 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función simplificada para crear políticas de desarrollo
CREATE OR REPLACE FUNCTION create_simple_dev_policies()
RETURNS void AS $$
BEGIN
  -- Política temporal para desarrollo: permitir todas las operaciones a usuarios autenticados
  EXECUTE 'CREATE POLICY IF NOT EXISTS dev_all_clients ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY IF NOT EXISTS dev_all_client_owners ON client_owners FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY IF NOT EXISTS dev_all_transactions ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY IF NOT EXISTS dev_all_admin_expenses ON admin_expenses FOR ALL TO authenticated USING (true) WITH CHECK (true)';
  EXECUTE 'CREATE POLICY IF NOT EXISTS dev_all_expense_distributions ON expense_distributions FOR ALL TO authenticated USING (true) WITH CHECK (true)';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
