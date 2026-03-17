import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Hospital } from '../models/hospital.model';
import { PageableResponse } from '../models/pageable-response.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class HospitalService {
  private apiUrl = 'http://localhost:8080/api/hospital';

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 10): Observable<PageableResponse<Hospital>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageableResponse<Hospital>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Hospital> {
    return this.http.get<Hospital>(`${this.apiUrl}/${id}`);
  }

  create(hospital: Hospital): Observable<Hospital> {
    return this.http.post<Hospital>(this.apiUrl, hospital);
  }

  update(id: number, hospital: Hospital): Observable<Hospital> {
    return this.http.put<Hospital>(`${this.apiUrl}/update/${id}`, hospital);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getHospitalCount(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/count`);
  }

  getHospitalNames():Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/names`);
  }

  getHospitalNamesExceptSuperAdmin():Observable<ApiResponse> {
    const params = new HttpParams()
    .set('id',localStorage.getItem('hospital_id') || '');
    return this.http.get<ApiResponse>(`${this.apiUrl}/names`, { params });
  }
}
