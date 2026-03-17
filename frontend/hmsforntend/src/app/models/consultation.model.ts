import { Prescription } from './prescription.model';

export interface Consultation {
  id?: number;
  encounter?: number;
  patient: number;
  patientName: string;
  doctor: number;
  doctorName: string;
  symptoms?: string;
  diagnosis?: string;
  notes?: string;
  closeEpisode?: boolean;
  prescriptions?: Prescription[];
}
