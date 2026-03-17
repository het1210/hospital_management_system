import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consultation } from '../models/consultation.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultationService {
  private apiUrl = 'http://localhost:8080/api/consultations';

  constructor(private http: HttpClient) {}

  create(consultation: Consultation): Observable<any> {
    return this.http.post(this.apiUrl, consultation);
  }

  getById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getByEncounter(encounterId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/encounter/${encounterId}`);
  }

  getAll(page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(this.apiUrl, { params });
  }

  searchByPatient(patientId: number, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}/patient/${patientId}`, { params });
  }

  searchByDoctor(doctorId: number, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get(`${this.apiUrl}/doctor/${doctorId}`, { params });
  }

  // searchConsultation(query:string, type:number){
  //   return this.http.get(`${this.apiUrl}/search?query=${query}`);
  // }



  update(id: number, consultation: Consultation): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}`, consultation);
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
