-- Fix Step 1 for existing matched deals
-- Sets Step 1 to IN_PROGRESS for all MATCHED deals

UPDATE deal_steps
SET status = 'IN_PROGRESS',
    started_at = NOW()
WHERE step_number = 1
AND deal_id IN (
  SELECT id FROM deals WHERE status = 'MATCHED'
)
AND status = 'PENDING';

-- Show results
SELECT
  d.deal_number,
  d.status as deal_status,
  ds.step_number,
  ds.status as step_status,
  ds.started_at
FROM deals d
JOIN deal_steps ds ON ds.deal_id = d.id
WHERE d.status = 'MATCHED'
AND ds.step_number = 1;
