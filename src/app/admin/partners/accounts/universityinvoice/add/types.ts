export interface University {
  university_id: number;
  university_name: string;
}

export interface Application {
  application_id: number;
  acknowledgement_no: string;
  student_name: string;
  generated_intallments: number;
  intake_year: number;
  intake_name: string;
  study_level: string;
  tuition_fee: string;
  currency_code: string;
  no_of_installments: number;
  university_id: number;
  university_name: string;
  application_status: string;
}

export interface Installment {
  id: number;
  installment_no: number;
  commission_amt: string;
  commissionable_tuition_fee?: string;
  created_at: string;
}

export interface ApplicationWithInstallments {
  application_id: number;
  acknowledgement_no: string;
  student_name: string;
  intake_year: number;
  course_level: string;
  generated_intallments: number;
  no_of_installments: number;
  installments: Installment[];
  
  // Add these properties from the API response
  tuition_fee: string;
  currency_code: string;
  commission_type: 'percentage' | 'fixed';
  tenant_commission: string;
}

export interface CommissionNoteItem {
  application_id: number;
  student_id: number;
  acknowledgement_no: string;
  student_name: string;
  intake_year: string;
  course_level: string;
  generated_intallments: number;
  no_of_installments: number;
  installments: Installment[];
}

export interface CommissionNotePayload {
  university_id: number;
  commission_type: string;
  commissionable_tuition_fee: number;
  applications: Array<{
    application_id: number;
    commission_amt: number;
    installment_no: number;
  }>;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  pagination?: Pagination;
}