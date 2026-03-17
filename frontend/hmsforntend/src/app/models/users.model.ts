export interface User {
  userId: number;
  hospitalId: number;
  hospital?: {id: number, name: string};
  hospitalName?: string;
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  dateOfBirth: Date;
  roles: number[];
  status: string; 
}