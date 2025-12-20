-- Fix: Auto-activate Step 1 when deal is matched
-- This trigger was missing the logic to set Step 1 to IN_PROGRESS
-- Also initialize party approvals for Step 1

DROP TRIGGER IF EXISTS deal_match_trigger ON deals;
DROP FUNCTION IF EXISTS check_deal_match();

-- Updated function that also activates Step 1 and initializes party approvals
CREATE OR REPLACE FUNCTION check_deal_match()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.buyer_verified = TRUE AND NEW.seller_verified = TRUE AND OLD.matched_at IS NULL THEN
    NEW.matched_at = NOW();
    NEW.status = 'MATCHED';

    -- Also set Step 1 to IN_PROGRESS so workflow can begin
    UPDATE deal_steps
    SET status = 'IN_PROGRESS',
        started_at = NOW()
    WHERE deal_id = NEW.id
    AND step_number = 1;

    -- Initialize party approvals for Step 1 (NCNDA/IMFPA requires BUYER, SELLER, BROKER)
    PERFORM initialize_step_party_approvals(
      NEW.id,
      1,
      ARRAY['BUYER', 'SELLER', 'BROKER']
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deal_match_trigger BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION check_deal_match();
