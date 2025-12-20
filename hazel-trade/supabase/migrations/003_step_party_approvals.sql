-- Create table to track which parties have completed their part of each step
CREATE TABLE step_party_approvals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  party_role user_role NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  approved BOOLEAN DEFAULT FALSE,
  approved_at TIMESTAMP WITH TIME ZONE,
  document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(deal_id, step_number, party_role)
);

-- Create index for faster lookups
CREATE INDEX idx_step_party_approvals_deal_step ON step_party_approvals(deal_id, step_number);
CREATE INDEX idx_step_party_approvals_party ON step_party_approvals(party_role);

-- Row Level Security
ALTER TABLE step_party_approvals ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see approvals for deals they're part of
CREATE POLICY step_party_approvals_select ON step_party_approvals
  FOR SELECT USING (
    -- Broker can see all approvals for their deals
    EXISTS (SELECT 1 FROM deals WHERE deals.id = step_party_approvals.deal_id AND deals.broker_id = auth.uid())
    OR
    -- Buyer can see approvals for their deals
    EXISTS (
      SELECT 1 FROM deals
      JOIN users ON users.company_id = deals.buyer_id
      WHERE deals.id = step_party_approvals.deal_id AND users.id = auth.uid()
    )
    OR
    -- Seller can see approvals for their deals
    EXISTS (
      SELECT 1 FROM deals
      JOIN users ON users.company_id = deals.seller_id
      WHERE deals.id = step_party_approvals.deal_id AND users.id = auth.uid()
    )
  );

-- Function to initialize party approvals for a step
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
$$ LANGUAGE plpgsql;

-- Function to check if all parties have approved a step
CREATE OR REPLACE FUNCTION check_step_all_parties_approved(
  p_deal_id UUID,
  p_step_number INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
  total_required INTEGER;
  total_approved INTEGER;
BEGIN
  -- Count total required approvals
  SELECT COUNT(*) INTO total_required
  FROM step_party_approvals
  WHERE deal_id = p_deal_id AND step_number = p_step_number;

  -- Count approved
  SELECT COUNT(*) INTO total_approved
  FROM step_party_approvals
  WHERE deal_id = p_deal_id AND step_number = p_step_number AND approved = TRUE;

  -- Return true if all required parties have approved
  RETURN (total_required > 0 AND total_required = total_approved);
END;
$$ LANGUAGE plpgsql;
