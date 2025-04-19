-- Crear una función para obtener el resumen diario por cliente
CREATE OR REPLACE FUNCTION get_daily_client_summary(start_date DATE, end_date DATE)
RETURNS TABLE (
  date TEXT,
  client_id INTEGER,
  client_name TEXT,
  leads NUMERIC,
  expenses NUMERIC,
  funding NUMERIC,
  balance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH dates AS (
    SELECT generate_series(start_date, end_date, '1 day'::interval)::date AS date
  ),
  clients AS (
    SELECT id, name FROM clients
  ),
  date_client_combinations AS (
    SELECT 
      dates.date,
      clients.id AS client_id,
      clients.name AS client_name
    FROM dates CROSS JOIN clients
  ),
  daily_transactions AS (
    SELECT
      date::date,
      client_id,
      SUM(CASE WHEN type = 'lead' THEN amount ELSE 0 END) AS leads,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses,
      SUM(CASE WHEN type = 'funding' THEN amount ELSE 0 END) AS funding
    FROM transactions
    WHERE date >= start_date AND date <= end_date
    GROUP BY date::date, client_id
  )
  SELECT
    to_char(dcc.date, 'YYYY-MM-DD') AS date,
    dcc.client_id,
    dcc.client_name,
    COALESCE(dt.leads, 0) AS leads,
    COALESCE(dt.expenses, 0) AS expenses,
    COALESCE(dt.funding, 0) AS funding,
    COALESCE(dt.funding, 0) - COALESCE(dt.expenses, 0) AS balance
  FROM date_client_combinations dcc
  LEFT JOIN daily_transactions dt ON dcc.date = dt.date AND dcc.client_id = dt.client_id
  ORDER BY dcc.date, dcc.client_name;
END;
$$ LANGUAGE plpgsql;

-- Alternativamente, puedes crear una vista materializada para mejorar el rendimiento
-- (Esto requiere permisos adicionales en Supabase)
/*
CREATE MATERIALIZED VIEW daily_client_summary AS
SELECT
  date::date,
  client_id,
  c.name AS client_name,
  SUM(CASE WHEN type = 'lead' THEN amount ELSE 0 END) AS leads,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses,
  SUM(CASE WHEN type = 'funding' THEN amount ELSE 0 END) AS funding,
  SUM(CASE WHEN type = 'funding' THEN amount ELSE 0 END) - 
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS balance
FROM transactions t
JOIN clients c ON t.client_id = c.id
GROUP BY date::date, client_id, c.name
ORDER BY date, c.name;

-- Crear un índice para mejorar el rendimiento de consultas
CREATE INDEX idx_daily_client_summary_date ON daily_client_summary(date);
CREATE INDEX idx_daily_client_summary_client ON daily_client_summary(client_id);

-- Función para refrescar la vista materializada
CREATE OR REPLACE FUNCTION refresh_daily_client_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW daily_client_summary;
END;
$$ LANGUAGE plpgsql;
*/
