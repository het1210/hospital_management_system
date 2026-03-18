import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Patient } from '../models/patient.model';
import { PageableResponse } from '../models/pageable-response.model';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private apiUrl = 'http://localhost:8080/api/patients';

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 10): Observable<PageableResponse<Patient>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('hospital', localStorage.getItem('user_role') === 'superadmin' ? '' : localStorage.getItem('hospital_id') || '');
    return this.http.get<PageableResponse<Patient>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<Patient> {
    return this.http.get<Patient>(`${this.apiUrl}/${id}`);
  }

  create(patient: Patient): Observable<Patient> {
    return this.http.post<Patient>(this.apiUrl, patient);
  }

  update(id: number, patient: Patient): Observable<Patient> {
    return this.http.put<Patient>(`${this.apiUrl}/${id}`, patient);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  search(query: string, page: number = 0, size: number = 10): Observable<PageableResponse<Patient>> {
    const params = new HttpParams()
      .set('query', query)
      .set('page', page.toString())
      .set('size', size.toString())
      .set('hospital', localStorage.getItem('user_role') === 'superadmin' ? '' : localStorage.getItem('hospital_id') || '');
    return this.http.get<PageableResponse<Patient>>(`${this.apiUrl}/search`, { params });
  }

  count(hospitalId: number): Observable<any> {
    const params = new HttpParams().set('id', hospitalId.toString());
    return this.http.get(`${this.apiUrl}/count`, { params });
  }
}
