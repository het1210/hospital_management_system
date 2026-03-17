export interface Patient {
  id?: number;
  hospitalId: number[];
  // hospital?: {id: number, name: string};
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  gender: string;
  dateOfBirth: Date;
  address: string;
  city: string;
  state: string;
  pincode: string;
  createdBy : Number;
  updatedBy?: Number;
  patientIdentifier?: string;
  adhaarNumber?: string;
  // bloodGroup: string;
  // status: string;
}
