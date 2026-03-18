// import { AfterViewInit, ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { FullCalendarModule } from '@fullcalendar/angular';
// import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
// import dayGridPlugin from '@fullcalendar/daygrid';
// import timeGridPlugin from '@fullcalendar/timegrid';
// import interactionPlugin from '@fullcalendar/interaction';
// import { AuthService } from '../../services/auth';
// import { HospitalService } from '../../services/hospital.service';
// import { AppointmentService } from '../../services/appointment.service';
// import { Appointment } from '../../models/appointment.model';
// import { ToastService } from '../../services/toast.service';
// import { Router } from '@angular/router';
// import { FormsModule } from '@angular/forms';
// import { single } from 'rxjs';
// import { PatientService } from '../../services/patient.service';
// import { UserService } from '../../services/user.service';
// import { Charts } from '../../components/charts/charts';

// interface StatCard {
//   title: string;
//   value: string | number;
//   icon: string;
//   color: string;
// }

// @Component({
//   selector: 'app-dashboard',
//   imports: [CommonModule, FullCalendarModule, FormsModule, Charts],
//   templateUrl: './dashboard.html',
//   styleUrl: './dashboard.scss',
// })
// export class Dashboard implements OnInit {
//   stats: StatCard[] = [];
//   userRole: string = '';
//   userId: number = 0;
//   welcomeMessage: string = '';
//   hospitalCount: number = 0;
//   patientCount: number = 0;
//   userCount: { 'totalUser': number, 'totalDoctor': number, totalNurse: number } = { 'totalUser': 0, 'totalDoctor': 0, 'totalNurse': 0 }
//   activeHospitals: number = 0;
//   hospitaId: string | null = localStorage.getItem('hospital_id') || '0'
//   appointments: Appointment[] = [];
//   appointmentState: { totalAppointment: number, bookedAppointment: number, checkedInAppointment: number, completedAppointment: number, cancelledAppointment: number }
//     = {
//       totalAppointment: 0,
//       bookedAppointment: 0,
//       checkedInAppointment: 0,
//       completedAppointment: 0,
//       cancelledAppointment: 0
//     }
//   appointmentStatForToday: { totalAppointment: number, bookedAppointment: number, checkedInAppointment: number, completedAppointment: number, cancelledAppointment: number }
//     = {
//       totalAppointment: 0,
//       bookedAppointment: 0,
//       checkedInAppointment: 0,
//       completedAppointment: 0,
//       cancelledAppointment: 0
//     }
//   isShowCalendar: boolean = false;


//   calendarOptions: CalendarOptions = {
//     plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
//     initialView: 'timeGridWeek',
//     headerToolbar: {
//       left: 'prev,next today',
//       center: 'title',
//       right: 'dayGridMonth,timeGridWeek,timeGridDay'
//     },
//     editable: false,
//     selectable: true,
//     selectMirror: true,
//     dayMaxEvents: true,
//     weekends: true,
//     slotMinTime: '08:00:00',
//     slotMaxTime: '20:00:00',
//     slotDuration: '00:30:00',
//     slotLabelInterval: '01:00:00',
//     slotLabelFormat: {
//       hour: 'numeric',
//       minute: '2-digit',
//       meridiem: 'short'
//     },
//     eventTimeFormat: {
//       hour: 'numeric',
//       minute: '2-digit',
//       meridiem: 'short'
//     },
//     allDaySlot: false,
//     height: 'auto',
//     contentHeight: 650,
//     expandRows: true,
//     nowIndicator: true,
//     eventClick: (clickInfo) => this.handleEventClick(clickInfo),
//     events: []
//   };

//   constructor(
//     private authService: AuthService,
//     private hospitalService: HospitalService,
//     private patientService: PatientService,
//     private userSerivce: UserService,
//     private appointmentService: AppointmentService,
//     private cdRef: ChangeDetectorRef,
//     private router: Router,
//     private toastService: ToastService
//   ) { }

//   ngOnInit() {
//     this.userRole = this.authService.getRole() || '';
//     this.userId = parseInt(localStorage.getItem('user_id') || '0');
//     if (this.userRole === 'superadmin') {
//       this.loadPatientCount(null);
//       // this.loadUserCount(null);
  
//       this.getHospitalCount();
//     }
//     if (this.userRole === 'hospitaladmin') {
//       this.loadPatientCount(this.hospitaId);
     
//       // this.loadDashboardData();
//     }

//     if (this.userRole === 'doctor') {
//       this.loadPatientCount(this.hospitaId);
//     }
//     if (this.userRole === 'frontdesk') {
//       this.loadPatientCount(this.hospitaId);
    
//     }
//   }

//   // Load dashboard data based on user role
//   loadDashboardData() {
//     switch (this.userRole) {
//       case 'superadmin':
//         this.welcomeMessage = 'Super Admin Dashboard';
//         this.stats = [
//           { title: 'Total Hospitals', value: this.hospitalCount, icon: '🏥', color: '#667eea' },
//           { title: 'Active Hospitals', value: this.activeHospitals, icon: '✅', color: '#48bb78' },
//           { title: 'Total Users', value: this.userCount.totalUser, icon: '👥', color: '#4299e1' },
//           { title: 'Total Doctors', value: this.userCount.totalDoctor, icon: '🟢', color: '#38b2ac' },
//           { title: 'Total Patients', value: this.patientCount, icon: '🤒', color: '#ed8936' },
//           { title: 'Appointments Today', value: this.appointmentStatForToday.totalAppointment, icon: '📅', color: '#9f7aea' },
//           // { title: 'Revenue (Month)', value: '$125,450', icon: '💰', color: '#48bb78' },
//           // { title: 'System Health', value: '98%', icon: '⚡', color: '#38b2ac' }
//         ];
//         break;
//       case 'hospitaladmin':
//         this.welcomeMessage = 'Hospital Admin Dashboard';
//         this.stats = [
//           // { title: 'Total Departments', value: 12, icon: '🏢', color: '#667eea' },
//           { title: 'Total Doctors', value: this.userCount.totalDoctor, icon: '👨⚕️', color: '#4299e1' },
//           { title: 'Total Nurse', value: this.userCount.totalNurse, icon: '👨⚕️', color: '#4299e1' },
//           { title: 'Total Staff', value: this.userCount.totalUser, icon: '👔', color: '#9f7aea' },
//           { title: 'Total Patients', value: this.patientCount, icon: '🤒', color: '#ed8936' },
//           { title: 'Appointments Today', value: this.appointmentStatForToday.totalAppointment, icon: '📅', color: '#48bb78' },
//           // { title: 'Available Beds', value: 156, icon: '🛏️', color: '#38b2ac' },
//           // { title: 'Revenue Today', value: '$8,450', icon: '💰', color: '#48bb78' },
//           // { title: 'Pending Bills', value: 23, icon: '📋', color: '#f56565' }
//         ];
//         break;
//       case 'doctor':
//         this.welcomeMessage = 'Doctor Dashboard';
//         this.stats = [
//           { title: 'Appointments Today', value: this.appointmentStatForToday.totalAppointment, icon: '📅', color: '#667eea' },
//           { title: 'Completed Appointments', value: this.appointmentStatForToday.completedAppointment, icon: '🤒', color: '#4299e1' },
//           { title: 'CHECKDED IN Appointments', value: this.appointmentStatForToday.checkedInAppointment, icon: '🩺', color: '#ed8936' },
//           { title: 'Lab Orders', value: 15, icon: '🔬', color: '#9f7aea' }
//         ];
//         break;
//       case 'nurse':
//         this.welcomeMessage = 'Nurse Dashboard';
//         this.stats = [
//           { title: 'Assigned Patients', value: 24, icon: '🤒', color: '#667eea' },
//           { title: 'Vitals Pending', value: 8, icon: '❤️', color: '#f56565' },
//           { title: 'Medications Due', value: 12, icon: '💉', color: '#ed8936' },
//           { title: 'Ward Occupancy', value: '85%', icon: '🛏️', color: '#38b2ac' }
//         ];
//         break;
//       case 'frontdesk':
//         this.welcomeMessage = 'Front Desk Dashboard';
//         this.stats = [
//           { title: 'Check-ins Today', value: this.appointmentStatForToday.checkedInAppointment, icon: '✅', color: '#48bb78' },
//           { title: 'Appointments Today', value: this.appointmentStatForToday.totalAppointment, icon: '📅', color: '#667eea' },
//           { title: 'Pending Registrations', value: 5, icon: '📝', color: '#ed8936' },
//           { title: 'Billing Pending', value: 12, icon: '💰', color: '#f56565' }
//         ];
//         break;
//       case 'labtechnician':
//         this.welcomeMessage = 'Lab Technician Dashboard';
//         this.stats = [
//           { title: 'Pending Tests', value: 23, icon: '🔬', color: '#667eea' },
//           { title: 'Completed Today', value: 45, icon: '✅', color: '#48bb78' },
//           { title: 'Urgent Tests', value: 5, icon: '⚠️', color: '#f56565' },
//           { title: 'Reports Pending', value: 8, icon: '📋', color: '#ed8936' }
//         ];
//         break;
//       case 'pharmacist':
//         this.welcomeMessage = 'Pharmacist Dashboard';
//         this.stats = [
//           { title: 'Prescriptions Today', value: 56, icon: '💊', color: '#667eea' },
//           { title: 'Dispensed', value: 48, icon: '✅', color: '#48bb78' },
//           { title: 'Low Stock Items', value: 12, icon: '⚠️', color: '#f56565' },
//           { title: 'Sales Today', value: '$2,340', icon: '💰', color: '#48bb78' }
//         ];
//         break;
//       case 'patient':
//         this.welcomeMessage = 'Patient Dashboard';
//         this.stats = [
//           { title: 'Upcoming Appointments', value: 2, icon: '📅', color: '#667eea' },
//           { title: 'Active Prescriptions', value: 3, icon: '💊', color: '#9f7aea' },
//           { title: 'Pending Lab Reports', value: 1, icon: '🔬', color: '#ed8936' },
//           { title: 'Pending Bills', value: '$450', icon: '💰', color: '#f56565' }
//         ];
//         break;
//       default:
//         this.welcomeMessage = 'Dashboard';
//         this.stats = [];
//     }
//   }


//   // Fetch hospital count for superadmin dashboard
//   getHospitalCount() {
//     this.hospitalService.getHospitalCount().subscribe({
//       next: (response) => {
//         const obj = response.data as any;
//         this.hospitalCount = obj.totalHospitals || 0;
//         this.activeHospitals = obj.totalActiveHospitals || 0;
//         this.loadDashboardData(); // Refresh stats with the new hospital count
//         this.cdRef.detectChanges(); // Trigger change detection to update the view

//       },
//       error: (error) => {
//         console.error('Error fetching hospital count:', error);
//       }
//     });
//   }

//   loadDoctorAppointments() {
//     this.appointmentService.getDoctorAllAppointments(this.userId).subscribe({
//       next: (response) => {
//         this.appointments = response.data;
//         this.updateCalendarEvents();
//       },
//       error: (error) => {
//         console.error('Error loading appointments:', error);
//       }
//     });
//   }
//   loadPatientCount(hospitalId: string | null) {
//     this.patientService.count(Number(hospitalId)).subscribe({
//       next: (response) => {
//         console.log(response);
//         this.patientCount = response.data;

//         this.loadDashboardData();
//         this.cdRef.detectChanges();
//       },
//       error: (error) => {
//         console.error('Error loading patient count:', error);
//       }
//     })
//   }

//   onStatClick(state: any) {
//     console.log(state);
//     switch (this.userRole) {
//       case "doctor":
//         if (state.title === "Appointments Today") {
//           this.loadDoctorAppointments();
//           this.isShowCalendar = !this.isShowCalendar;
//           this.cdRef.detectChanges();
//         }
//         if (state.title === "My Patients") {
//           console.log(`Fetch Patients`);

//         }
//         break;
//       case "frontdesk":
//         if (state.title === "Appointments Today") {
//           this.router.navigate(['/appointments'])
//         }
//         break;
//       case "superadmin":
//         if (state.title === "Total Hospitals" || state.title === "Active Hospitals") {
//           this.router.navigate(['/hospitals'])
//         }
//         if (state.title === "Total Users" || state.title === "Total Doctors") {
//           this.router.navigate(['/users'])
//         }
//         if (state.title === "Total Patients") {
//           this.router.navigate(['/patients'])
//         }
//         break;
//       default:
//         console.log("No User Role");
//         break;

//     }


//   }


//   //calendar events update
//   updateCalendarEvents() {
//     const events = this.appointments.map(apt => {
//       const statusColors: any = {
//         'BOOKED': { bg: '#3b82f6', border: '#2563eb' },
//         'CHECKIN': { bg: '#10b981', border: '#059669' },
//         'COMPLETED': { bg: '#6366f1', border: '#4f46e5' },
//         'CANCELLED': { bg: '#ef4444', border: '#dc2626' }
//       };

//       const colors = statusColors[apt.status] || { bg: '#3b82f6', border: '#2563eb' };

//       return {
//         id: apt.id?.toString(),
//         title: `${apt.patientName || 'Patient'} - ${apt.type || 'Appointment'}`,
//         start: apt.appointmentStart,
//         end: apt.appointmentEnd,
//         backgroundColor: colors.bg,
//         borderColor: colors.border,
//         textColor: '#ffffff',
//         extendedProps: {
//           appointment: apt
//         }
//       };
//     });

//     this.calendarOptions = {
//       ...this.calendarOptions,
//       events: events,
//       eventClick: (clickInfo) => this.handleEventClick(clickInfo)
//     };
//     this.cdRef.detectChanges();
//   }

//   handleEventClick(clickInfo: EventClickArg) {
//     const appointment = clickInfo.event.extendedProps['appointment'] as Appointment;
//     console.log('Appointment clicked:', appointment);
//     // You can add navigation or modal opening logic here
//   }

//   //Chart Event Handlers
//   handleAppointmentValues(event : any){
//     this.appointmentState = event;
//     this.loadDashboardData();
//   }
//   handleAppointmentForToday(event:any){
//     this.appointmentStatForToday = event;  
//     this.loadDashboardData();
//   }
//   handleUserCount(event:any){
//     this.userCount = event;
//     this.loadDashboardData();
//   }
// }

import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';

import { AuthService } from '../../services/auth';
import { HospitalService } from '../../services/hospital.service';
import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../services/patient.service';
import { UserService } from '../../services/user.service';
import { DashboardService, DashboardAnalytics } from '../../services/dashboard.service';
import { ToastService } from '../../services/toast.service';
import { Appointment } from '../../models/appointment.model';
import { Charts } from '../../components/charts/charts';

export interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: number;           // positive = up, negative = down, null = neutral
  trendLabel?: string;
  route?: string;
}

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FullCalendarModule, FormsModule, Charts],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {

  // ── State ─────────────────────────────────────────────────────────
  userRole = '';
  userId = 0;
  hospitalId = 0;
  welcomeMessage = '';
  greeting = '';
  currentDate = new Date();

  stats: StatCard[] = [];
  analytics: DashboardAnalytics | null = null;
  isLoadingAnalytics = true;
  analyticsError = false;

  // ── Legacy state (kept for stat cards & calendar) ─────────────────
  hospitalCount = 0;
  activeHospitals = 0;
  patientCount = 0;
  userCount = { totalUser: 0, totalDoctor: 0, totalNurse: 0 };
  appointmentStatForToday = {
    totalAppointment: 0, bookedAppointment: 0,
    checkedInAppointment: 0, completedAppointment: 0, cancelledAppointment: 0,
  };

  // ── Calendar ──────────────────────────────────────────────────────
  isShowCalendar = false;
  appointments: Appointment[] = [];
  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: { left: 'prev,next today', center: 'title', right: 'dayGridMonth,timeGridWeek,timeGridDay' },
    editable: false, selectable: true, dayMaxEvents: true, weekends: true,
    slotMinTime: '08:00:00', slotMaxTime: '20:00:00',
    slotDuration: '00:30:00', allDaySlot: false, height: 'auto', contentHeight: 650,
    expandRows: true, nowIndicator: true,
    eventClick: (info) => this.handleEventClick(info),
    events: [],
  };

  constructor(
    private authService: AuthService,
    private hospitalService: HospitalService,
    private patientService: PatientService,
    private userService: UserService,
    private appointmentService: AppointmentService,
    private dashboardService: DashboardService,
    private cdRef: ChangeDetectorRef,
    private router: Router,
    private toastService: ToastService,
  ) {}

  // ─────────────────────────────────────────────────────────────────
  ngOnInit() {
    this.userRole   = this.authService.getRole() || '';
    this.userId     = parseInt(localStorage.getItem('user_id') || '0');
    this.hospitalId = parseInt(localStorage.getItem('hospital_id') || '0');
    this.greeting   = this.buildGreeting();
    this.bootstrapRole();
  }

  private buildGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  // ── Role bootstrapping ────────────────────────────────────────────
  private bootstrapRole() {
    switch (this.userRole) {
      case 'superadmin':
        this.welcomeMessage = 'Super Admin Dashboard';
        this.loadSuperAdminDashboard();
        break;

      case 'hospitaladmin':
        this.welcomeMessage = 'Hospital Dashboard';
        this.loadHospitalAdminDashboard();
        break;

      case 'doctor':
        this.welcomeMessage = 'Doctor Dashboard';
        this.loadDoctorDashboard();
        break;

      case 'frontdesk':
        this.welcomeMessage = 'Front Desk Dashboard';
        this.loadFrontdeskDashboard();
        break;

      case 'nurse':
        this.welcomeMessage = 'Nurse Dashboard';
        this.buildNurseStats();
        this.isLoadingAnalytics = false;
        break;

      case 'labtechnician':
        this.welcomeMessage = 'Lab Dashboard';
        this.buildLabStats();
        this.isLoadingAnalytics = false;
        break;

      case 'pharmacist':
        this.welcomeMessage = 'Pharmacy Dashboard';
        this.buildPharmacistStats();
        this.isLoadingAnalytics = false;
        break;

      case 'patient':
        this.welcomeMessage = 'My Health Portal';
        this.buildPatientStats();
        this.isLoadingAnalytics = false;
        break;

      default:
        this.isLoadingAnalytics = false;
    }
  }

  // ── SUPER ADMIN ──────────────────────────────────────────────────
  private loadSuperAdminDashboard() {
    // Parallel: hospital count + analytics
    this.hospitalService.getHospitalCount().subscribe({
      next: (r: any) => {
        const obj = r.data as any;
        this.hospitalCount   = obj.totalHospitals   || 0;
        this.activeHospitals = obj.totalActiveHospitals || 0;
        this.patientService.count(0).subscribe({
          next: (pr: any) => {
            this.patientCount = pr.data || 0;
            this.userService.count(0).subscribe({
              next: (ur: any) => {
                this.userCount = ur.data || this.userCount;
                this.buildSuperAdminStats();
                this.cdRef.detectChanges();
              },
            });
          },
        });
      },
    });

    this.dashboardService.getSuperAdminAnalytics().subscribe({
      next: (r) => {
        this.analytics = r.data;
        this.isLoadingAnalytics = false;
        this.cdRef.detectChanges();
      },
      error: () => { this.isLoadingAnalytics = false; this.analyticsError = true; },
    });
  }

  private buildSuperAdminStats() {
    this.stats = [
      { title: 'Total Hospitals',     value: this.hospitalCount,              icon: '🏥', color: '#667eea', trend: 5,  trendLabel: 'this month', route: '/hospitals' },
      { title: 'Active Hospitals',    value: this.activeHospitals,            icon: '✅', color: '#48bb78' },
      { title: 'Total Users',         value: this.userCount.totalUser,        icon: '👥', color: '#4299e1', route: '/users' },
      { title: 'Total Doctors',       value: this.userCount.totalDoctor,      icon: '👨‍⚕️', color: '#38b2ac' },
      { title: 'Total Nurses',        value: this.userCount.totalNurse,       icon: '💉', color: '#9f7aea' },
      { title: 'Total Patients',      value: this.patientCount,               icon: '🤒', color: '#ed8936', route: '/patients' },
      { title: 'Appts Today',         value: this.analytics?.totalAppointments ?? 0, icon: '📅', color: '#f56565' },
      { title: 'Completed Today',     value: this.analytics?.completedAppointments ?? 0, icon: '✔️', color: '#48bb78' },
    ];
  }

  // ── HOSPITAL ADMIN ───────────────────────────────────────────────
  private loadHospitalAdminDashboard() {
    const today = new Date().toISOString().split('T')[0];

    this.patientService.count(this.hospitalId).subscribe({
      next: (r: any) => { this.patientCount = r.data || 0; this.buildHospitalAdminStats(); this.cdRef.detectChanges(); },
    });

    this.userService.count(this.hospitalId).subscribe({
      next: (r: any) => { this.userCount = r.data || this.userCount; this.buildHospitalAdminStats(); this.cdRef.detectChanges(); },
    });

    this.appointmentService.count('frontdesk', today, today).subscribe({
      next: (r: any) => {
        const d = r.data;
        this.appointmentStatForToday = {
          totalAppointment: d.totalAppointment, bookedAppointment: d.bookedAppointment,
          checkedInAppointment: d.checkedInAppointment, completedAppointment: d.completedAppointment,
          cancelledAppointment: d.cancelledAppointment,
        };
        this.buildHospitalAdminStats();
        this.cdRef.detectChanges();
      },
    });

    this.dashboardService.getHospitalAdminAnalytics().subscribe({
      next: (r) => {
        this.analytics = r.data;
        this.isLoadingAnalytics = false;
        this.buildHospitalAdminStats();
        this.cdRef.detectChanges();
      },
      error: () => { this.isLoadingAnalytics = false; this.analyticsError = true; },
    });
  }

  private buildHospitalAdminStats() {
    this.stats = [
      { title: 'Total Doctors',      value: this.userCount.totalDoctor,                  icon: '👨‍⚕️', color: '#4299e1', route: '/users' },
      { title: 'Total Nurses',       value: this.userCount.totalNurse,                   icon: '💉',   color: '#9f7aea', route: '/users' },
      { title: 'Total Staff',        value: this.userCount.totalUser,                    icon: '👔',   color: '#667eea' },
      { title: 'Total Patients',     value: this.patientCount,                           icon: '🤒',   color: '#ed8936', route: '/patients' },
      { title: 'Appts Today',        value: this.appointmentStatForToday.totalAppointment, icon: '📅', color: '#48bb78', route: '/appointments' },
      { title: 'Checked In',         value: this.appointmentStatForToday.checkedInAppointment, icon: '✅', color: '#38b2ac' },
      { title: 'Total Consultations',value: this.analytics?.totalConsultations ?? 0,    icon: '🩺',   color: '#f59e0b' },
      { title: 'Open Episodes',      value: this.analytics?.openEpisodes ?? 0,          icon: '📋',   color: '#f56565', route: '/episode' },
    ];
  }

  // ── DOCTOR ────────────────────────────────────────────────────────
  private loadDoctorDashboard() {
    this.loadDoctorAppointments();
    this.isShowCalendar = true;

    const today = new Date().toISOString().split('T')[0];

    this.appointmentService.count('doctor', today, today).subscribe({
      next: (r: any) => {
        const d = r.data;
        this.appointmentStatForToday = {
          totalAppointment: d.totalAppointment, bookedAppointment: d.bookedAppointment,
          checkedInAppointment: d.checkedInAppointment, completedAppointment: d.completedAppointment,
          cancelledAppointment: d.cancelledAppointment,
        };
        this.buildDoctorStats();
        this.cdRef.detectChanges();
      },
    });

    this.dashboardService.getDoctorAnalytics().subscribe({
      next: (r) => {
        this.analytics = r.data;
        this.isLoadingAnalytics = false;
        this.buildDoctorStats();
        this.cdRef.detectChanges();
      },
      error: () => { this.isLoadingAnalytics = false; this.analyticsError = true; },
    });
  }

  private buildDoctorStats() {
    this.stats = [
      { title: 'Appointments Today',    value: this.appointmentStatForToday.totalAppointment,     icon: '📅', color: '#667eea', route: '/appointments' },
      { title: 'Checked In',            value: this.appointmentStatForToday.checkedInAppointment, icon: '🩺', color: '#ed8936' },
      { title: 'Completed Today',       value: this.appointmentStatForToday.completedAppointment, icon: '✅', color: '#48bb78' },
      { title: 'Consultations Today',   value: this.analytics?.myConsultationsToday ?? 0,         icon: '💬', color: '#4299e1', route: '/consultations' },
      { title: 'My Patients',           value: this.analytics?.myPatientsCount ?? 0,              icon: '👤', color: '#9f7aea', route: '/patients' },
      { title: 'Upcoming Appts',        value: this.analytics?.myUpcomingAppointments ?? 0,       icon: '🗓️', color: '#f59e0b' },
    ];
  }

  // ── FRONTDESK ────────────────────────────────────────────────────
  private loadFrontdeskDashboard() {
    const today = new Date().toISOString().split('T')[0];

    this.appointmentService.count('frontdesk', today, today).subscribe({
      next: (r: any) => {
        const d = r.data;
        this.appointmentStatForToday = {
          totalAppointment: d.totalAppointment, bookedAppointment: d.bookedAppointment,
          checkedInAppointment: d.checkedInAppointment, completedAppointment: d.completedAppointment,
          cancelledAppointment: d.cancelledAppointment,
        };
        this.buildFrontdeskStats();
        this.cdRef.detectChanges();
      },
    });

    this.dashboardService.getFrontdeskAnalytics().subscribe({
      next: (r) => {
        this.analytics = r.data;
        this.isLoadingAnalytics = false;
        this.buildFrontdeskStats();
        this.cdRef.detectChanges();
      },
      error: () => { this.isLoadingAnalytics = false; this.analyticsError = true; },
    });
  }

  private buildFrontdeskStats() {
    this.stats = [
      { title: 'Total Appts Today',   value: this.appointmentStatForToday.totalAppointment,      icon: '📅', color: '#667eea', route: '/appointments' },
      { title: 'Check-ins Today',     value: this.appointmentStatForToday.checkedInAppointment,  icon: '✅', color: '#48bb78' },
      { title: 'Booked',              value: this.appointmentStatForToday.bookedAppointment,     icon: '🗓️', color: '#4299e1' },
      { title: 'Completed',           value: this.appointmentStatForToday.completedAppointment,  icon: '✔️', color: '#38b2ac' },
      { title: 'Cancelled',           value: this.appointmentStatForToday.cancelledAppointment,  icon: '❌', color: '#f56565' },
      { title: 'Pending Reg.',        value: 5,                                                   icon: '📝', color: '#ed8936' },
    ];
  }

  // ── NURSE ─────────────────────────────────────────────────────────
  private buildNurseStats() {
    this.stats = [
      { title: 'Assigned Patients', value: 24, icon: '🤒', color: '#667eea' },
      { title: 'Vitals Pending',    value: 8,  icon: '❤️', color: '#f56565' },
      { title: 'Medications Due',   value: 12, icon: '💉', color: '#ed8936' },
      { title: 'Ward Occupancy',    value: '85%', icon: '🛏️', color: '#38b2ac' },
      { title: 'IV Checks Due',     value: 7,  icon: '🩸', color: '#9f7aea' },
      { title: 'Discharges Today',  value: 3,  icon: '🏃', color: '#48bb78' },
    ];
  }

  // ── LAB TECHNICIAN ────────────────────────────────────────────────
  private buildLabStats() {
    this.stats = [
      { title: 'Pending Tests',     value: 23, icon: '🔬', color: '#667eea' },
      { title: 'Completed Today',   value: 45, icon: '✅', color: '#48bb78' },
      { title: 'Urgent Tests',      value: 5,  icon: '⚠️', color: '#f56565' },
      { title: 'Reports Pending',   value: 8,  icon: '📋', color: '#ed8936' },
      { title: 'In Progress',       value: 10, icon: '⏳', color: '#4299e1' },
      { title: 'Results Sent',      value: 37, icon: '📤', color: '#38b2ac' },
    ];
  }

  // ── PHARMACIST ────────────────────────────────────────────────────
  private buildPharmacistStats() {
    this.stats = [
      { title: 'Prescriptions Today', value: 56, icon: '💊', color: '#667eea' },
      { title: 'Dispensed',           value: 48, icon: '✅', color: '#48bb78' },
      { title: 'Pending',             value: 8,  icon: '⏳', color: '#ed8936' },
      { title: 'Low Stock Items',     value: 12, icon: '⚠️', color: '#f56565' },
      { title: 'Out of Stock',        value: 4,  icon: '🚫', color: '#ef4444' },
      { title: 'Sales Today',         value: '₹18,400', icon: '💰', color: '#48bb78' },
    ];
  }

  // ── PATIENT ───────────────────────────────────────────────────────
  private buildPatientStats() {
    this.stats = [
      { title: 'Upcoming Appointments', value: 2, icon: '📅', color: '#667eea', route: '/appointments' },
      { title: 'Active Prescriptions',  value: 3, icon: '💊', color: '#9f7aea' },
      { title: 'Pending Lab Reports',   value: 1, icon: '🔬', color: '#ed8936' },
      { title: 'Open Episodes',         value: 1, icon: '📋', color: '#4299e1', route: '/episode' },
    ];
  }

  // ── Calendar ──────────────────────────────────────────────────────
  loadDoctorAppointments() {
    this.appointmentService.getDoctorAllAppointments(this.userId).subscribe({
      next: (r: any) => {
        this.appointments = r.data;
        this.updateCalendarEvents();
      },
    });
  }

  private updateCalendarEvents() {
    const events = this.appointments.map(a => ({
      id: String(a.id),
      title: `Patient #${a.patientId}`,
      start: a.appointmentStart,
      end: a.appointmentEnd,
      backgroundColor: this.statusBg(a.status),
      borderColor: this.statusBg(a.status),
    }));
    this.calendarOptions = { ...this.calendarOptions, events };
    this.cdRef.detectChanges();
  }

  private statusBg(status: string) {
    const map: Record<string, string> = {
      BOOKED: '#3b82f6', CHECKED_IN: '#10b981', COMPLETED: '#6366f1', CANCELLED: '#ef4444',
    };
    return map[status] ?? '#718096';
  }

  private handleEventClick(info: any) {
    this.toastService.success(`Appointment #${info.event.id} — ${info.event.title}`);
  }

  // ── Stat card click ───────────────────────────────────────────────
  onStatClick(stat: StatCard) {
    console.log(stat);
    
    if (stat.route) this.router.navigate([stat.route]);
  }

  // ── Template event handler aliases ───────────────────────────────
  onAppointmentState(evt: any) {
    this.appointmentStatForToday = {
      totalAppointment: evt.totalAppointment,
      bookedAppointment: evt.bookedAppointment,
      checkedInAppointment: evt.checkedInAppointment,
      completedAppointment: evt.completedAppointment,
      cancelledAppointment: evt.cancelledAppointment,
    };
  }

  onAppointmentStateToday(evt: any) { this.onAppointmentState(evt); }

  onUserCount(evt: any) { this.userCount = evt; }

  // Legacy handlers kept for backwards compat
  handleAppointmentValues(evt: any) { this.onAppointmentState(evt); }
  handleAppointmentForToday(evt: any) { this.onAppointmentState(evt); }
  handleUserCount(evt: any) { this.userCount = evt; }

  // ── Helpers for template ──────────────────────────────────────────
  objectKeys(obj: Record<string, any>) { return obj ? Object.keys(obj) : []; }
  objectValues(obj: Record<string, any>) { return obj ? Object.values(obj) : []; }
  entries(obj: Record<string, any>) { return obj ? Object.entries(obj) : []; }

  formatTime(iso: string): string {
    try { return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
    catch { return iso; }
  }
}