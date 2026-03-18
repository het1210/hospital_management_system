// src/app/services/lab.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  LabOrder, LabOrderRequest,
  SampleCollectionRequest, LabResultsRequest,
  GenerateReportRequest, BookLabAppointmentRequest,
} from '../models/lab.model';
import { ApiResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class LabService {

  private readonly base = 'http://localhost:8080/api/lab-orders';

  constructor(private http: HttpClient) {}

  // ── DOCTOR ────────────────────────────────────────────────────────────────

  /** Create lab order from consultation form */
  createLabOrder(payload: LabOrderRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(this.base, payload);
  }

  // ── FRONTDESK / ADMIN ─────────────────────────────────────────────────────

  /** Get all lab orders for the hospital (paginated, optional status filter) */
  getLabOrders(page = 0, size = 10, status?: string): Observable<ApiResponse<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (status) params = params.set('status', status);
    return this.http.get<ApiResponse<any>>(this.base, { params });
  }

  /** Get a single lab order by id */
  getLabOrderById(id: number): Observable<ApiResponse<LabOrder>> {
    return this.http.get<ApiResponse<LabOrder>>(`${this.base}/${id}`);
  }

  /** Frontdesk books a lab appointment (status must be ORDERED) */
  bookLabAppointment(id: number, payload: BookLabAppointmentRequest): Observable<ApiResponse<LabOrder>> {
    return this.http.post<ApiResponse<LabOrder>>(`${this.base}/${id}/book`, payload);
  }

  /** Cancel a lab order */
  cancelLabOrder(id: number): Observable<ApiResponse<LabOrder>> {
    return this.http.delete<ApiResponse<LabOrder>>(`${this.base}/${id}`);
  }

  // ── LAB TECHNICIAN ────────────────────────────────────────────────────────

  /** Collect sample (status must be BOOKED) */
  collectSample(id: number, payload: SampleCollectionRequest): Observable<ApiResponse<LabOrder>> {
    return this.http.post<ApiResponse<LabOrder>>(`${this.base}/${id}/collect-sample`, payload);
  }

  /** Start processing (status must be SAMPLE_COLLECTED) */
  startProcessing(id: number): Observable<ApiResponse<LabOrder>> {
    return this.http.post<ApiResponse<LabOrder>>(`${this.base}/${id}/start-processing`, {});
  }

  /** Enter test results (status must be IN_PROGRESS) */
  enterResults(id: number, payload: LabResultsRequest): Observable<ApiResponse<LabOrder>> {
    return this.http.post<ApiResponse<LabOrder>>(`${this.base}/${id}/results`, payload);
  }

  /** Generate and finalize report (all tests must be COMPLETED) */
  generateReport(id: number, payload: GenerateReportRequest): Observable<ApiResponse<LabOrder>> {
    return this.http.post<ApiResponse<LabOrder>>(`${this.base}/${id}/generate-report`, payload);
  }
}