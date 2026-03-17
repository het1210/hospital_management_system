export interface Hospital {
  id?: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  registrationNumber: string;
  status: string;
  createdAt?: Date;
  updatedAt?: Date;
}
