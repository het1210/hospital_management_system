import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth';
import { Patient } from '../../models/patient.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-view-patients',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-patients.html',
  styleUrl: './view-patients.scss',
})
export class ViewPatients implements OnInit {
  @Output() edit = new EventEmitter<Patient>();
  @Output() addAppointment = new EventEmitter<Patient>();

  patients: Patient[] = [];
  isLoading = true;
  isSuperAdmin = false;
  isNurse = false;
  searchQuery = '';

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private patientService: PatientService,
    private toastService: ToastService,
    private authService: AuthService,
    private router:Router,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isSuperAdmin = this.authService.getRole() === 'superadmin';
    this.isNurse = this.authService.getRole() === 'nurse';
    this.loadPatients();
  }

  loadPatients() {
    this.isLoading = true;
    const request = this.searchQuery 
      ? this.patientService.search(this.searchQuery, this.currentPage, this.pageSize)
      : this.patientService.getAll(this.currentPage, this.pageSize);

    request.subscribe({
      next: (response) => {
        this.patients = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalElements = response.data.totalElements;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error loading patients:', error);
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadPatients();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadPatients();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadPatients();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  refresh() {
    this.loadPatients();
  }

  deletePatient(id: number) {
    if (confirm('Are you sure you want to delete this patient?')) {
      this.patientService.delete(id).subscribe({
        next: () => {
          this.toastService.success('Patient deleted successfully!', 30000);
          this.loadPatients();
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to delete patient. Please try again.';
          this.toastService.error(errorMessage, 30000);
        }
      });
    }
  }

  editPatient(patient: Patient) {
    this.edit.emit(patient);
  }

  generateQrCode(patient : Patient){
    console.log(patient);
    const data = encodeURIComponent(JSON.stringify(patient));
    // window.open(`/qr-print?data=${data}`, `_blank`);
    this.router.navigate(['/qr-print'], { queryParams: { data } });
    
  }


  bookAppointment(patient: Patient) {
    this.addAppointment.emit(patient);
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadPatients();
  }

  onSearch() {
    this.currentPage = 0;
    this.loadPatients();
  }

  onClearSearch() {
    this.searchQuery = '';
    this.currentPage = 0;
    this.loadPatients();
  }
}
