export interface Appointment {
  id?: number;
  patientId: number;
  patientName?: string;
  doctorId: number;
  doctorName?: string;
  hospitalId: number;
  hospitalName?: string;
  episodeId?: number;
  episodeName?: string;
  encounterId?:number;
  status: string;
  type: string;
  appointmentStart: string;
  appointmentEnd: string;
  createdAt?: Date;
  updatedAt?: Date;
}
