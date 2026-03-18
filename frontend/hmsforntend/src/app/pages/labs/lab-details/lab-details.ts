// src/app/pages/labs/lab-details/lab-details.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
// FIX: FormsModule required because the template uses [(ngModel)] for result forms
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LabService } from '../../../services/lab.service';
import { ToastService } from '../../../services/toast.service';
import { AuthService } from '../../../services/auth';
import {
  LabOrder, LabOrderTestDto, TestResultRequest,
  STATUS_LABELS, STATUS_COLORS, LabOrderStatus,
} from '../../../models/lab.model';
import { LabTestsCompletedPipe } from '../../../pipes/lab-tests-completed.pipe';

interface ResultForm {
  testId:         number;
  testName:       string;
  resultValue:    string;
  unit:           string;
  referenceRange: string;
  remarks:        string;
}

const STATUS_STEPS: LabOrderStatus[] = [
  'ORDERED', 'BOOKED', 'SAMPLE_COLLECTED', 'IN_PROGRESS', 'COMPLETED',
];

@Component({
  selector: 'app-lab-details',
  // FIX: FormsModule added
  imports: [CommonModule, FormsModule, LabTestsCompletedPipe],
  templateUrl: './lab-details.html',
  styleUrl: './lab-details.scss',
})
export class LabDetails implements OnInit {

  order: LabOrder | null = null;
  isLoading    = true;
  userRole     = '';
  isSubmitting = false;

  resultForms: ResultForm[] = [];
  reportSummary  = '';
  showReportForm = false;

  readonly STATUS_LABELS = STATUS_LABELS;
  readonly STATUS_COLORS = STATUS_COLORS;

  constructor(
    private route:        ActivatedRoute,
    private router:       Router,
    private labService:   LabService,
    private toastService: ToastService,
    private authService:  AuthService,
    private cdRef:        ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.userRole = this.authService.getRole() || '';
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.loadOrder(id);
  }

  loadOrder(id: number) {
    this.isLoading = true;
    this.labService.getLabOrderById(id).subscribe({
      next: (r: any) => {
        this.order     = r.data;
        this.isLoading = false;
        this.buildResultForms();
        this.cdRef.detectChanges();
      },
      error: () => {
        this.toastService.error('Failed to load lab order');
        this.isLoading = false;
      },
    });
  }

  buildResultForms() {
    if (!this.order) return;
    this.resultForms = this.order.tests.map(t => ({
      testId:         t.id,
      testName:       t.testName,
      resultValue:    t.resultValue || '',
      unit:           t.unit || '',
      referenceRange: t.referenceRange || '',
      remarks:        t.remarks || '',
    }));
  }

  submitResults() {
    if (!this.order) return;

    const incomplete = this.resultForms.filter(r => !r.resultValue.trim());
    if (incomplete.length > 0) {
      this.toastService.error(`Please enter results for all ${incomplete.length} pending test(s).`);
      return;
    }

    this.isSubmitting = true;
    const payload = {
      results: this.resultForms.map(r => ({
        testId:         r.testId,
        resultValue:    r.resultValue,
        unit:           r.unit,
        referenceRange: r.referenceRange,
        remarks:        r.remarks,
      } as TestResultRequest)),
    };

    this.labService.enterResults(this.order.id, payload).subscribe({
      next: (r: any) => {
        this.order        = r.data;
        this.isSubmitting = false;
        this.toastService.success('Results saved successfully!');
        this.buildResultForms();
        this.cdRef.detectChanges();
      },
      error: (e) => {
        this.isSubmitting = false;
        this.toastService.error(e.error?.message || 'Failed to save results');
      },
    });
  }

  openReportForm() { this.showReportForm = true; }

  generateReport() {
    if (!this.order) return;
    this.isSubmitting = true;
    this.labService.generateReport(this.order.id, { summary: this.reportSummary })
      .subscribe({
        next: (r: any) => {
          this.order          = r.data;
          this.isSubmitting   = false;
          this.showReportForm = false;
          this.toastService.success('Report generated! Lab order completed. ✅');
          this.cdRef.detectChanges();
        },
        error: (e) => {
          this.isSubmitting = false;
          this.toastService.error(e.error?.message || 'Failed to generate report');
        },
      });
  }

  /** True if the given step label is before the current status in the flow */
  isStepDone(step: string): boolean {
    if (!this.order) return false;
    const currentIdx = STATUS_STEPS.indexOf(this.order.status as LabOrderStatus);
    const stepIdx    = STATUS_STEPS.indexOf(step as LabOrderStatus);
    return stepIdx < currentIdx;
  }

  getStatusLabel(s: string) { return STATUS_LABELS[s as keyof typeof STATUS_LABELS] || s; }
  getStatusColor(s: string) { return STATUS_COLORS[s as keyof typeof STATUS_COLORS] || '#718096'; }

  allTestsCompleted(): boolean {
    return this.order?.tests?.every(t => t.status === 'COMPLETED') ?? false;
  }

  canSubmitResults(): boolean {
    return this.order?.status === 'IN_PROGRESS' && this.userRole === 'labtechnician';
  }

  canGenerateReport(): boolean {
    return this.order?.status === 'IN_PROGRESS'
        && this.userRole === 'labtechnician'
        && this.allTestsCompleted();
  }

  get progressPercent(): number {
    if (!this.order?.tests?.length) return 0;
    const done = this.order.tests.filter(t => t.status === 'COMPLETED').length;
    return Math.round((done / this.order.tests.length) * 100);
  }

  goBack() { this.router.navigate(['/lab-orders']); }
}