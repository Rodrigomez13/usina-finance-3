-- Habilitar RLS en todas las tablas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_distributions ENABLE ROW LEVEL SECURITY;

-- Crear una tabla para roles de usuario si no existe
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Crear función para verificar si un usuario es administrador
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_roles WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Política para clientes: los administradores pueden hacer todo
CREATE POLICY admin_all_clients ON clients 
  FOR ALL 
  TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Política para propietarios de clientes: los administradores pueden hacer todo
CREATE POLICY admin_all_client_owners ON client_owners 
  FOR ALL 
  TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Política para transacciones: los administradores pueden hacer todo
CREATE POLICY admin_all_transactions ON transactions 
  FOR ALL 
  TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Política para gastos administrativos: los administradores pueden hacer todo
CREATE POLICY admin_all_admin_expenses ON admin_expenses 
  FOR ALL 
  TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Política para distribuciones de gastos: los administradores pueden hacer todo
CREATE POLICY admin_all_expense_distributions ON expense_distributions 
  FOR ALL 
  TO authenticated 
  USING (is_admin(auth.uid()))
  WITH CHECK (is_admin(auth.uid()));

-- Política temporal para desarrollo: permitir todas las operaciones a usuarios autenticados
-- NOTA: Esto es solo para desarrollo, debe eliminarse en producción
CREATE POLICY dev_all_clients ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY dev_all_client_owners ON client_owners FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY dev_all_transactions ON transactions FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY dev_all_admin_expenses ON admin_expenses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY dev_all_expense_distributions ON expense_distributions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Asignar rol de administrador a un usuario específico (reemplaza 'TU_USER_ID' con el ID real)
-- INSERT INTO user_roles (id, role) VALUES ('TU_USER_ID', 'admin');
