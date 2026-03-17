import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { AppointmentService } from '../../services/appointment.service';
import { ToastService } from '../../services/toast.service';
import { AppointmentForm } from '../../components/appointment-form/appointment-form';
import { ConsultationForm } from '../../components/consultation-form/consultation-form';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, FullCalendarModule, AppointmentForm, ConsultationForm],
  templateUrl: './appointments.html',
  styleUrl: './appointments.scss'
})
export class AppointmentsComponent implements OnInit {
  appointments: Appointment[] = [];
  showForm = false;
  showConsultationForm = false;
  selectedAppointment: Appointment | null = null;
  userRole: string = '';
  userId: number = 0;
  hospitalId: number = 0;
  isLoading = false;
  isCheckIn = false;
  
  // Table view
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  startDate: string = '';
  endDate: string = '';

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
    allDaySlot: false,
    eventClick: (clickInfo) => this.handleEventClick(clickInfo),
    events: []
  };

  constructor(
    private appointmentService: AppointmentService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.userRole = localStorage.getItem('user_role') || '';
    this.userId = parseInt(localStorage.getItem('user_id') || '0');
    this.hospitalId = parseInt(localStorage.getItem('hospital_id') || '0');
    this.loadAppointments();
  }

  // Load Appointments based on user role and pagination
  loadAppointments() {
    this.isLoading = true;
    if (this.userRole === 'doctor') {
      this.appointmentService.getDoctorAppointments(this.userId).subscribe({
        next: (response) => {
          this.appointments = response.data;
          this.totalElements = this.appointments.length;
          this.totalPages = 1;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastService.error('Failed to load appointments');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.appointmentService.getAll(this.currentPage, this.pageSize, this.hospitalId).subscribe({
        next: (response) => {
          this.appointments = response.data.content;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastService.error('Failed to load appointments');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  updateCalendarEvents() {
    const events = this.appointments.map(apt => ({
      id: apt.id?.toString(),
      title: apt.patientName || 'Patient',
      start: apt.appointmentStart,
      end: apt.appointmentEnd,
      backgroundColor: '#3b82f6',
      borderColor: '#2563eb',
      extendedProps: {
        appointment: apt
      }
    }));
    
    this.calendarOptions = {
      ...this.calendarOptions,
      events: events,
      eventClick: (clickInfo) => this.handleEventClick(clickInfo)
    };
    this.cdr.detectChanges();
  }

  handleEventClick(clickInfo: EventClickArg) {
    const appointment = clickInfo.event.extendedProps['appointment'] as Appointment;
    this.editAppointment(appointment);
  }

  formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateTime: string): string {
    return new Date(dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  openForm() {
    this.selectedAppointment = null;
    this.showForm = true;
  }

  editAppointment(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.showForm = true;
  }

  openConsultationForm(appointment: Appointment) {
    this.selectedAppointment = appointment;
    this.showConsultationForm = true;
    this.cdr.detectChanges();
  }

  deleteAppointment(id: number) {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.appointmentService.delete(id).subscribe({
        next: () => {
          this.toastService.success('Appointment deleted successfully');
          this.loadAppointments();
        },
        error: () => this.toastService.error('Failed to delete appointment')
      });
    }
  }

  onFormClose() {
    this.showForm = false;
    this.selectedAppointment = null;
  }

  onConsultationFormClose() {
    this.showConsultationForm = false;
    this.selectedAppointment = null;
  }

  onConsultationSaved() {
    this.showConsultationForm = false;
    this.selectedAppointment = null;
  }

  onFormSaved() {
    this.showForm = false;
    this.selectedAppointment = null;
    this.loadAppointments();
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadAppointments();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadAppointments();
    }
  }

  setToday() {
    const today = new Date();
    this.startDate = today.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
    this.filterByDateRange();
  }

  setTomorrow() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.startDate = tomorrow.toISOString().split('T')[0];
    this.endDate = tomorrow.toISOString().split('T')[0];
    this.filterByDateRange();
  }


  // Filter appointments based on selected date range
  filterByDateRange() {
    if (!this.startDate || !this.endDate) {
      this.loadAppointments();
      return;
    }
    
    this.isLoading = true;
    if (this.userRole === 'doctor') {
      this.appointmentService.getDoctorAppointments(this.userId,this.startDate,this.endDate).subscribe({
        next: (response) => {
          this.appointments = response.data;
          // const allAppointments = response.data;
          // this.appointments = allAppointments.filter((apt: Appointment) => {
          //   const aptDate = new Date(apt.appointmentStart).toISOString().split('T')[0];
          //   return aptDate >= this.startDate && aptDate <= this.endDate;
          // });
          this.totalElements = this.appointments.length;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastService.error('Failed to load appointments');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    } else {
      this.appointmentService.getAll(this.currentPage, this.pageSize, this.hospitalId, this.startDate,this.endDate).subscribe({
        next: (response) => {
          this.appointments = response.data.content;
          // const allAppointments = response.data.content;
          // this.appointments = allAppointments.filter((apt: Appointment) => {
          //   const aptDate = new Date(apt.appointmentStart).toISOString().split('T')[0];
          //   return aptDate >= this.startDate && aptDate <= this.endDate;
          // });
          this.totalElements = this.appointments.length;
          this.isLoading = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          this.toastService.error('Failed to load appointments');
          this.isLoading = false;
          this.cdr.detectChanges();
        }
      });
    }
  }

  clearDateFilter() {
    this.startDate = '';
    this.endDate = '';
    this.loadAppointments();
  }

  onStatusChange(appointment: Appointment, event: any) {
    const newStatus = event.target.value;
    const appointmentData = {
      hospitalId: appointment.hospitalId,
      patientId: appointment.patientId,
      doctorId: appointment.doctorId,
      episodeId: appointment.episodeId,
      type: appointment.type,
      status: newStatus,
      appointmentStart: appointment.appointmentStart,
      appointmentEnd: appointment.appointmentEnd
    };

    this.appointmentService.update(appointment.id!, appointmentData).subscribe({
      next: (response) => {
        this.toastService.success('Appointment status updated successfully');
        appointment.status = newStatus;
        this.appointments = [...this.appointments];
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.toastService.error('Failed to update appointment status');
        event.target.value = appointment.status;
      }
    });
  }
}
