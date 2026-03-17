import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Appointment } from '../models/appointment.model';
import { PageableResponse } from '../models/pageable-response.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class AppointmentService {
  private apiUrl = 'http://localhost:8080/api/appointments';

  constructor(private http: HttpClient) { }

  getAll(page: number = 0, size: number = 10, hospitalId?: number,  from?: string,  to?: string): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('to', to ? to : new Date().toISOString().split('T')[0])
      .set('from', from ? from : new Date().toISOString().split('T')[0]);

    if (hospitalId) {
      params = params.set('hospitalId', hospitalId.toString());
    }
    return this.http.get<any>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse<Appointment>> {
    return this.http.get<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`);
  }

  getDoctorAppointments(doctorId: number, from?: string, to?: string): Observable<ApiResponse<Appointment[]>> {
    let params = new HttpParams()
      .set('to', to ? to : new Date().toISOString().split('T')[0])
      .set('from', from ? from : new Date().toISOString().split('T')[0]);
    return this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}/doctor/${doctorId}`, { params });
  }

  getDoctorAllAppointments(doctorId: number): Observable<ApiResponse<Appointment[]>> {

    return this.http.get<ApiResponse<Appointment[]>>(`${this.apiUrl}/doctor/${doctorId}/all`);
  }

  create(appointment: Appointment): Observable<ApiResponse<Appointment>> {
    return this.http.post<ApiResponse<Appointment>>(this.apiUrl, appointment);
  }

  update(id: number, appointment: Appointment): Observable<ApiResponse<Appointment>> {
    return this.http.put<ApiResponse<Appointment>>(`${this.apiUrl}/${id}`, appointment);
  }

  delete(id: number): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }

  count(role:string, from: string, to:string):Observable<ApiResponse<any>>{
    const params = new HttpParams()
      .set('from', from)
      .set('to', to);
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/role/${role}/today`, {params});
  }
}
