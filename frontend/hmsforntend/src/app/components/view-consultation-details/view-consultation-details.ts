import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Consultation } from '../../models/consultation.model';
import { Hospital } from '../../models/hospital.model';
import { ConsultationPdfService } from '../../services/consultation-pdf.service';
import { HospitalService } from '../../services/hospital.service';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-view-consultation-details',
  imports: [CommonModule],
  templateUrl: './view-consultation-details.html',
  styleUrl: './view-consultation-details.scss',
})
export class ViewConsultationDetails implements OnInit {
  @Input() consultation: Consultation | null = null;
  @Output() close = new EventEmitter<void>();

  today = new Date();
  hospitalArry: Hospital[] | null = null;
  hospital: Hospital | null = null;
  isPrinting = false;

  constructor(
    private pdfService: ConsultationPdfService,
    private hospitalService: HospitalService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const hospitalId = this.authService.getHospitalId();
    if (hospitalId) {
      this.hospitalService.getById(hospitalId).subscribe({
        next: (h) => (this.hospitalArry = [h]),
        error: () => (this.hospitalArry = null),
      });
    }
    this.hospital = this.hospitalArry ? this.hospitalArry[0] : null;
  }

  closeModal() {
    this.close.emit();
  }

  print() {
    if (!this.consultation) return;
    this.isPrinting = true;
    // slight delay lets the UI update before PDF generation runs
    setTimeout(() => {
      this.pdfService.generateAndPreview(this.consultation!, this.hospitalArry);
      this.isPrinting = false;
    }, 100);
  }

  onBackdropClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closeModal();
    }
  }
}
