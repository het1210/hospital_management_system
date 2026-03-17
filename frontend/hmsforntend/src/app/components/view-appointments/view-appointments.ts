import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { ToastService } from '../../services/toast.service';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-view-appointments',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-appointments.html',
  styleUrl: './view-appointments.scss',
})
export class ViewAppointments implements OnInit {
  @Output() edit = new EventEmitter<Appointment>();

  appointments: Appointment[] = [];
  isLoading = true;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private appointmentService: AppointmentService,
    private toastService: ToastService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.isLoading = true;
    this.appointmentService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.appointments = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalElements = response.data.totalElements;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error loading appointments:', error);
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadAppointments();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadAppointments();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadAppointments();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  refresh() {
    this.loadAppointments();
  }

  deleteAppointment(id: number) {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.appointmentService.delete(id).subscribe({
        next: () => {
          this.toastService.success('Appointment deleted successfully!');
          this.loadAppointments();
        },
        error: (error) => {
          this.toastService.error(error.error?.message || 'Failed to delete appointment');
        }
      });
    }
  }

  editAppointment(appointment: Appointment) {
    this.edit.emit(appointment);
  }

  formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadAppointments();
  }
}
