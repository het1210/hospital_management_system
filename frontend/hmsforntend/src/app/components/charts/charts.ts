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
