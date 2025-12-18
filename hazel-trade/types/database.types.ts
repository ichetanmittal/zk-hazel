export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type UserRole = 'BUYER' | 'SELLER' | 'BROKER'

export type VerificationStatus = 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'REJECTED'

export type UserStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED'

export type ProductType = 'JET_A1' | 'EN590' | 'D6' | 'LNG' | 'CRUDE' | 'OTHER'

export type QuantityUnit = 'MT' | 'BBL' | 'MMBTU'

export type DeliveryTerms = 'FOB' | 'CIF' | 'EX_TANK' | 'DES' | 'DAP'

export type DealStatus =
  | 'DRAFT'
  | 'PENDING_VERIFICATION'
  | 'MATCHED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'

export type StepStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED'

export type DocumentType =
  | 'NCNDA'
  | 'IMFPA'
  | 'ICPO'
  | 'SCO'
  | 'SPA'
  | 'POF_MT799'
  | 'POF_MT760'
  | 'POF_BCL'
  | 'POF_MT199'
  | 'POF_FINANCIAL_STATEMENT'
  | 'POP_TSA'
  | 'POP_SGS'
  | 'POP_ATSC'
  | 'POP_CERTIFICATE_ORIGIN'
  | 'POP_INJECTION_REPORT'
  | 'POP_EXPORT_LICENSE'
  | 'DTA'
  | 'INSPECTION_REPORT'
  | 'PAYMENT_MT103'
  | 'TITLE_TRANSFER'
  | 'BILL_OF_LADING'
  | 'OTHER'

export type DocumentFolder =
  | 'AGREEMENTS'
  | 'POF'
  | 'POP'
  | 'CONTRACTS'
  | 'INSPECTION'
  | 'PAYMENT'

export type CommissionType = 'PERCENTAGE' | 'FIXED' | 'PER_UNIT'

export type CommissionStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID'

export type NotificationType =
  | 'DEAL_CREATED'
  | 'INVITE_RECEIVED'
  | 'VERIFICATION_COMPLETE'
  | 'MATCH_CONFIRMED'
  | 'STEP_COMPLETED'
  | 'DOCUMENT_UPLOADED'
  | 'ACTION_REQUIRED'
  | 'DEAL_COMPLETED'

export type InviteStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED'

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          full_name: string
          phone: string | null
          role: UserRole
          company_id: string | null
          created_at: string
          updated_at: string
          last_login: string | null
          email_verified: boolean
          status: UserStatus
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          full_name: string
          phone?: string | null
          role: UserRole
          company_id?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          email_verified?: boolean
          status?: UserStatus
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          full_name?: string
          phone?: string | null
          role?: UserRole
          company_id?: string | null
          created_at?: string
          updated_at?: string
          last_login?: string | null
          email_verified?: boolean
          status?: UserStatus
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          country: string
          registration_number: string
          year_established: number
          company_type: string
          address: string
          website: string | null
          verification_status: VerificationStatus
          verified_at: string | null
          zk_proof_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          country: string
          registration_number: string
          year_established: number
          company_type: string
          address: string
          website?: string | null
          verification_status?: VerificationStatus
          verified_at?: string | null
          zk_proof_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          country?: string
          registration_number?: string
          year_established?: number
          company_type?: string
          address?: string
          website?: string | null
          verification_status?: VerificationStatus
          verified_at?: string | null
          zk_proof_id?: string | null
          created_at?: string
        }
      }
      deals: {
        Row: {
          id: string
          deal_number: string
          product_type: ProductType
          quantity: number
          quantity_unit: QuantityUnit
          estimated_value: number
          currency: string
          delivery_terms: DeliveryTerms
          location: string
          notes: string | null
          buyer_id: string | null
          seller_id: string | null
          broker_id: string
          status: DealStatus
          current_step: number
          buyer_verified: boolean
          seller_verified: boolean
          matched_at: string | null
          created_at: string
          updated_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          deal_number: string
          product_type: ProductType
          quantity: number
          quantity_unit: QuantityUnit
          estimated_value: number
          currency?: string
          delivery_terms: DeliveryTerms
          location: string
          notes?: string | null
          buyer_id?: string | null
          seller_id?: string | null
          broker_id: string
          status?: DealStatus
          current_step?: number
          buyer_verified?: boolean
          seller_verified?: boolean
          matched_at?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          deal_number?: string
          product_type?: ProductType
          quantity?: number
          quantity_unit?: QuantityUnit
          estimated_value?: number
          currency?: string
          delivery_terms?: DeliveryTerms
          location?: string
          notes?: string | null
          buyer_id?: string | null
          seller_id?: string | null
          broker_id?: string
          status?: DealStatus
          current_step?: number
          buyer_verified?: boolean
          seller_verified?: boolean
          matched_at?: string | null
          created_at?: string
          updated_at?: string
          completed_at?: string | null
        }
      }
      deal_steps: {
        Row: {
          id: string
          deal_id: string
          step_number: number
          step_name: string
          status: StepStatus
          started_at: string | null
          completed_at: string | null
          completed_by: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          deal_id: string
          step_number: number
          step_name: string
          status?: StepStatus
          started_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          deal_id?: string
          step_number?: number
          step_name?: string
          status?: StepStatus
          started_at?: string | null
          completed_at?: string | null
          completed_by?: string | null
          notes?: string | null
        }
      }
      documents: {
        Row: {
          id: string
          deal_id: string
          uploaded_by: string
          filename: string
          file_type: string
          file_size: number
          file_url: string
          document_type: DocumentType
          folder: DocumentFolder
          step_number: number
          verification_status: VerificationStatus
          zk_proof_id: string | null
          verified_at: string | null
          visible_to_buyer: boolean
          visible_to_seller: boolean
          visible_to_broker: boolean
          created_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          uploaded_by: string
          filename: string
          file_type: string
          file_size: number
          file_url: string
          document_type: DocumentType
          folder: DocumentFolder
          step_number: number
          verification_status?: VerificationStatus
          zk_proof_id?: string | null
          verified_at?: string | null
          visible_to_buyer?: boolean
          visible_to_seller?: boolean
          visible_to_broker?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          deal_id?: string
          uploaded_by?: string
          filename?: string
          file_type?: string
          file_size?: number
          file_url?: string
          document_type?: DocumentType
          folder?: DocumentFolder
          step_number?: number
          verification_status?: VerificationStatus
          zk_proof_id?: string | null
          verified_at?: string | null
          visible_to_buyer?: boolean
          visible_to_seller?: boolean
          visible_to_broker?: boolean
          created_at?: string
        }
      }
      commissions: {
        Row: {
          id: string
          deal_id: string
          commission_type: CommissionType
          commission_rate: number
          total_amount: number
          currency: string
          distributions: Json
          status: CommissionStatus
          paid_at: string | null
        }
        Insert: {
          id?: string
          deal_id: string
          commission_type: CommissionType
          commission_rate: number
          total_amount: number
          currency?: string
          distributions: Json
          status?: CommissionStatus
          paid_at?: string | null
        }
        Update: {
          id?: string
          deal_id?: string
          commission_type?: CommissionType
          commission_rate?: number
          total_amount?: number
          currency?: string
          distributions?: Json
          status?: CommissionStatus
          paid_at?: string | null
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          deal_id: string | null
          type: NotificationType
          title: string
          message: string
          action_url: string | null
          read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          deal_id?: string | null
          type: NotificationType
          title: string
          message: string
          action_url?: string | null
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          deal_id?: string | null
          type?: NotificationType
          title?: string
          message?: string
          action_url?: string | null
          read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      invites: {
        Row: {
          id: string
          deal_id: string
          email: string
          company_name: string
          role: 'BUYER' | 'SELLER'
          invited_by: string
          token: string
          status: InviteStatus
          sent_at: string
          accepted_at: string | null
          expires_at: string
        }
        Insert: {
          id?: string
          deal_id: string
          email: string
          company_name: string
          role: 'BUYER' | 'SELLER'
          invited_by: string
          token: string
          status?: InviteStatus
          sent_at?: string
          accepted_at?: string | null
          expires_at: string
        }
        Update: {
          id?: string
          deal_id?: string
          email?: string
          company_name?: string
          role?: 'BUYER' | 'SELLER'
          invited_by?: string
          token?: string
          status?: InviteStatus
          sent_at?: string
          accepted_at?: string | null
          expires_at?: string
        }
      }
    }
  }
}
