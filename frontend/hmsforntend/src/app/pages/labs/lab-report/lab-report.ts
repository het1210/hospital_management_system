// ══════════════════════════════════════════════════════════════════════════
// FILE: lab-report.ts
// src/app/pages/labs/lab-report/lab-report.ts
// ══════════════════════════════════════════════════════════════════════════
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LabService } from '../../../services/lab.service';
import { ToastService } from '../../../services/toast.service';
import { LabOrder, LabOrderTestDto } from '../../../models/lab.model';

@Component({
  selector: 'app-lab-report',
  imports: [CommonModule],
  templateUrl: './lab-report.html',
  styleUrl: './lab-report.scss',
  providers: [DatePipe],
})
export class LabReport implements OnInit {

  order: LabOrder | null = null;
  isLoading = true;
  today     = new Date();

  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private labService:   LabService,
    private toastService: ToastService,
    private cdRef:        ChangeDetectorRef,
    private datePipe:     DatePipe,
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.labService.getLabOrderById(id).subscribe({
      next: (r: any) => {
        this.order     = r.data;
        this.isLoading = false;
        this.cdRef.detectChanges();
      },
      error: () => { this.toastService.error('Could not load report'); this.isLoading = false; },
    });
  }

  printReport() {
    window.print();
  }

  goBack() {
    this.router.navigate(['/lab-orders', this.order?.id]);
  }

  isAbnormal(test: LabOrderTestDto): boolean {
    // Simple heuristic: if referenceRange contains a range like "11.5-16.5"
    // compare resultValue numerically
    if (!test.resultValue || !test.referenceRange) return false;
    const rangeMatch = test.referenceRange.match(/^(\d+\.?\d*)[–\-](\d+\.?\d*)$/);
    if (!rangeMatch) return false;
    const val = parseFloat(test.resultValue);
    const low = parseFloat(rangeMatch[1]);
    const high = parseFloat(rangeMatch[2]);
    return !isNaN(val) && (val < low || val > high);
  }
}