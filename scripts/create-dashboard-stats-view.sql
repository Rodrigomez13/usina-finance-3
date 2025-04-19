-- Vista para estadísticas del dashboard
CREATE OR REPLACE FUNCTION get_dashboard_stats(start_date DATE, end_date DATE)
RETURNS TABLE (
  total_leads NUMERIC,
  total_expenses NUMERIC,
  total_funding NUMERIC,
  balance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(CASE WHEN type = 'lead' THEN amount ELSE 0 END), 0) AS total_leads,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS total_expenses,
    COALESCE(SUM(CASE WHEN type = 'funding' THEN amount ELSE 0 END), 0) AS total_funding,
    COALESCE(SUM(CASE WHEN type = 'funding' THEN amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) AS balance
  FROM transactions
  WHERE date >= start_date AND date <= end_date;
END;
$$ LANGUAGE plpgsql;

-- Vista para estadísticas por cliente
CREATE OR REPLACE FUNCTION get_client_stats(start_date DATE, end_date DATE)
RETURNS TABLE (
  client_id INTEGER,
  client_name TEXT,
  leads NUMERIC,
  expenses NUMERIC,
  funding NUMERIC,
  balance NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id AS client_id,
    c.name AS client_name,
    COALESCE(SUM(CASE WHEN t.type = 'lead' THEN t.amount ELSE 0 END), 0) AS leads,
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS expenses,
    COALESCE(SUM(CASE WHEN t.type = 'funding' THEN t.amount ELSE 0 END), 0) AS funding,
    COALESCE(SUM(CASE WHEN t.type = 'funding' THEN t.amount ELSE 0 END), 0) - 
    COALESCE(SUM(CASE WHEN t.type = 'expense' THEN t.amount ELSE 0 END), 0) AS balance
  FROM clients c
  LEFT JOIN transactions t ON c.id = t.client_id AND t.date BETWEEN start_date AND end_date
  GROUP BY c.id, c.name
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- Vista para transacciones recientes
CREATE OR REPLACE FUNCTION get_recent_transactions(start_date DATE, end_date DATE, limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  id INTEGER,
  client_id INTEGER,
  client_name TEXT,
  type TEXT,
  amount NUMERIC,
  date DATE,
  notes TEXT,
  payment_method TEXT,
  category TEXT,
  cost_per_lead NUMERIC,
  created_at TIMESTAMP,
  created_by TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id,
    t.client_id,
    c.name AS client_name,
    t.type,
    t.amount,
    t.date::DATE,
    t.notes,
    t.payment_method,
    t.category,
    t.cost_per_lead,
    t.created_at,
    t.created_by
  FROM transactions t
  JOIN clients c ON t.client_id = c.id
  WHERE t.date BETWEEN start_date AND end_date
  ORDER BY t.date DESC, t.id DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;
