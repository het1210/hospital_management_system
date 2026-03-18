// ══════════════════════════════════════════════════════════════════════════
// FILE: sample-collection.ts
// src/app/pages/labs/sample-collection/sample-collection.ts
// ══════════════════════════════════════════════════════════════════════════
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LabService } from '../../../services/lab.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-sample-collection',
  imports: [CommonModule, FormsModule],
  templateUrl: './sample-collection.html',
  styleUrl: './sample-collection.scss',
})
export class SampleCollection implements OnInit {

  orderId      = 0;
  order: any   = null;
  isLoading    = true;
  isSubmitting = false;

  // ── Form ──────────────────────────────────────────────────────────────────
  sampleType  = '';
  sampleNotes = '';

  readonly sampleTypes = [
    'Blood (Venous)', 'Blood (Capillary)', 'Urine (Spot)',
    'Urine (24hr)', 'Stool', 'Sputum', 'Swab (Throat)',
    'Swab (Nasal)', 'Swab (Wound)', 'CSF', 'Pleural Fluid',
    'Other',
  ];

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
      next: (r: any) => { this.order = r.data; this.isLoading = false; this.cdRef.detectChanges(); },
      error: () => { this.toastService.error('Could not load order'); this.isLoading = false; },
    });
  }

  onSubmit() {
    if (!this.sampleType) {
      this.toastService.error('Please select a sample type.');
      return;
    }

    this.isSubmitting = true;
    this.labService.collectSample(this.orderId, {
      sampleType:  this.sampleType,
      sampleNotes: this.sampleNotes,
    }).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.toastService.success('Sample collected! Order updated to SAMPLE_COLLECTED.');
        this.router.navigate(['/lab-orders', this.orderId]);
      },
      error: (e) => {
        this.isSubmitting = false;
        this.toastService.error(e.error?.message || 'Sample collection failed.');
      },
    });
  }

  goBack() { this.router.navigate(['/lab-orders', this.orderId]); }
}