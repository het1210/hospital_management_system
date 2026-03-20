// ══════════════════════════════════════════════════════════════════════════
// FILE: lab-booking.ts
// ══════════════════════════════════════════════════════════════════════════
// src/app/pages/labs/lab-booking/lab-booking.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LabService } from '../../../services/lab.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-lab-booking',
  imports: [CommonModule, FormsModule],
  templateUrl: './lab-booking.html',
  styleUrl: './lab-booking.scss',
})
export class LabBooking implements OnInit {

  orderId       = 0;
  isSubmitting  = false;
  isLoading     = true;
  order: any    = null;

  // ── Form fields ───────────────────────────────────────────────────────────
  appointmentDate  = '';
  startTime        = '09:00';
  endTime          = '09:30';
  labTechnicianId  = '';

  get minDate(): string { return new Date().toISOString().split('T')[0]; }

  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private labService:   LabService,
    private toastService: ToastService,
    private cdRef:        ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.orderId = Number(this.route.snapshot.paramMap.get('id'));
    this.labService.getLabOrderById(this.orderId).subscribe({
      next: (r: any) => { this.order = r.data; this.isLoading = false; this.cdRef.detectChanges(); console.log(this.order);
      },
      error: () => { this.toastService.error('Could not load order'); this.isLoading = false; },
    });
  }

  onSubmit() {
    if (!this.appointmentDate || !this.startTime || !this.endTime) {
      this.toastService.error('Please fill all required fields.');
      return;
    }

    this.isSubmitting = true;
    const payload = {
      appointmentStart: `${this.appointmentDate}T${this.startTime}:00`,
      appointmentEnd:   `${this.appointmentDate}T${this.endTime}:00`,
      labTechnicianId:  this.labTechnicianId ? Number(this.labTechnicianId) : undefined,
    };

    this.labService.bookLabAppointment(this.orderId, payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success('Lab appointment booked! Status updated to BOOKED.');
        this.router.navigate(['/lab-orders']);
      },
      error: (e) => {
        this.isSubmitting = false;
        this.toastService.error(e.error?.message || 'Booking failed. Please try again.');
      },
    });
  }

  goBack() { this.router.navigate(['/lab-orders']); }
}