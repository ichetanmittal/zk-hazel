-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('BUYER', 'SELLER', 'BROKER');
CREATE TYPE user_status AS ENUM ('PENDING', 'ACTIVE', 'SUSPENDED');
CREATE TYPE verification_status AS ENUM ('UNVERIFIED', 'PENDING', 'VERIFIED', 'REJECTED');
CREATE TYPE product_type AS ENUM ('JET_A1', 'EN590', 'D6', 'LNG', 'CRUDE', 'OTHER');
CREATE TYPE quantity_unit AS ENUM ('MT', 'BBL', 'MMBTU');
CREATE TYPE delivery_terms AS ENUM ('FOB', 'CIF', 'EX_TANK', 'DES', 'DAP');
CREATE TYPE deal_status AS ENUM ('DRAFT', 'PENDING_VERIFICATION', 'MATCHED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE step_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED');
CREATE TYPE document_type AS ENUM (
  'NCNDA', 'IMFPA', 'ICPO', 'SCO', 'SPA',
  'POF_MT799', 'POF_MT760', 'POF_BCL', 'POF_MT199', 'POF_FINANCIAL_STATEMENT',
  'POP_TSA', 'POP_SGS', 'POP_ATSC', 'POP_CERTIFICATE_ORIGIN', 'POP_INJECTION_REPORT', 'POP_EXPORT_LICENSE',
  'DTA', 'INSPECTION_REPORT', 'PAYMENT_MT103', 'TITLE_TRANSFER', 'BILL_OF_LADING', 'OTHER'
);
CREATE TYPE document_folder AS ENUM ('AGREEMENTS', 'POF', 'POP', 'CONTRACTS', 'INSPECTION', 'PAYMENT');
CREATE TYPE commission_type AS ENUM ('PERCENTAGE', 'FIXED', 'PER_UNIT');
CREATE TYPE commission_status AS ENUM ('PENDING', 'PARTIALLY_PAID', 'PAID');
CREATE TYPE notification_type AS ENUM (
  'DEAL_CREATED', 'INVITE_RECEIVED', 'VERIFICATION_COMPLETE', 'MATCH_CONFIRMED',
  'STEP_COMPLETED', 'DOCUMENT_UPLOADED', 'ACTION_REQUIRED', 'DEAL_COMPLETED'
);
CREATE TYPE invite_status AS ENUM ('PENDING', 'ACCEPTED', 'EXPIRED');

-- Companies table
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  registration_number TEXT NOT NULL,
  year_established INTEGER NOT NULL,
  company_type TEXT NOT NULL,
  address TEXT NOT NULL,
  website TEXT,
  verification_status verification_status DEFAULT 'UNVERIFIED',
  verified_at TIMESTAMP WITH TIME ZONE,
  zk_proof_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role user_role NOT NULL,
  company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  email_verified BOOLEAN DEFAULT FALSE,
  status user_status DEFAULT 'PENDING'
);

-- Deals table
CREATE TABLE deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_number TEXT UNIQUE NOT NULL,
  product_type product_type NOT NULL,
  quantity DECIMAL NOT NULL,
  quantity_unit quantity_unit NOT NULL,
  estimated_value DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  delivery_terms delivery_terms NOT NULL,
  location TEXT NOT NULL,
  notes TEXT,
  buyer_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  seller_id UUID REFERENCES companies(id) ON DELETE SET NULL,
  broker_id UUID REFERENCES users(id) NOT NULL,
  status deal_status DEFAULT 'DRAFT',
  current_step INTEGER DEFAULT 1,
  buyer_verified BOOLEAN DEFAULT FALSE,
  seller_verified BOOLEAN DEFAULT FALSE,
  matched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Deal Steps table
CREATE TABLE deal_steps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  status step_status DEFAULT 'PENDING',
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
  notes TEXT,
  UNIQUE(deal_id, step_number)
);

-- Documents table
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES users(id) NOT NULL,
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_url TEXT NOT NULL,
  document_type document_type NOT NULL,
  folder document_folder NOT NULL,
  step_number INTEGER NOT NULL,
  verification_status verification_status DEFAULT 'PENDING',
  zk_proof_id TEXT,
  verified_at TIMESTAMP WITH TIME ZONE,
  visible_to_buyer BOOLEAN DEFAULT TRUE,
  visible_to_seller BOOLEAN DEFAULT TRUE,
  visible_to_broker BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Commissions table
CREATE TABLE commissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
  commission_type commission_type NOT NULL,
  commission_rate DECIMAL NOT NULL,
  total_amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USD',
  distributions JSONB NOT NULL,
  status commission_status DEFAULT 'PENDING',
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Notifications table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invites table
CREATE TABLE invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  deal_id UUID REFERENCES deals(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT NOT NULL,
  role user_role NOT NULL CHECK (role IN ('BUYER', 'SELLER')),
  invited_by UUID REFERENCES users(id) NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status invite_status DEFAULT 'PENDING',
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company_id ON users(company_id);
CREATE INDEX idx_deals_broker_id ON deals(broker_id);
CREATE INDEX idx_deals_buyer_id ON deals(buyer_id);
CREATE INDEX idx_deals_seller_id ON deals(seller_id);
CREATE INDEX idx_deals_status ON deals(status);
CREATE INDEX idx_deal_steps_deal_id ON deal_steps(deal_id);
CREATE INDEX idx_documents_deal_id ON documents(deal_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_invites_token ON invites(token);
CREATE INDEX idx_invites_email ON invites(email);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deals_updated_at BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to check and update deal match status
CREATE OR REPLACE FUNCTION check_deal_match()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.buyer_verified = TRUE AND NEW.seller_verified = TRUE AND OLD.matched_at IS NULL THEN
    NEW.matched_at = NOW();
    NEW.status = 'MATCHED';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deal_match_trigger BEFORE UPDATE ON deals
  FOR EACH ROW EXECUTE FUNCTION check_deal_match();

-- Function to generate deal number
CREATE OR REPLACE FUNCTION generate_deal_number()
RETURNS TEXT AS $$
DECLARE
  year_part TEXT;
  sequence_num INTEGER;
  deal_num TEXT;
BEGIN
  year_part := TO_CHAR(NOW(), 'YYYY');

  SELECT COUNT(*) + 1 INTO sequence_num
  FROM deals
  WHERE deal_number LIKE 'HT-' || year_part || '%';

  deal_num := 'HT-' || year_part || '-' || LPAD(sequence_num::TEXT, 4, '0');

  RETURN deal_num;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY users_select_own ON users
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY users_update_own ON users
  FOR UPDATE USING (auth.uid() = id);

-- Brokers can see all deals they created
CREATE POLICY deals_broker_all ON deals
  FOR ALL USING (broker_id = auth.uid());

-- Buyers can see deals they're part of (after being added)
CREATE POLICY deals_buyer_select ON deals
  FOR SELECT USING (
    buyer_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Sellers can see deals they're part of (after being added)
CREATE POLICY deals_seller_select ON deals
  FOR SELECT USING (
    seller_id IN (SELECT company_id FROM users WHERE id = auth.uid())
  );

-- Documents visibility based on role and verification status
CREATE POLICY documents_select ON documents
  FOR SELECT USING (
    -- Broker can see all documents in their deals
    EXISTS (SELECT 1 FROM deals WHERE deals.id = documents.deal_id AND deals.broker_id = auth.uid())
    OR
    -- Buyer can see documents if visible_to_buyer is true
    (visible_to_buyer = TRUE AND EXISTS (
      SELECT 1 FROM deals
      JOIN users ON users.company_id = deals.buyer_id
      WHERE deals.id = documents.deal_id AND users.id = auth.uid()
    ))
    OR
    -- Seller can see documents if visible_to_seller is true
    (visible_to_seller = TRUE AND EXISTS (
      SELECT 1 FROM deals
      JOIN users ON users.company_id = deals.seller_id
      WHERE deals.id = documents.deal_id AND users.id = auth.uid()
    ))
  );

-- Notifications are visible only to the intended user
CREATE POLICY notifications_select_own ON notifications
  FOR SELECT USING (user_id = auth.uid());

-- Invites can be read by the inviter or invitee
CREATE POLICY invites_select ON invites
  FOR SELECT USING (
    invited_by = auth.uid() OR email = (SELECT email FROM users WHERE id = auth.uid())
  );
