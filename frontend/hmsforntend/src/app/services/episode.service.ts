import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Episode } from '../models/episode.model';
import { PageableResponse } from '../models/pageable-response.model';
import { ApiResponse } from '../models/api-response.model';

interface EpisodeResponse {
  success: boolean;
  message: string;
  data: Episode;
}

@Injectable({
  providedIn: 'root'
})
export class EpisodeService {
  private apiUrl = 'http://localhost:8080/api/episodes';

  constructor(private http: HttpClient) { }

  getAll(page: number = 0, size: number = 10): Observable<PageableResponse<Episode>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageableResponse<Episode>>(this.apiUrl, { params });
  }

  getById(id: number): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(`${this.apiUrl}/${id}`);
  }

  search(searchTerm: string, page: number = 0, size: number = 10): Observable<PageableResponse<Episode>> {
    const params = new HttpParams()
      .set('query', searchTerm)
      .set('hospitalId', localStorage.getItem('hospital_id') || '')
      .set('page', page.toString())
      .set('size', size.toString());
    return this.http.get<PageableResponse<Episode>>(`${this.apiUrl}/search`, { params });
  }

  create(episode: Episode): Observable<EpisodeResponse> {
    return this.http.post<EpisodeResponse>(this.apiUrl, episode);
  }

  update(id: number, episode: Episode): Observable<EpisodeResponse> {
    return this.http.put<EpisodeResponse>(`${this.apiUrl}/${id}`, episode);
  }

  delete(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
