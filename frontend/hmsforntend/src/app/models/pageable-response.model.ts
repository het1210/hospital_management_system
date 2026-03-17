import { Hospital } from './hospital.model';

export interface PageableResponse<T> {
  success: boolean;
  message: string;
  data: {
    content: T[];
    empty: boolean;
    first: boolean;
    last: boolean;
    number: number;
    numberOfElements: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}
