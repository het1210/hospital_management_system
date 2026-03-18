import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/users.model';
import { PageableResponse } from '../models/pageable-response.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  getAll(page: number = 0, size: number = 10): Observable<PageableResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
    return this.http.get<PageableResponse<User>>(this.apiUrl, { params });
  }

  getAllExceptSuperAdmin(page: number = 0, size: number = 10): Observable<PageableResponse<User>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('hospital',localStorage.getItem('hospital_id') || '');
    return this.http.get<PageableResponse<User>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  create(user: User): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, user);
  }

  update(id: number, user: User): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  search(query: string, hospitalId: string): Observable<any> {
    const params = new HttpParams()
      .set('query', query)
      .set('hospitalId', hospitalId);
    return this.http.get<any>(`${this.apiUrl}/search`, { params });
  }

  count(hospitalId:number):Observable<any>{
    const params = new HttpParams()
      .set('id', hospitalId);
    return this.http.get<any>(`${this.apiUrl}/count`,{params});
  }
}
