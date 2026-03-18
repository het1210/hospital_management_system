/*

import { Component, OnInit, ChangeDetectorRef, Output, EventEmitter } from '@angular/core';
import { AuthService } from '../../services/auth';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-charts',
  imports: [CommonModule, FormsModule],
  templateUrl: './charts.html',
  styleUrl: './charts.scss',
})
export class Charts implements OnInit {

  userRole: string = '';

  @Output() appointmentStateEmit = new EventEmitter<{ totalAppointment: number, bookedAppointment: number, checkedInAppointment: number, completedAppointment: number, cancelledAppointment: number }>();
  @Output() appointmentStateForTodayEmit = new EventEmitter<{ totalAppointment: number, bookedAppointment: number, checkedInAppointment: number, completedAppointment: number, cancelledAppointment: number }>();
  @Output() userCountEmit = new EventEmitter<{ 'totalUser': number, 'totalDoctor': number, totalNurse: number }>();

  //Appointment chart
  dateFrom: string = new Date().toISOString().split('T')[0];
  dateTo: string = new Date().toISOString().split('T')[0];
  appointmentMetrics: { label: string; value: number; color: string }[] = [];
  appointmentState: { totalAppointment: number, bookedAppointment: number, checkedInAppointment: number, completedAppointment: number, cancelledAppointment: number }
    = {
      totalAppointment: 0,
      bookedAppointment: 0,
      checkedInAppointment: 0,
      completedAppointment: 0,
      cancelledAppointment: 0
    }
  appointmentStatForToday: { totalAppointment: number, bookedAppointment: number, checkedInAppointment: number, completedAppointment: number, cancelledAppointment: number }
    = {
      totalAppointment: 0,
      bookedAppointment: 0,
      checkedInAppointment: 0,
      completedAppointment: 0,
      cancelledAppointment: 0
    }

  //HOSPITAL STAFF
  userCount: { 'totalUser': number, 'totalDoctor': number, totalNurse: number } = { 'totalUser': 0, 'totalDoctor': 0, 'totalNurse': 0 }
  hospitaId: string | null = localStorage.getItem('hospital_id') || '0'

  //constructor
  constructor(private authService: AuthService,
    private appointmentService: AppointmentService,
    private userSerivce: UserService,
    private cdRef: ChangeDetectorRef
  ) { }



  ngOnInit(): void {
    this.userRole = this.authService.getRole() || '';
    if (this.userRole === 'hospitaladmin') {
      this.loadUserCount(this.hospitaId)
    }
    if (this.userRole === 'superadmin') {
      this.loadUserCount(null);
    }
    if (this.userRole === 'doctor') {
      this.loadCountOfAppointmentsForToday(this.userRole, this.dateFrom, this.dateTo);
      this.loadCountOfAppointments(this.userRole, this.dateFrom, this.dateTo);
    }

  }

  loadCountOfAppointments(role: string, from: string, to: string) {
    this.appointmentService.count(role, from, to).subscribe({
      next: (response) => {
        this.appointmentState = response.data;
        this.cdRef.detectChanges();
        this.appointmentStateEmit.emit(this.appointmentState);
        this.buildAppointmentMetrics();

      },
      error: (error) => {
        console.error('Error loading appointment count:', error);
      }
    });
  }
  loadCountOfAppointmentsForToday(role: string, from: string, to: string) {
    this.appointmentService.count(role, from, to).subscribe({
      next: (response) => {
        this.appointmentStatForToday = response.data;
        this.cdRef.detectChanges();
        this.appointmentStateForTodayEmit.emit(this.appointmentStatForToday);
        this.buildAppointmentMetrics();
      },
      error: (error) => {
        console.error('Error loading appointment count:', error);
      }
    });
  }


  loadUserCount(hospitalId: string | null) {
    this.userSerivce.count(Number(hospitalId)).subscribe({
      next: (response) => {
        this.userCount = response.data;
        this.cdRef.detectChanges();
        setTimeout(() => this.drawStaffChart(), 100);
        this.userCountEmit.emit(this.userCount);
      },
      error: (error) => {
        console.error('Error loading patient count:', error);

      }
    });
  }

  //charts for Staff
  drawStaffChart() {
    if (typeof (window as any).Chart === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
      script.onload = () => this.renderStaffPie();
      document.head.appendChild(script);
    } else {
      this.renderStaffPie();
    }
  }
  //chart for staff
  renderStaffPie() {
    const Chart = (window as any).Chart;
    const ctx = (document.getElementById('staffPie') as HTMLCanvasElement)?.getContext('2d');
    if (!ctx) return;

    Chart.getChart('staffPie')?.destroy();

    const otherStaff = this.userCount.totalUser - this.userCount.totalDoctor - this.userCount.totalNurse;

    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Doctors', 'Nurses', 'Other Staff'],
        datasets: [{
          data: [this.userCount.totalDoctor, this.userCount.totalNurse, otherStaff < 0 ? 0 : otherStaff],
          backgroundColor: ['#4299e1', '#10b981', '#f59e0b'],
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx: any) => {
                const total = this.userCount.totalUser || 1;
                const pct = Math.round((ctx.parsed / total) * 100);
                return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }


  //charts for appointment 
  buildAppointmentMetrics() {
    this.appointmentMetrics = [
      { label: 'Total', value: this.appointmentState.totalAppointment, color: '#3bf6be' },
      { label: 'Booked', value: this.appointmentState.bookedAppointment, color: '#3b82f6' },
      { label: 'Checked In', value: this.appointmentState.checkedInAppointment, color: '#10b981' },
      { label: 'Completed', value: this.appointmentState.completedAppointment, color: '#6366f1' },
      { label: 'Cancelled', value: this.appointmentState.cancelledAppointment, color: '#ef4444' }
    ];
    this.cdRef.detectChanges();
    setTimeout(() => this.renderCharts(), 100);
  }

  //charts for appointment
  renderCharts() {
    if (typeof (window as any).Chart === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';
      script.onload = () => this.drawCharts();
      document.head.appendChild(script);
    } else {
      this.drawCharts();
    }
  }

  //chart for appointment
  drawCharts() {
    const Chart = (window as any).Chart;
    const labels = this.appointmentMetrics.map(m => m.label);
    const values = this.appointmentMetrics.map(m => m.value);
    const colors = this.appointmentMetrics.map(m => m.color);

    // Destroy existing if re-rendering
    const dCtx = (document.getElementById('appointmentDoughnut') as HTMLCanvasElement)?.getContext('2d');
    const bCtx = (document.getElementById('appointmentBar') as HTMLCanvasElement)?.getContext('2d');
    if (!dCtx || !bCtx) return;

    Chart.getChart('appointmentDoughnut')?.destroy();
    Chart.getChart('appointmentBar')?.destroy();

    new Chart(dCtx, {
      type: 'doughnut',
      data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 3, borderColor: '#ffffff', hoverOffset: 6 }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        cutout: '70%',
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: ${ctx.parsed}` } } }
      }
    });

    new Chart(bCtx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'Appointments', data: values, backgroundColor: colors, borderRadius: 8, borderSkipped: false }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#718096', font: { size: 12 } } },
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', stepSize: 1, precision: 0 }, beginAtZero: true }
        }
      }
    });
  }

  onDateFilter() {
    if (this.dateFrom && this.dateTo) {
      this.loadCountOfAppointments(this.userRole, this.dateFrom, this.dateTo);
    }
  }
  clearDateFilter() {
    this.loadCountOfAppointments(this.userRole, this.dateFrom, this.dateTo);
  }
}
  */
import {
  Component, OnInit, OnChanges, SimpleChanges,
  ChangeDetectorRef, Output, Input, EventEmitter
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth';
import { AppointmentService } from '../../services/appointment.service';
import { UserService } from '../../services/user.service';
import { DashboardAnalytics } from '../../services/dashboard.service';

// ──────────────────────────────────────────────────────────────────────────────
// Chart.js CDN URL
// ──────────────────────────────────────────────────────────────────────────────
const CHARTJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js';

@Component({
  selector: 'app-charts',
  imports: [CommonModule, FormsModule],
  templateUrl: './charts.html',
  styleUrl: './charts.scss',
})
export class Charts implements OnInit, OnChanges {

  // ── Outputs (legacy – keep for dashboard.ts backwards compat) ──────────────
  @Output() appointmentStateEmit = new EventEmitter<{
    totalAppointment: number; bookedAppointment: number;
    checkedInAppointment: number; completedAppointment: number; cancelledAppointment: number;
  }>();
  @Output() appointmentStateForTodayEmit = new EventEmitter<{
    totalAppointment: number; bookedAppointment: number;
    checkedInAppointment: number; completedAppointment: number; cancelledAppointment: number;
  }>();
  @Output() userCountEmit = new EventEmitter<{ totalUser: number; totalDoctor: number; totalNurse: number }>();

  // ── NEW: live analytics from parent dashboard ─────────────────────────────
  @Input() analyticsData: DashboardAnalytics | null = null;

  // ── Internal state ─────────────────────────────────────────────────────────
  userRole = '';
  hospitalId: string | null = localStorage.getItem('hospital_id') || '0';

  // Appointment chart (date-filtered, doctor/frontdesk)
  dateFrom: string = new Date().toISOString().split('T')[0];
  dateTo:   string = new Date().toISOString().split('T')[0];
  appointmentMetrics: { label: string; value: number; color: string }[] = [];

  appointmentState = {
    totalAppointment: 0, bookedAppointment: 0,
    checkedInAppointment: 0, completedAppointment: 0, cancelledAppointment: 0,
  };
  appointmentStatForToday = {
    totalAppointment: 0, bookedAppointment: 0,
    checkedInAppointment: 0, completedAppointment: 0, cancelledAppointment: 0,
  };

  // Staff
  userCount: { totalUser: number; totalDoctor: number; totalNurse: number } =
    { totalUser: 0, totalDoctor: 0, totalNurse: 0 };

  // ──────────────────────────────────────────────────────────────────────────
  constructor(
    private authService: AuthService,
    private appointmentService: AppointmentService,
    private userService: UserService,
    private cdRef: ChangeDetectorRef,
  ) {}

  // ──────────────────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.userRole = this.authService.getRole() || '';

    switch (this.userRole) {
      case 'hospitaladmin':
        this.loadUserCount(this.hospitalId);
        this.loadCountOfAppointments(this.userRole, this.dateFrom, this.dateTo);
        this.loadCountOfAppointmentsForToday(this.userRole, this.dateFrom, this.dateTo);
        break;
      case 'superadmin':
        this.loadUserCount(null);
        break;
      case 'doctor':
      case 'frontdesk':
        this.loadCountOfAppointmentsForToday(this.userRole, this.dateFrom, this.dateTo);
        this.loadCountOfAppointments(this.userRole, this.dateFrom, this.dateTo);
        break;
      case 'nurse':
      case 'labtechnician':
      case 'pharmacist':
      case 'patient':
        this.withChart(() => this.renderRoleSpecificCharts());
        break;
    }
  }

  // Re-render live-data charts whenever analyticsData arrives from parent
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['analyticsData'] && this.analyticsData) {
      setTimeout(() => this.withChart(() => this.renderLiveAnalyticsCharts()), 120);
    }
  }

  // ── Chart.js loader ────────────────────────────────────────────────────────
  private withChart(cb: () => void): void {
    if (typeof (window as any).Chart !== 'undefined') { cb(); return; }
    const s = document.createElement('script');
    s.src = CHARTJS_CDN;
    s.onload = () => cb();
    document.head.appendChild(s);
  }

  private destroy(id: string) { (window as any).Chart?.getChart(id)?.destroy(); }
  private ctx(id: string): CanvasRenderingContext2D | null {
    return (document.getElementById(id) as HTMLCanvasElement)?.getContext('2d') ?? null;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // LIVE ANALYTICS CHARTS  (rendered from @Input analyticsData)
  // ══════════════════════════════════════════════════════════════════════════
  renderLiveAnalyticsCharts(): void {
    if (!this.analyticsData) return;
    const a = this.analyticsData;

    // 1. Weekly Trend Line
    if (a.weeklyAppointmentTrend) this.renderWeeklyTrendLine(a.weeklyAppointmentTrend);

    // 2. Monthly Trend Bar
    if (a.monthlyAppointmentTrend) this.renderMonthlyTrendBar(a.monthlyAppointmentTrend);

    // 3. Hourly Distribution Bar
    if (a.hourlyDistribution) this.renderHourlyDistBar(a.hourlyDistribution);

    // 4. Top Diagnoses horizontal bar
    if (a.topDiagnoses) this.renderTopDiagnosesBar(a.topDiagnoses);

    // 5. Episode Status Doughnut
    if (a.totalEpisodes !== undefined && a.openEpisodes !== undefined)
      this.renderEpisodeStatusDoughnut(a.openEpisodes, a.closedEpisodes ?? 0);
  }

  private renderWeeklyTrendLine(data: Record<string, number>) {
    const ctx = this.ctx('weeklyTrendLine'); if (!ctx) return;
    this.destroy('weeklyTrendLine');
    const C = (window as any).Chart;
    new C(ctx, {
      type: 'line',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Appointments',
          data: Object.values(data),
          borderColor: '#667eea',
          backgroundColor: 'rgba(102,126,234,0.10)',
          fill: true, tension: 0.4,
          pointBackgroundColor: '#667eea',
          pointRadius: 5, pointHoverRadius: 8,
          borderWidth: 3,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c: any) => ` ${c.parsed.y} appointments` } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#718096', font: { size: 12 } } },
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', precision: 0 }, beginAtZero: true },
        },
      },
    });
  }

  private renderMonthlyTrendBar(data: Record<string, number>) {
    const ctx = this.ctx('monthlyTrendBar'); if (!ctx) return;
    this.destroy('monthlyTrendBar');
    const C = (window as any).Chart;
    const colors = Object.keys(data).map((_, i) =>
      `hsl(${220 + i * 18}, 70%, ${55 + i * 3}%)`);
    new C(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Appointments',
          data: Object.values(data),
          backgroundColor: colors,
          borderRadius: 8, borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#718096', font: { size: 11 } } },
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', precision: 0 }, beginAtZero: true },
        },
      },
    });
  }

  private renderHourlyDistBar(data: Record<string, number>) {
    const ctx = this.ctx('hourlyDistBar'); if (!ctx) return;
    this.destroy('hourlyDistBar');
    const C = (window as any).Chart;
    const values = Object.values(data) as number[];
    const max = Math.max(...values, 1);
    const colors = values.map(v =>
      v === max ? '#667eea' : v >= max * 0.7 ? '#9f7aea' : 'rgba(102,126,234,0.35)');
    new C(ctx, {
      type: 'bar',
      data: {
        labels: Object.keys(data),
        datasets: [{
          label: 'Appointments',
          data: values,
          backgroundColor: colors,
          borderRadius: 6, borderSkipped: false,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#718096', font: { size: 11 }, maxRotation: 45 } },
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', precision: 0 }, beginAtZero: true },
        },
      },
    });
  }

  private renderTopDiagnosesBar(data: Record<string, number>) {
    const ctx = this.ctx('topDiagnosesBar'); if (!ctx) return;
    this.destroy('topDiagnosesBar');
    const C = (window as any).Chart;
    const entries = Object.entries(data).slice(0, 6);
    new C(ctx, {
      type: 'bar',
      data: {
        labels: entries.map(([k]) => k.length > 20 ? k.substring(0, 18) + '…' : k),
        datasets: [{
          label: 'Cases',
          data: entries.map(([, v]) => v),
          backgroundColor: ['#667eea','#4299e1','#10b981','#f59e0b','#9f7aea','#ef4444'],
          borderRadius: 8, borderSkipped: false,
        }],
      },
      options: {
        indexAxis: 'y',
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', precision: 0 }, beginAtZero: true },
          y: { grid: { display: false }, ticks: { color: '#4a5568', font: { size: 11 } } },
        },
      },
    });
  }

  private renderEpisodeStatusDoughnut(open: number, closed: number) {
    const ctx = this.ctx('episodeStatusDoughnut'); if (!ctx) return;
    this.destroy('episodeStatusDoughnut');
    const C = (window as any).Chart;
    new C(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Open', 'Closed'],
        datasets: [{
          data: [open, closed],
          backgroundColor: ['#f59e0b', '#48bb78'],
          borderWidth: 3, borderColor: '#ffffff', hoverOffset: 8,
        }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '68%',
        plugins: {
          legend: { position: 'bottom', labels: { color: '#4a5568', font: { size: 12 }, padding: 14, boxWidth: 12 } },
          tooltip: { callbacks: { label: (c: any) => ` ${c.label}: ${c.parsed}` } },
        },
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DATE-FILTERED APPOINTMENT CHARTS  (doctor / frontdesk)
  // ══════════════════════════════════════════════════════════════════════════
  loadCountOfAppointments(role: string, from: string, to: string) {
    this.appointmentService.count(role, from, to).subscribe({
      next: (r: any) => {
        this.appointmentState = r.data;
        this.appointmentStateEmit.emit(this.appointmentState);
        this.buildAppointmentMetrics();
        this.cdRef.detectChanges();
      },
    });
  }

  loadCountOfAppointmentsForToday(role: string, from: string, to: string) {
    this.appointmentService.count(role, from, to).subscribe({
      next: (r: any) => {
        this.appointmentStatForToday = r.data;
        this.appointmentStateForTodayEmit.emit(this.appointmentStatForToday);
        this.buildAppointmentMetrics();
        this.cdRef.detectChanges();
      },
    });
  }

  buildAppointmentMetrics() {
    this.appointmentMetrics = [
      { label: 'Total',      value: this.appointmentState.totalAppointment,     color: '#3bf6be' },
      { label: 'Booked',     value: this.appointmentState.bookedAppointment,     color: '#3b82f6' },
      { label: 'Checked In', value: this.appointmentState.checkedInAppointment,  color: '#10b981' },
      { label: 'Completed',  value: this.appointmentState.completedAppointment,  color: '#6366f1' },
      { label: 'Cancelled',  value: this.appointmentState.cancelledAppointment,  color: '#ef4444' },
    ];
    this.cdRef.detectChanges();
    setTimeout(() => this.withChart(() => this.drawAppointmentCharts()), 120);
  }

  drawAppointmentCharts() {
    const C = (window as any).Chart;
    const labels = this.appointmentMetrics.map(m => m.label);
    const values = this.appointmentMetrics.map(m => m.value);
    const colors = this.appointmentMetrics.map(m => m.color);

    // Doughnut
    this.destroy('appointmentDoughnut');
    const dCtx = this.ctx('appointmentDoughnut');
    if (dCtx) {
      new C(dCtx, {
        type: 'doughnut',
        data: { labels, datasets: [{ data: values, backgroundColor: colors, borderWidth: 3, borderColor: '#ffffff', hoverOffset: 6 }] },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '70%',
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c: any) => ` ${c.label}: ${c.parsed}` } } },
        },
      });
    }

    // Bar
    this.destroy('appointmentBar');
    const bCtx = this.ctx('appointmentBar');
    if (bCtx) {
      new C(bCtx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'Appointments', data: values, backgroundColor: colors, borderRadius: 8, borderSkipped: false }] },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#718096', font: { size: 12 } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', stepSize: 1, precision: 0 }, beginAtZero: true },
          },
        },
      });
    }
  }

  onDateFilter() {
    if (this.dateFrom && this.dateTo)
      this.loadCountOfAppointments(this.userRole, this.dateFrom, this.dateTo);
  }

  clearDateFilter() {
    this.dateFrom = new Date().toISOString().split('T')[0];
    this.dateTo   = new Date().toISOString().split('T')[0];
    this.loadCountOfAppointments(this.userRole, this.dateFrom, this.dateTo);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // STAFF CHARTS  (hospitaladmin / superadmin)
  // ══════════════════════════════════════════════════════════════════════════
  loadUserCount(hospitalId: string | null) {
    this.userService.count(Number(hospitalId)).subscribe({
      next: (r: any) => {
        this.userCount = r.data;
        this.userCountEmit.emit(this.userCount);
        this.cdRef.detectChanges();
        setTimeout(() => this.withChart(() => {
          this.renderStaffPie();
          if (this.userRole === 'hospitaladmin') this.renderHospitalAdminAppointmentBar();
          if (this.userRole === 'superadmin')    this.renderSuperAdminCharts();
        }), 120);
      },
    });
  }

  renderStaffPie() {
    const ctx = this.ctx('staffPie'); if (!ctx) return;
    this.destroy('staffPie');
    const other = Math.max(0, this.userCount.totalUser - this.userCount.totalDoctor - this.userCount.totalNurse);
    new (window as any).Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['Doctors', 'Nurses', 'Other Staff'],
        datasets: [{ data: [this.userCount.totalDoctor, this.userCount.totalNurse, other], backgroundColor: ['#4299e1', '#10b981', '#f59e0b'], borderWidth: 3, borderColor: '#ffffff', hoverOffset: 8 }],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c: any) => {
            const pct = Math.round((c.parsed / (this.userCount.totalUser || 1)) * 100);
            return ` ${c.label}: ${c.parsed} (${pct}%)`;
          }}},
        },
      },
    });
  }

  renderHospitalAdminAppointmentBar() {
    const ctx = this.ctx('hospitalAdminAppointmentBar'); if (!ctx) return;
    this.destroy('hospitalAdminAppointmentBar');
    const C = (window as any).Chart;
    const labels = ['Total', 'Booked', 'Checked In', 'Completed', 'Cancelled'];
    const values = [
      this.appointmentState.totalAppointment, this.appointmentState.bookedAppointment,
      this.appointmentState.checkedInAppointment, this.appointmentState.completedAppointment,
      this.appointmentState.cancelledAppointment,
    ];
    new C(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ data: values, backgroundColor: ['#3bf6be','#3b82f6','#10b981','#6366f1','#ef4444'], borderRadius: 10, borderSkipped: false }] },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#718096', font: { size: 12 } } },
          y: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', precision: 0 }, beginAtZero: true },
        },
      },
    });
  }

  renderSuperAdminCharts() {
    const C = (window as any).Chart;

    // User doughnut
    const ctxPie = this.ctx('superAdminUserPie');
    if (ctxPie) {
      this.destroy('superAdminUserPie');
      const other = Math.max(0, this.userCount.totalUser - this.userCount.totalDoctor - this.userCount.totalNurse);
      new C(ctxPie, {
        type: 'doughnut',
        data: {
          labels: ['Doctors', 'Nurses', 'Other'],
          datasets: [{ data: [this.userCount.totalDoctor, this.userCount.totalNurse, other], backgroundColor: ['#4299e1','#10b981','#f59e0b'], borderWidth: 3, borderColor: '#fff', hoverOffset: 8 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { color: '#4a5568', font: { size: 11 }, padding: 12, boxWidth: 12 } },
            title: { display: true, text: 'User Distribution', color: '#1a202c', font: { size: 14, weight: 'bold' }, padding: { bottom: 10 } },
          },
        },
      });
    }

    // Hospital growth bar (static — real data via analytics endpoint)
    const ctxBar = this.ctx('superAdminHospitalBar');
    if (ctxBar) {
      this.destroy('superAdminHospitalBar');
      new C(ctxBar, {
        type: 'bar',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun'],
          datasets: [
            { label: 'Registered', data: [5,8,10,13,15,18], backgroundColor: '#667eea', borderRadius: 6, borderSkipped: false },
            { label: 'Active',     data: [4,7,9,11,13,16],  backgroundColor: '#48bb78', borderRadius: 6, borderSkipped: false },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#4a5568', font: { size: 11 }, padding: 12, boxWidth: 12 } },
            title: { display: true, text: 'Hospital Growth (6 mo)', color: '#1a202c', font: { size: 14, weight: 'bold' }, padding: { bottom: 10 } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#718096' } },
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', precision: 0 }, beginAtZero: true },
          },
        },
      });
    }

    // Appointment line (from analyticsData if available, else static)
    const ctxLine = this.ctx('superAdminAppointmentLine');
    if (ctxLine) {
      this.destroy('superAdminAppointmentLine');
      const weekly = this.analyticsData?.weeklyAppointmentTrend;
      const labels = weekly ? Object.keys(weekly) : ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
      const values = weekly ? Object.values(weekly) : [42,58,50,75,64,30,22];
      new C(ctxLine, {
        type: 'line',
        data: {
          labels,
          datasets: [{ label: 'Appointments', data: values, borderColor: '#9f7aea', backgroundColor: 'rgba(159,118,234,0.10)', fill: true, tension: 0.4, pointBackgroundColor: '#9f7aea', pointRadius: 5, pointHoverRadius: 7, borderWidth: 3 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            title: { display: true, text: 'Weekly Appointment Trend', color: '#1a202c', font: { size: 14, weight: 'bold' }, padding: { bottom: 10 } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#718096' } },
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', precision: 0 }, beginAtZero: true },
          },
        },
      });
    }
  }

  // ══════════════════════════════════════════════════════════════════════════
  // ROLE-SPECIFIC STATIC CHARTS  (nurse / lab / pharmacist / patient)
  // ══════════════════════════════════════════════════════════════════════════
  renderRoleSpecificCharts() {
    switch (this.userRole) {
      case 'nurse':         this.renderNurseCharts();      break;
      case 'labtechnician': this.renderLabCharts();         break;
      case 'pharmacist':    this.renderPharmacistCharts();  break;
      case 'patient':       this.renderPatientCharts();     break;
    }
  }

  // ── Nurse ─────────────────────────────────────────────────────────────────
  renderNurseCharts() {
    const C = (window as any).Chart;

    const ctxBar = this.ctx('nurseTasksBar');
    if (ctxBar) {
      this.destroy('nurseTasksBar');
      new C(ctxBar, {
        type: 'bar',
        data: {
          labels: ['Vitals Pending','Meds Due','Dressings','IV Checks','Discharge Ready'],
          datasets: [{ data: [8,12,5,7,3], backgroundColor: ['#f56565','#ed8936','#667eea','#4299e1','#48bb78'], borderRadius: 8, borderSkipped: false }],
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, title: { display: true, text: 'Pending Tasks', color: '#1a202c', font: { size: 14, weight: 'bold' } } },
          scales: {
            x: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', precision: 0 }, beginAtZero: true },
            y: { grid: { display: false }, ticks: { color: '#4a5568', font: { size: 12 } } },
          },
        },
      });
    }

    const ctxD = this.ctx('nursePatientStatusDoughnut');
    if (ctxD) {
      this.destroy('nursePatientStatusDoughnut');
      new C(ctxD, {
        type: 'doughnut',
        data: {
          labels: ['Stable','Monitoring','Critical','Post-Op'],
          datasets: [{ data: [14,6,2,4], backgroundColor: ['#48bb78','#4299e1','#f56565','#9f7aea'], borderWidth: 3, borderColor: '#fff', hoverOffset: 6 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { color: '#4a5568', font: { size: 11 }, padding: 12, boxWidth: 12 } },
            title: { display: true, text: 'Patient Status', color: '#1a202c', font: { size: 14, weight: 'bold' } },
          },
        },
      });
    }

    // Vitals trend line
    const ctxLine = this.ctx('nurseVitalsTrend');
    if (ctxLine) {
      this.destroy('nurseVitalsTrend');
      new C(ctxLine, {
        type: 'line',
        data: {
          labels: ['06:00','08:00','10:00','12:00','14:00','16:00','18:00','20:00'],
          datasets: [
            { label: 'Avg BP (systolic)', data: [118,122,119,125,121,118,120,117], borderColor: '#f56565', backgroundColor: 'rgba(245,101,101,0.08)', fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2 },
            { label: 'Avg SpO2 (%)',       data: [98,97,99,98,97,98,99,98],      borderColor: '#48bb78', backgroundColor: 'rgba(72,187,120,0.08)',  fill: true, tension: 0.4, pointRadius: 4, borderWidth: 2 },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#4a5568', font: { size: 11 }, padding: 12, boxWidth: 12 } },
            title: { display: true, text: 'Ward Vital Signs Today', color: '#1a202c', font: { size: 14, weight: 'bold' } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#718096', font: { size: 11 } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096' }, beginAtZero: false },
          },
        },
      });
    }
  }

  // ── Lab Technician ────────────────────────────────────────────────────────
  renderLabCharts() {
    const C = (window as any).Chart;

    const ctxBar = this.ctx('labTestStatusBar');
    if (ctxBar) {
      this.destroy('labTestStatusBar');
      new C(ctxBar, {
        type: 'bar',
        data: {
          labels: ['Pending','In Progress','Completed','Urgent','Reports Due'],
          datasets: [{ data: [23,10,45,5,8], backgroundColor: ['#667eea','#ed8936','#48bb78','#f56565','#9f7aea'], borderRadius: 8, borderSkipped: false }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, title: { display: true, text: 'Test Status Overview', color: '#1a202c', font: { size: 14, weight: 'bold' } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#718096', font: { size: 12 } } },
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', precision: 0 }, beginAtZero: true },
          },
        },
      });
    }

    const ctxPie = this.ctx('labTestCategoryPie');
    if (ctxPie) {
      this.destroy('labTestCategoryPie');
      new C(ctxPie, {
        type: 'pie',
        data: {
          labels: ['Blood Work','Urine Analysis','Imaging','Microbiology','Other'],
          datasets: [{ data: [30,15,20,10,7], backgroundColor: ['#4299e1','#10b981','#f59e0b','#9f7aea','#667eea'], borderWidth: 3, borderColor: '#fff', hoverOffset: 8 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#4a5568', font: { size: 11 }, padding: 10, boxWidth: 12 } },
            title: { display: true, text: 'Tests by Category', color: '#1a202c', font: { size: 14, weight: 'bold' } },
          },
        },
      });
    }

    // Turnaround time line
    const ctxLine = this.ctx('labTurnaroundLine');
    if (ctxLine) {
      this.destroy('labTurnaroundLine');
      new C(ctxLine, {
        type: 'line',
        data: {
          labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
          datasets: [{ label: 'Avg TAT (hrs)', data: [2.1,1.8,2.4,1.9,2.2,1.5,1.7], borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.10)', fill: true, tension: 0.4, pointRadius: 5, borderWidth: 3 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, title: { display: true, text: 'Avg Turnaround Time (hrs)', color: '#1a202c', font: { size: 14, weight: 'bold' } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#718096' } },
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096' }, beginAtZero: true },
          },
        },
      });
    }
  }

  // ── Pharmacist ────────────────────────────────────────────────────────────
  renderPharmacistCharts() {
    const C = (window as any).Chart;

    const ctxBar = this.ctx('pharmacistPrescriptionBar');
    if (ctxBar) {
      this.destroy('pharmacistPrescriptionBar');
      new C(ctxBar, {
        type: 'bar',
        data: {
          labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
          datasets: [
            { label: 'Received',  data: [56,62,58,70,65,38,22], backgroundColor: '#667eea', borderRadius: 6, borderSkipped: false },
            { label: 'Dispensed', data: [48,55,52,63,58,32,18], backgroundColor: '#48bb78', borderRadius: 6, borderSkipped: false },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: { position: 'bottom', labels: { color: '#4a5568', font: { size: 11 }, padding: 12, boxWidth: 12 } },
            title: { display: true, text: 'Weekly Prescriptions', color: '#1a202c', font: { size: 14, weight: 'bold' } },
          },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#718096' } },
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', precision: 0 }, beginAtZero: true },
          },
        },
      });
    }

    const ctxD = this.ctx('pharmacistStockDoughnut');
    if (ctxD) {
      this.destroy('pharmacistStockDoughnut');
      new C(ctxD, {
        type: 'doughnut',
        data: {
          labels: ['Adequate','Low Stock','Out of Stock'],
          datasets: [{ data: [78,12,4], backgroundColor: ['#48bb78','#ed8936','#f56565'], borderWidth: 3, borderColor: '#fff', hoverOffset: 6 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { color: '#4a5568', font: { size: 11 }, padding: 12, boxWidth: 12 } },
            title: { display: true, text: 'Inventory Status', color: '#1a202c', font: { size: 14, weight: 'bold' } },
          },
        },
      });
    }

    // Top dispensed medicines bar
    const ctxTop = this.ctx('pharmacistTopMeds');
    if (ctxTop) {
      this.destroy('pharmacistTopMeds');
      new C(ctxTop, {
        type: 'bar',
        data: {
          labels: ['Paracetamol','Amoxicillin','Metformin','Atorvastatin','Omeprazole'],
          datasets: [{ data: [120,88,74,65,58], backgroundColor: ['#667eea','#4299e1','#10b981','#f59e0b','#9f7aea'], borderRadius: 8, borderSkipped: false }],
        },
        options: {
          indexAxis: 'y', responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, title: { display: true, text: 'Top Dispensed Medicines', color: '#1a202c', font: { size: 14, weight: 'bold' } } },
          scales: {
            x: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', precision: 0 }, beginAtZero: true },
            y: { grid: { display: false }, ticks: { color: '#4a5568', font: { size: 11 } } },
          },
        },
      });
    }
  }

  // ── Patient ────────────────────────────────────────────────────────────────
  renderPatientCharts() {
    const C = (window as any).Chart;

    const ctxLine = this.ctx('patientAppointmentHistory');
    if (ctxLine) {
      this.destroy('patientAppointmentHistory');
      new C(ctxLine, {
        type: 'line',
        data: {
          labels: ['Jan','Feb','Mar','Apr','May','Jun'],
          datasets: [{ label: 'Appointments', data: [1,2,1,3,2,2], borderColor: '#667eea', backgroundColor: 'rgba(102,126,234,0.10)', fill: true, tension: 0.4, pointBackgroundColor: '#667eea', pointRadius: 5, pointHoverRadius: 7, borderWidth: 3 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false }, title: { display: true, text: 'Appointment History', color: '#1a202c', font: { size: 14, weight: 'bold' } } },
          scales: {
            x: { grid: { display: false }, ticks: { color: '#718096' } },
            y: { grid: { color: '#f1f5f9' }, ticks: { color: '#718096', precision: 0, stepSize: 1 }, beginAtZero: true },
          },
        },
      });
    }

    const ctxD = this.ctx('patientHealthDoughnut');
    if (ctxD) {
      this.destroy('patientHealthDoughnut');
      new C(ctxD, {
        type: 'doughnut',
        data: {
          labels: ['Upcoming Appts','Active Prescriptions','Pending Reports','Pending Bills'],
          datasets: [{ data: [2,3,1,1], backgroundColor: ['#667eea','#9f7aea','#ed8936','#f56565'], borderWidth: 3, borderColor: '#fff', hoverOffset: 6 }],
        },
        options: {
          responsive: true, maintainAspectRatio: false, cutout: '65%',
          plugins: {
            legend: { position: 'bottom', labels: { color: '#4a5568', font: { size: 11 }, padding: 10, boxWidth: 12 } },
            title: { display: true, text: 'My Health Overview', color: '#1a202c', font: { size: 14, weight: 'bold' } },
          },
        },
      });
    }
  }
}
