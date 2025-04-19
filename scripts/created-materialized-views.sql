-- Vista materializada para el resumen diario por cliente
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_client_summary AS
SELECT
  date::date,
  client_id,
  c.name AS client_name,
  c.owner_id,
  SUM(CASE WHEN type = 'lead' THEN amount ELSE 0 END) AS leads,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses,
  SUM(CASE WHEN type = 'funding' THEN amount ELSE 0 END) AS funding,
  SUM(CASE WHEN type = 'funding' THEN amount ELSE 0 END) - 
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS balance,
  CASE 
    WHEN SUM(CASE WHEN type = 'lead' THEN amount ELSE 0 END) > 0 
    THEN SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) / SUM(CASE WHEN type = 'lead' THEN amount ELSE 0 END)
    ELSE 0
  END AS cac
FROM transactions t
JOIN clients c ON t.client_id = c.id
GROUP BY date::date, client_id, c.name, c.owner_id
ORDER BY date, c.name;

-- Índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_daily_client_summary_date ON daily_client_summary(date);
CREATE INDEX IF NOT EXISTS idx_daily_client_summary_client ON daily_client_summary(client_id);
CREATE INDEX IF NOT EXISTS idx_daily_client_summary_owner ON daily_client_summary(owner_id);

-- Vista materializada para el resumen mensual por cliente
CREATE MATERIALIZED VIEW IF NOT EXISTS monthly_client_summary AS
SELECT
  TO_CHAR(date, 'YYYY-MM') AS month,
  client_id,
  c.name AS client_name,
  c.owner_id,
  SUM(CASE WHEN type = 'lead' THEN amount ELSE 0 END) AS leads,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS expenses,
  SUM(CASE WHEN type = 'funding' THEN amount ELSE 0 END) AS funding,
  SUM(CASE WHEN type = 'funding' THEN amount ELSE 0 END) - 
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) AS balance,
  CASE 
    WHEN SUM(CASE WHEN type = 'lead' THEN amount ELSE 0 END) > 0 
    THEN SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) / SUM(CASE WHEN type = 'lead' THEN amount ELSE 0 END)
    ELSE 0
  END AS cac
FROM transactions t
JOIN clients c ON t.client_id = c.id
GROUP BY TO_CHAR(date, 'YYYY-MM'), client_id, c.name, c.owner_id
ORDER BY month, c.name;

-- Índices para la vista mensual
CREATE INDEX IF NOT EXISTS idx_monthly_client_summary_month ON monthly_client_summary(month);
CREATE INDEX IF NOT EXISTS idx_monthly_client_summary_client ON monthly_client_summary(client_id);
CREATE INDEX IF NOT EXISTS idx_monthly_client_summary_owner ON monthly_client_summary(owner_id);

-- Vista materializada para gastos administrativos por cliente
CREATE MATERIALIZED VIEW IF NOT EXISTS admin_expenses_by_client AS
SELECT
  ed.client_id,
  c.name AS client_name,
  c.owner_id,
  ae.id AS expense_id,
  ae.concept,
  ae.date,
  ae.status AS expense_status,
  ed.amount,
  ed.percentage,
  ed.status AS distribution_status
FROM expense_distributions ed
JOIN admin_expenses ae ON ed.expense_id = ae.id
JOIN clients c ON ed.client_id = c.id
ORDER BY ae.date DESC, c.name;

-- Índices para la vista de gastos administrativos
CREATE INDEX IF NOT EXISTS idx_admin_expenses_by_client_date ON admin_expenses_by_client(date);
CREATE INDEX IF NOT EXISTS idx_admin_expenses_by_client_client ON admin_expenses_by_client(client_id);
CREATE INDEX IF NOT EXISTS idx_admin_expenses_by_client_owner ON admin_expenses_by_client(owner_id);

-- Función para refrescar todas las vistas materializadas
CREATE OR REPLACE FUNCTION refresh_all_materialized_views()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW daily_client_summary;
  REFRESH MATERIALIZED VIEW monthly_client_summary;
  REFRESH MATERIALIZED VIEW admin_expenses_by_client;
END;
$$ LANGUAGE plpgsql;

-- Programar la actualización automática (esto requiere permisos especiales en Supabase)
-- Comentado porque puede requerir configuración adicional
-- SELECT cron.schedule('refresh_materialized_views', '0 1 * * *', 'SELECT refresh_all_materialized_views()');
