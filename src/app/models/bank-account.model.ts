export interface BankAccount {
  id?: number;
  account_name: string;
  account_number: string;
  bank_code: string;
  bank_name: string;
  paystack_subaccount_code?: string | null;
  consultation_fee: number;
  status?: 'active' | 'pending_activation';
  created_at?: string;
  updated_at?: string;
}

export interface Bank {
  name: string;
  code: string;
  slug: string;
}

export interface ResolveAccountResponse {
  account_name: string;
  account_number: string;
}
