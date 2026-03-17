import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConsultationService } from '../../services/consultation.service';
import { ToastService } from '../../services/toast.service';
import { Consultation } from '../../models/consultation.model';
import { ViewConsultationDetails } from '../view-consultation-details/view-consultation-details';
import { ConsultationPdfService } from '../../services/consultation-pdf.service';
import { HospitalService } from '../../services/hospital.service';
import { AuthService } from '../../services/auth';
import { Hospital } from '../../models/hospital.model';

@Component({
  selector: 'app-view-consultations',
  imports: [CommonModule, FormsModule, ViewConsultationDetails],
  templateUrl: './view-consultations.html',
  styleUrl: './view-consultations.scss',
})
export class ViewConsultations implements OnInit {
  @Output() view = new EventEmitter<Consultation>();
  @Output() print = new EventEmitter<Consultation>();

  consultations: Consultation[] = [];
  selectedConsultation: Consultation | null = null;
  isLoading = false;
  searchType: string = 'patient';
  searchId: number | null = null;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  hospital: Hospital[] | null = null;

  constructor(
    private consultationService: ConsultationService,
    private toastService: ToastService,
    private cdRef: ChangeDetectorRef,
    private pdfService: ConsultationPdfService,
    private hospitalService: HospitalService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    // this.loadConsultations();
    const hospitalId = this.authService.getHospitalId();
    if (hospitalId) {
      this.hospitalService.getHospitalNamesExceptSuperAdmin().subscribe({
        next: (h) => (this.hospital = h.data),
        error: () => (this.hospital = null),
      });
    }
  }

  // loadConsultations() {
  //   this.isLoading = true;
  //   this.consultationService.getAll(this.currentPage, this.pageSize).subscribe({
  //     next: (response) => {
  //       this.consultations = response.data?.content || response.data || [];
  //       this.totalPages = response.data?.totalPages || 1;
  //       this.totalElements = response.data?.totalElements || this.consultations.length;
  //       this.isLoading = false;
  //       this.cdRef.detectChanges();
  //     },
  //     error: (error) => {
  //       console.error('Error loading consultations:', error);
  //       this.toastService.error('Failed to load consultations');
  //       this.isLoading = false;
  //       this.consultations = [];
  //       this.cdRef.detectChanges();
  //     }
  //   });
  // }

  searchByPatient(patientId: number) {
    this.searchType = 'patient';
    this.searchId = patientId;
    this.currentPage = 0;
    this.isLoading = true;
    this.consultationService.searchByPatient(patientId, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.consultations = response.data?.content || response.data || [];
        this.totalPages = response.data?.totalPages || 1;
        this.totalElements = response.data?.totalElements || this.consultations.length;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error searching consultations by patient:', error);
        this.toastService.error('Failed to search consultations');
        this.isLoading = false;
        this.consultations = [];
        this.cdRef.detectChanges();
      }
    });
  }

  searchByDoctor(doctorId: number) {
    this.searchType = 'doctor';
    this.searchId = doctorId;
    this.currentPage = 0;
    this.isLoading = true;
    this.consultationService.searchByDoctor(doctorId, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.consultations = response.data?.content || response.data || [];
        this.totalPages = response.data?.totalPages || 1;
        this.totalElements = response.data?.totalElements || this.consultations.length;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error searching consultations by doctor:', error);
        this.toastService.error('Failed to search consultations');
        this.isLoading = false;
        this.consultations = [];
        this.cdRef.detectChanges();
      }
    });
  }

  goToPage(page: number) {
    this.currentPage = page;
    if (this.searchId && this.searchType === 'patient') {
      this.searchByPatient(this.searchId);
    } else if (this.searchId && this.searchType === 'doctor') {
      this.searchByDoctor(this.searchId);
    } else {
      // this.loadConsultations();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      if (this.searchId && this.searchType === 'patient') {
        this.searchByPatient(this.searchId);
      } else if (this.searchId && this.searchType === 'doctor') {
        this.searchByDoctor(this.searchId);
      } else {
        // this.loadConsultations();
      }
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      if (this.searchId && this.searchType === 'patient') {
        this.searchByPatient(this.searchId);
      } else if (this.searchId && this.searchType === 'doctor') {
        this.searchByDoctor(this.searchId);
      } else {
        // this.loadConsultations();
      }
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  refresh() {
    this.searchId = null;
    this.searchType = 'patient';
    this.currentPage = 0;
    // this.loadConsultations();
  }

  viewConsultation(consultation: Consultation) {
    this.selectedConsultation = consultation;
    this.view.emit(consultation);
  }

  closeDetails() {
    this.selectedConsultation = null;
  }

  printConsultation(consultation: Consultation) {
    this.print.emit(consultation);
    this.pdfService.generateAndPreview(consultation, this.hospital);
  }

  onPageSizeChange() {
    this.currentPage = 0;
    // this.loadConsultations();
  }
}