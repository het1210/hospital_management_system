export interface Episode {
  id?: number;
  patientId: number;
  patientName?: string;
  hospitalId: number;
  episodeType: string;
  reason: string;
  startDate: string;
  endDate: string;
  status: 'ACTIVE' | 'CLOSE';
}
