-- Función para verificar si RLS está habilitado en una tabla
CREATE OR REPLACE FUNCTION check_rls_enabled(table_name TEXT)
RETURNS BOOLEAN AS $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  SELECT relrowsecurity INTO rls_enabled
  FROM pg_class
  WHERE oid = (table_name::regclass)::oid;
  
  RETURN rls_enabled;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener las políticas de una tabla
CREATE OR REPLACE FUNCTION get_table_policies(table_name TEXT)
RETURNS TEXT[] AS $$
DECLARE
  policies TEXT[];
BEGIN
  SELECT array_agg(polname::TEXT) INTO policies
  FROM pg_policy
  WHERE polrelid = (table_name::regclass)::oid;
  
  RETURN policies;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
