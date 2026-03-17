import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HospitalService } from '../../services/hospital.service';
import { ToastService } from '../../services/toast.service';
import { Hospital } from '../../models/hospital.model';

@Component({
  selector: 'app-view-hospitals',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-hospitals.html',
  styleUrl: './view-hospitals.scss',
})
export class ViewHospitals implements OnInit {
  @Output() edit = new EventEmitter<Hospital>();
  
  hospitals: Hospital[] = [];
  isLoading = true;
  
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private hospitalService: HospitalService,
    private toastService: ToastService,
    private cdRef: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadHospitals();
  }

  loadHospitals() {
    this.isLoading = true;
    this.hospitalService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.hospitals = response.data.content;
        this.totalPages = response.data.totalPages;
        this.totalElements = response.data.totalElements;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: (error) => {
        console.error('Error loading hospitals:', error);
        this.isLoading = false;
        this.cdRef.detectChanges();
      }
    });
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadHospitals();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadHospitals();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadHospitals();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  refresh() {
    this.loadHospitals();
  }

  deleteHospital(id: number) {
    if (confirm('Are you sure you want to delete this hospital?')) {
      this.hospitalService.delete(id).subscribe({
        next: () => {
          this.toastService.success('Hospital deleted successfully!');
          this.loadHospitals();
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to delete hospital. Please try again.';
          this.toastService.error(errorMessage);
        }
      });
    }
  }

  editHospital(hospital: Hospital) {
    this.edit.emit(hospital);
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadHospitals();
    this.cdRef.detectChanges();
  }
}
