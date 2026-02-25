export interface University {
  university_id: number;
  university_name: string;
  total_applications: number;
}

export interface Application {
  application_id: number;
  student_id: number;
  student_name_email: string;
  course_study_level_intake: string;
  study_level_id: number;
  total_installments_created: number;
  total_installments_paid: number;
  last_invoice_date: string | null;
  pending_installments: number;
  commission_value: string;
  commission_type: 'fixed' | 'percentage';
  no_of_installments: number;
  currency: string;
  student_name?: string; // Optional, could be fetched separately
  commissionable_tuition_fee?: number; // Added for the form
}

export interface GenerateInvoicePayload {
  university_id: number;
  applications: {
    application_id: number;
    commissionable_tuition_fee: number;
  }[];
}