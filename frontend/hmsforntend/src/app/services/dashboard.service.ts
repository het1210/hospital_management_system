import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiResponse } from '../models/api-response.model';

export interface DashboardAnalytics {
  // appointment stats
  totalAppointments: number;
  bookedAppointments: number;
  checkedInAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;

  // trends
  weeklyAppointmentTrend: Record<string, number>;
  monthlyAppointmentTrend: Record<string, number>;
  hourlyDistribution: Record<string, number>;

  // consultation / episode
  totalConsultations: number;
  totalEpisodes: number;
  openEpisodes: number;
  closedEpisodes: number;

  // doctor specific
  myPatientsCount: number;
  myConsultationsToday: number;
  myUpcomingAppointments: number;

  // patient / hospital
  totalPatients: number;
  newPatientsThisMonth: number;

  // top diagnoses
  topDiagnoses: Record<string, number>;

  // recent activity
  recentActivities: RecentActivity[];
}

export interface RecentActivity {
  type: string;
  title: string;
  subtitle: string;
  time: string;
  status: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private base = 'http://localhost:8080/api/dashboard';

  constructor(private http: HttpClient) {}

  getDoctorAnalytics(): Observable<ApiResponse<DashboardAnalytics>> {
    return this.http.get<ApiResponse<DashboardAnalytics>>(`${this.base}/doctor`);
  }

  getHospitalAdminAnalytics(): Observable<ApiResponse<DashboardAnalytics>> {
    return this.http.get<ApiResponse<DashboardAnalytics>>(`${this.base}/hospital`);
  }

  getSuperAdminAnalytics(): Observable<ApiResponse<DashboardAnalytics>> {
    return this.http.get<ApiResponse<DashboardAnalytics>>(`${this.base}/superadmin`);
  }

  getFrontdeskAnalytics(): Observable<ApiResponse<DashboardAnalytics>> {
    return this.http.get<ApiResponse<DashboardAnalytics>>(`${this.base}/frontdesk`);
  }
}