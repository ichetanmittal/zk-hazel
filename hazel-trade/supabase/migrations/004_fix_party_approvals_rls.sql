-- Fix: Add INSERT and UPDATE policies for step_party_approvals
-- This allows the initialize_step_party_approvals function to work properly

-- Policy: Allow inserts for party approvals (needed for initialization)
CREATE POLICY step_party_approvals_insert ON step_party_approvals
  FOR INSERT WITH CHECK (
    -- Broker can create approvals for their deals
    EXISTS (SELECT 1 FROM deals WHERE deals.id = step_party_approvals.deal_id AND deals.broker_id = auth.uid())
    OR
    -- Buyer can create approvals for their deals
    EXISTS (
      SELECT 1 FROM deals
      JOIN users ON users.company_id = deals.buyer_id
      WHERE deals.id = step_party_approvals.deal_id AND users.id = auth.uid()
    )
    OR
    -- Seller can create approvals for their deals
    EXISTS (
      SELECT 1 FROM deals
      JOIN users ON users.company_id = deals.seller_id
      WHERE deals.id = step_party_approvals.deal_id AND users.id = auth.uid()
    )
  );

-- Policy: Allow updates for party approvals
CREATE POLICY step_party_approvals_update ON step_party_approvals
  FOR UPDATE USING (
    -- Broker can update approvals for their deals
    EXISTS (SELECT 1 FROM deals WHERE deals.id = step_party_approvals.deal_id AND deals.broker_id = auth.uid())
    OR
    -- Buyer can update approvals for their deals
    EXISTS (
      SELECT 1 FROM deals
      JOIN users ON users.company_id = deals.buyer_id
      WHERE deals.id = step_party_approvals.deal_id AND users.id = auth.uid()
    )
    OR
    -- Seller can update approvals for their deals
    EXISTS (
      SELECT 1 FROM deals
      JOIN users ON users.company_id = deals.seller_id
      WHERE deals.id = step_party_approvals.deal_id AND users.id = auth.uid()
    )
  );

-- Additionally, make the trigger functions run with SECURITY DEFINER
-- to bypass RLS entirely for admin operations

DROP FUNCTION IF EXISTS check_deal_match() CASCADE;
DROP FUNCTION IF EXISTS initialize_step_party_approvals(UUID, INTEGER, TEXT[]) CASCADE;

-- Recreate initialize function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION initialize_step_party_approvals(
  p_deal_id UUID,
  p_step_number INTEGER,
  p_required_parties TEXT[]
)
RETURNS VOID AS $$
BEGIN
  -- Insert approval records for each required party
  INSERT INTO step_party_approvals (deal_id, step_number, party_role, approved)
  SELECT p_deal_id, p_step_number, party::user_role, FALSE
  FROM unnest(p_required_parties) AS party
  ON CONFLICT (deal_id, step_number, party_role) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger function with SECURITY DEFINER
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER deal_match_trigger BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION check_deal_match();
