-- Función para habilitar RLS en todas las tablas
CREATE OR REPLACE FUNCTION setup_rls()
RETURNS void AS $$
BEGIN
  EXECUTE 'ALTER TABLE clients ENABLE ROW LEVEL SECURITY;';
  EXECUTE 'ALTER TABLE client_owners ENABLE ROW LEVEL SECURITY;';
  EXECUTE 'ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;';
  EXECUTE 'ALTER TABLE admin_expenses ENABLE ROW LEVEL SECURITY;';
  EXECUTE 'ALTER TABLE expense_distributions ENABLE ROW LEVEL SECURITY;';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear la tabla de roles de usuario
CREATE OR REPLACE FUNCTION create_user_roles_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear políticas para administradores
CREATE OR REPLACE FUNCTION create_admin_policies()
RETURNS void AS $$
BEGIN
  -- Función para verificar si un usuario es administrador
  CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
  RETURNS BOOLEAN AS $$
  BEGIN
    RETURN EXISTS (
      SELECT 1 FROM user_roles WHERE id = user_id AND role = 'admin'
    );
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;

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
