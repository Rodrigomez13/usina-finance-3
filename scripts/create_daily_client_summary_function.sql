-- Improved function for daily client summary
CREATE OR REPLACE FUNCTION get_daily_client_summary(start_date DATE, end_date DATE)
RETURNS TABLE (
  date TEXT,
  client_id INTEGER,
  client_name TEXT,
  leads NUMERIC,
  expenses NUMERIC,
  funding NUMERIC,
  balance NUMERIC
) AS $
BEGIN
  -- Handle potential errors
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
      WHERE date::date BETWEEN start_date AND end_date
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
  EXCEPTION WHEN OTHERS THEN
    -- Log the error and return empty result
    RAISE NOTICE 'Error in get_daily_client_summary: %', SQLERRM;
    RETURN QUERY SELECT 
      current_date::text, 0, 'Error', 0, 0, 0, 0
    WHERE false; -- Empty result set
  END;
END;
$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_daily_client_summary TO authenticated, anon;

-- Create a function to get transactions in date range (fallback)
CREATE OR REPLACE FUNCTION get_transactions_in_range(start_date TIMESTAMP, end_date TIMESTAMP)
RETURNS TABLE (
  transaction_id INTEGER,
  owner_name TEXT,
  client_name TEXT,
  type TEXT,
  amount NUMERIC,
  date TIMESTAMP,
  notes TEXT
) AS $
BEGIN
  RETURN QUERY
  SELECT 
    t.id AS transaction_id,
    co.name AS owner_name,
    c.name AS client_name,
    t.type,
    t.amount,
    t.date,
    t.notes
  FROM transactions t
  JOIN clients c ON t.client_id = c.id
  LEFT JOIN client_owners co ON c.owner_id = co.id
  WHERE t.date BETWEEN start_date AND end_date
  ORDER BY t.date DESC
  LIMIT 50;
END;
$ LANGUAGE plpgsql;

-- Grant permissions for the fallback function
GRANT EXECUTE ON FUNCTION get_transactions_in_range TO authenticated, anon;
