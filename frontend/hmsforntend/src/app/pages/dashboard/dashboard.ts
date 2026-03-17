import { AfterViewInit, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AuthService } from '../../services/auth';
import { HospitalService } from '../../services/hospital.service';
import { AppointmentService } from '../../services/appointment.service';
import { Appointment } from '../../models/appointment.model';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { single } from 'rxjs';

interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FullCalendarModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  stats: StatCard[] = [];
  userRole: string = '';
  userId: number = 0;
  welcomeMessage: string = '';
  hospitalCount: number = 0;
  activeHospitals: number = 0;
  appointments: Appointment[] = [];
  appointmentState:{totalAppointment:number,bookedAppointment:number,checkedInAppointment:number,completedAppointment:number, cancelledAppointment:number}
  ={
    totalAppointment:0,
    bookedAppointment:0,
    checkedInAppointment:0,
    completedAppointment:0,
    cancelledAppointment:0
  }
  appointmentStatForToday:{totalAppointment:number,bookedAppointment:number,checkedInAppointment:number,completedAppointment:number,cancelledAppointmet:number}
  ={
    totalAppointment:0,
    bookedAppointment:0,
    checkedInAppointment:0,
    completedAppointment:0,
    cancelledAppointmet:0
  }
  isShowCalendar: boolean = false;

  // Appointment chart
  appointmentMetrics: { label: string; value: number; color: string }[] = [];
  private chartsInitialized = false;
  dateFrom: string = new Date().toISOString().split('T')[0];
  dateTo: string = new Date().toISOString().split('T')[0];

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: false,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    slotDuration: '00:30:00',
    slotLabelInterval: '01:00:00',
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    },
    eventTimeFormat: {
      hour: 'numeric',
      minute: '2-digit',
      meridiem: 'short'
    },
    allDaySlot: false,
    height: 'auto',
    contentHeight: 650,
    expandRows: true,
    nowIndicator: true,
    eventClick: (clickInfo) => this.handleEventClick(clickInfo),
    events: []
  };

  constructor(
    private authService: AuthService,
    private hospitalService: HospitalService,
    private appointmentService: AppointmentService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.userRole = this.authService.getRole() || '';
    this.userId = parseInt(localStorage.getItem('user_id') || '0');
    if (this.userRole === 'superadmin') {
      this.getHospitalCount();
    } else {
      this.loadDashboardData();
    }

    if (this.userRole === 'doctor') {
      this.loadCountOfAppointments("doctor", this.dateFrom,this.dateTo);
      this.loadCountOfAppointmentsForToday("doctor",new Date().toISOString().split('T')[0],new Date().toISOString().split('T')[0]);
    }
    else if (this.userRole === 'frontdesk') {
      this.loadCountOfAppointments("frontdesk", this.dateFrom,this.dateTo);
      this.loadCountOfAppointmentsForToday("frontdesk",new Date().toISOString().split('T')[0],new Date().toISOString().split('T')[0]);
    }
  }

  // Load dashboard data based on user role
  loadDashboardData() {
    switch (this.userRole) {
      case 'superadmin':
        this.welcomeMessage = 'Super Admin Dashboard';
        this.stats = [
          { title: 'Total Hospitals', value: this.hospitalCount, icon: '🏥', color: '#667eea' },
          { title: 'Active Hospitals', value: this.activeHospitals, icon: '✅', color: '#48bb78' },
          { title: 'Total Users', value: 1250, icon: '👥', color: '#4299e1' },
          { title: 'Active Users (24h)', value: 856, icon: '🟢', color: '#38b2ac' },
          { title: 'Total Patients', value: 8450, icon: '🤒', color: '#ed8936' },
          { title: 'Appointments Today', value: 234, icon: '📅', color: '#9f7aea' },
          { title: 'Revenue (Month)', value: '$125,450', icon: '💰', color: '#48bb78' },
          { title: 'System Health', value: '98%', icon: '⚡', color: '#38b2ac' }
        ];
        break;
      case 'hospitaladmin':
        this.welcomeMessage = 'Hospital Admin Dashboard';
        this.stats = [
          { title: 'Total Departments', value: 12, icon: '🏢', color: '#667eea' },
          { title: 'Total Doctors', value: 45, icon: '👨⚕️', color: '#4299e1' },
          { title: 'Total Staff', value: 120, icon: '👔', color: '#9f7aea' },
          { title: 'Total Patients', value: 1234, icon: '🤒', color: '#ed8936' },
          { title: 'Appointments Today', value: 45, icon: '📅', color: '#48bb78' },
          { title: 'Available Beds', value: 156, icon: '🛏️', color: '#38b2ac' },
          { title: 'Revenue Today', value: '$8,450', icon: '💰', color: '#48bb78' },
          { title: 'Pending Bills', value: 23, icon: '📋', color: '#f56565' }
        ];
        break;
      case 'doctor':
        this.welcomeMessage = 'Doctor Dashboard';
        this.stats = [
          { title: 'Appointments Today', value: this.appointmentStatForToday.totalAppointment, icon: '📅', color: '#667eea' },
          { title: 'Completed Appointments', value: this.appointmentStatForToday.completedAppointment, icon: '🤒', color: '#4299e1' },
          { title: 'CHECKDED IN Appointments', value: this.appointmentStatForToday.checkedInAppointment, icon: '🩺', color: '#ed8936' },
          { title: 'Lab Orders', value: 15, icon: '🔬', color: '#9f7aea' }
        ];
        break;
      case 'nurse':
        this.welcomeMessage = 'Nurse Dashboard';
        this.stats = [
          { title: 'Assigned Patients', value: 24, icon: '🤒', color: '#667eea' },
          { title: 'Vitals Pending', value: 8, icon: '❤️', color: '#f56565' },
          { title: 'Medications Due', value: 12, icon: '💉', color: '#ed8936' },
          { title: 'Ward Occupancy', value: '85%', icon: '🛏️', color: '#38b2ac' }
        ];
        break;
      case 'frontdesk':
        this.welcomeMessage = 'Front Desk Dashboard';
        this.stats = [
          { title: 'Check-ins Today', value: this.appointmentStatForToday.checkedInAppointment, icon: '✅', color: '#48bb78' },
          { title: 'Appointments Today', value: this.appointmentStatForToday.totalAppointment, icon: '📅', color: '#667eea' },
          { title: 'Pending Registrations', value: 5, icon: '📝', color: '#ed8936' },
          { title: 'Billing Pending', value: 12, icon: '💰', color: '#f56565' }
        ];
        break;
      case 'labtechnician':
        this.welcomeMessage = 'Lab Technician Dashboard';
        this.stats = [
          { title: 'Pending Tests', value: 23, icon: '🔬', color: '#667eea' },
          { title: 'Completed Today', value: 45, icon: '✅', color: '#48bb78' },
          { title: 'Urgent Tests', value: 5, icon: '⚠️', color: '#f56565' },
          { title: 'Reports Pending', value: 8, icon: '📋', color: '#ed8936' }
        ];
        break;
      case 'pharmacist':
        this.welcomeMessage = 'Pharmacist Dashboard';
        this.stats = [
          { title: 'Prescriptions Today', value: 56, icon: '💊', color: '#667eea' },
          { title: 'Dispensed', value: 48, icon: '✅', color: '#48bb78' },
          { title: 'Low Stock Items', value: 12, icon: '⚠️', color: '#f56565' },
          { title: 'Sales Today', value: '$2,340', icon: '💰', color: '#48bb78' }
        ];
        break;
      case 'patient':
        this.welcomeMessage = 'Patient Dashboard';
        this.stats = [
          { title: 'Upcoming Appointments', value: 2, icon: '📅', color: '#667eea' },
          { title: 'Active Prescriptions', value: 3, icon: '💊', color: '#9f7aea' },
          { title: 'Pending Lab Reports', value: 1, icon: '🔬', color: '#ed8936' },
          { title: 'Pending Bills', value: '$450', icon: '💰', color: '#f56565' }
        ];
        break;
      default:
        this.welcomeMessage = 'Dashboard';
        this.stats = [];
    }
  }


  // Fetch hospital count for superadmin dashboard
  getHospitalCount() {
    this.hospitalService.getHospitalCount().subscribe({
      next: (response) => {
        const obj = response.data as any;
        this.hospitalCount = obj.totalHospitals || 0;
        this.activeHospitals = obj.totalActiveHospitals || 0;
        this.loadDashboardData(); // Refresh stats with the new hospital count
        this.cdRef.detectChanges(); // Trigger change detection to update the view

      },
      error: (error) => {
        console.error('Error fetching hospital count:', error);
      }
    });
  }

  loadDoctorAppointments() {
    this.appointmentService.getDoctorAllAppointments(this.userId).subscribe({
      next: (response) => {
        this.appointments = response.data;
        this.updateCalendarEvents();
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
      }
    });
  }

  loadCountOfAppointments(role: string, from:string,to:string) {
    this.appointmentService.count(role,from,to).subscribe({
      next: (response) => {
        this.appointmentState=response.data;
        this.loadDashboardData();
        this.toastService.success(response.message);
        this.cdRef.detectChanges();
        this.buildAppointmentMetrics();
      },
      error: (error) => {
        console.error('Error loading appointment count:', error);
      }
    });
  }


    loadCountOfAppointmentsForToday(role: string, from:string,to:string) {
    this.appointmentService.count(role,from,to).subscribe({
      next: (response) => {
       this.appointmentStatForToday=response.data;
       console.log(this.appointmentStatForToday);
              
        this.loadDashboardData();
        this.toastService.success(response.message);
        this.cdRef.detectChanges();
        this.buildAppointmentMetrics();
      },
      error: (error) => {
        console.error('Error loading appointment count:', error);
      }
    });
  }


  onStatClick(state: any) {
    console.log(state);
    if (this.userRole === "doctor") {
      if (state.title === "Appointments Today") {
        this.loadDoctorAppointments();
        this.isShowCalendar = !this.isShowCalendar;
        this.cdRef.detectChanges();
      }
      if (state.title === "My Patients") {
        console.log(`Fetch Patients`);

      }
    }
    if (this.userRole === "frontdesk") {
      if (state.title === "Appointments Today") {
        this.router.navigate(['/appointments'])
      }
    }

  }


  //calendar events update
  updateCalendarEvents() {
    const events = this.appointments.map(apt => {
      const statusColors: any = {
        'BOOKED': { bg: '#3b82f6', border: '#2563eb' },
        'CHECKIN': { bg: '#10b981', border: '#059669' },
        'COMPLETED': { bg: '#6366f1', border: '#4f46e5' },
        'CANCELLED': { bg: '#ef4444', border: '#dc2626' }
      };

      const colors = statusColors[apt.status] || { bg: '#3b82f6', border: '#2563eb' };

      return {
        id: apt.id?.toString(),
        title: `${apt.patientName || 'Patient'} - ${apt.type || 'Appointment'}`,
        start: apt.appointmentStart,
        end: apt.appointmentEnd,
        backgroundColor: colors.bg,
        borderColor: colors.border,
        textColor: '#ffffff',
        extendedProps: {
          appointment: apt
        }
      };
    });

    this.calendarOptions = {
      ...this.calendarOptions,
      events: events,
      eventClick: (clickInfo) => this.handleEventClick(clickInfo)
    };
    this.cdRef.detectChanges();
  }

  handleEventClick(clickInfo: EventClickArg) {
    const appointment = clickInfo.event.extendedProps['appointment'] as Appointment;
    console.log('Appointment clicked:', appointment);
    // You can add navigation or modal opening logic here
  }



  //charts
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
    this.loadCountOfAppointments(this.userRole,this.dateFrom, this.dateTo);
  }
}

clearDateFilter() {
  this.loadCountOfAppointments(this.userRole,this.dateFrom,this.dateTo);
}
}
