// src/app/models/lab.model.ts

export type LabOrderStatus =
  | 'ORDERED'
  | 'BOOKED'
  | 'SAMPLE_COLLECTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED';

export type LabPriority = 'NORMAL' | 'URGENT';
export type TestStatus  = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
export type SampleStatus = 'COLLECTED' | 'PROCESSING' | 'USED';
export type ReportStatus = 'DRAFT' | 'FINAL';

export interface LabTestItem {
  testName: string;
  testCode?: string;
}

// Known tests catalogue shown to doctor in consultation form
export const LAB_TEST_CATALOGUE: LabTestItem[] = [
  { testName: 'Complete Blood Count (CBC)',           testCode: 'CBC' },
  { testName: 'Liver Function Test (LFT)',            testCode: 'LFT' },
  { testName: 'Kidney Function Test (RFT)',           testCode: 'RFT' },
  { testName: 'Blood Glucose (Fasting)',              testCode: 'BGF' },
  { testName: 'Blood Glucose (Post-prandial)',        testCode: 'BGPP' },
  { testName: 'HbA1c',                               testCode: 'HBA1C' },
  { testName: 'Lipid Profile',                       testCode: 'LIPID' },
  { testName: 'Thyroid Function Test (TFT)',          testCode: 'TFT' },
  { testName: 'Urine Routine & Microscopy',          testCode: 'URINE' },
  { testName: 'Serum Electrolytes',                  testCode: 'ELEC' },
  { testName: 'Serum Creatinine',                    testCode: 'CREAT' },
  { testName: 'Serum Uric Acid',                     testCode: 'URIC' },
  { testName: 'C-Reactive Protein (CRP)',            testCode: 'CRP' },
  { testName: 'ESR',                                 testCode: 'ESR' },
  { testName: 'Dengue NS1 Antigen',                  testCode: 'DENGUE' },
  { testName: 'Malaria Antigen',                     testCode: 'MALARIA' },
  { testName: 'COVID-19 RT-PCR',                     testCode: 'COVID' },
  { testName: 'Stool Routine',                       testCode: 'STOOL' },
  { testName: 'Sputum Culture',                      testCode: 'SPUTUM' },
  { testName: 'Blood Culture',                       testCode: 'BLDCUL' },
];

export interface LabOrderTestDto {
  id: number;
  testName: string;
  testCode?: string;
  status: TestStatus;
  resultValue?: string;
  unit?: string;
  referenceRange?: string;
  remarks?: string;
}

export interface SampleDto {
  id: number;
  labOrderId: number;
  sampleType: string;
  sampleNotes?: string;
  barcode?: string;
  collectedBy: number;
  collectedAt: string;
  status: SampleStatus;
}

export interface LabReportDto {
  id: number;
  labOrderId: number;
  reportData?: string;
  reportUrl?: string;
  summary?: string;
  status: ReportStatus;
  generatedBy: number;
  generatedAt: string;
  finalizedAt?: string;
}

export interface LabOrder {
  id: number;
  patientId: number;
  patientName?: string;
  episodeId?: number;
  appointmentId?: number;
  encounterId?: number;
  doctorId: number;
  doctorName?: string;
  hospitalId: number;
  labAppointmentId?: number;
  status: LabOrderStatus;
  priority: LabPriority;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  tests: LabOrderTestDto[];
  sample?: SampleDto;
  report?: LabReportDto;
}

export interface LabOrderRequest {
  patientId: number;
  episodeId?: number;
  appointmentId?: number;
  encounterId?: number;
  doctorId: number;
  hospitalId: number;
  priority: LabPriority;
  notes?: string;
  tests: LabTestItem[];
}

export interface SampleCollectionRequest {
  sampleType: string;
  sampleNotes?: string;
}

export interface TestResultRequest {
  testId: number;
  resultValue: string;
  unit?: string;
  referenceRange?: string;
  remarks?: string;
}

export interface LabResultsRequest {
  results: TestResultRequest[];
}

export interface GenerateReportRequest {
  summary?: string;
}

export interface BookLabAppointmentRequest {
  appointmentStart: string;
  appointmentEnd: string;
  labTechnicianId?: number;
}

// Status display helpers
export const STATUS_LABELS: Record<LabOrderStatus, string> = {
  ORDERED:          'Ordered',
  BOOKED:           'Booked',
  SAMPLE_COLLECTED: 'Sample Collected',
  IN_PROGRESS:      'In Progress',
  COMPLETED:        'Completed',
  CANCELLED:        'Cancelled',
};

export const STATUS_COLORS: Record<LabOrderStatus, string> = {
  ORDERED:          '#667eea',
  BOOKED:           '#4299e1',
  SAMPLE_COLLECTED: '#ed8936',
  IN_PROGRESS:      '#f59e0b',
  COMPLETED:        '#48bb78',
  CANCELLED:        '#f56565',
};

// Status flow — next action for each status
export const STATUS_FLOW: Partial<Record<LabOrderStatus, LabOrderStatus>> = {
  ORDERED:          'BOOKED',
  BOOKED:           'SAMPLE_COLLECTED',
  SAMPLE_COLLECTED: 'IN_PROGRESS',
  IN_PROGRESS:      'COMPLETED',
};