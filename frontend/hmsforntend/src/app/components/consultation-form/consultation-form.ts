// src/app/components/consultation-form/consultation-form.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ConsultationService } from '../../services/consultation.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth';
import { Consultation } from '../../models/consultation.model';
import { Appointment } from '../../models/appointment.model';
import { LAB_TEST_CATALOGUE, LabTestItem } from '../../models/lab.model';

@Component({
  selector: 'app-consultation-form',
  imports: [CommonModule, ReactiveFormsModule,FormsModule],
  templateUrl: './consultation-form.html',
  styleUrl: './consultation-form.scss',
})
export class ConsultationForm implements OnInit {

  @Input() appointment: Appointment | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  consultationForm!: FormGroup;
  isSubmitting = false;

  // ── Lab section state ──────────────────────────────────────────────────────
  readonly labTestCatalogue = LAB_TEST_CATALOGUE;
  selectedTests: LabTestItem[] = [];
  labSearchQuery = '';

  get filteredTests(): LabTestItem[] {
    if (!this.labSearchQuery.trim()) return this.labTestCatalogue;
    const q = this.labSearchQuery.toLowerCase();
    return this.labTestCatalogue.filter(t =>
      t.testName.toLowerCase().includes(q) || (t.testCode?.toLowerCase().includes(q) ?? false));
  }

  isTestSelected(test: LabTestItem): boolean {
    return this.selectedTests.some(t => t.testCode === test.testCode);
  }

  toggleTest(test: LabTestItem): void {
    if (this.isTestSelected(test)) {
      this.selectedTests = this.selectedTests.filter(t => t.testCode !== test.testCode);
    } else {
      this.selectedTests = [...this.selectedTests, test];
    }
  }

  removeTest(test: LabTestItem): void {
    this.selectedTests = this.selectedTests.filter(t => t.testCode !== test.testCode);
  }

  get raiseLabOrder(): boolean {
    return this.consultationForm?.get('raiseLabOrder')?.value ?? false;
  }

  // ──────────────────────────────────────────────────────────────────────────
  constructor(
    private fb: FormBuilder,
    private consultationService: ConsultationService,
    private toastService: ToastService,
    private authService: AuthService,
  ) {}

  ngOnInit() {
    this.consultationForm = this.fb.group({
      encounter:    ['', Validators.required],
      symptoms:     ['', Validators.required],
      diagnosis:    ['', Validators.required],
      notes:        [''],
      closeEpisode: [false],
      prescriptions: this.fb.array([]),
      // ── Lab fields ────────────────────────────────────────────────────────
      raiseLabOrder: [false],
      labPriority:   ['NORMAL'],
      labNotes:      [''],
    });

    if (this.appointment?.encounterId) {
      this.consultationForm.patchValue({ encounter: this.appointment.encounterId });
    }

    this.addPrescription();
  }

  // ── Prescription helpers ──────────────────────────────────────────────────
  get prescriptions(): FormArray {
    return this.consultationForm.get('prescriptions') as FormArray;
  }

  createPrescription(): FormGroup {
    return this.fb.group({
      medicineName: ['', Validators.required],
      dosage:       ['', Validators.required],
      frequency:    ['', Validators.required],
      duration:     ['', Validators.required],
    });
  }

  addPrescription()           { this.prescriptions.push(this.createPrescription()); }
  removePrescription(i: number) { if (this.prescriptions.length > 1) this.prescriptions.removeAt(i); }

  // ── Submit ────────────────────────────────────────────────────────────────
  onSubmit() {
    if (this.consultationForm.invalid) {
      this.consultationForm.markAllAsTouched();
      return;
    }

    // Lab validation: if lab order raised, at least one test must be selected
    if (this.raiseLabOrder && this.selectedTests.length === 0) {
      this.toastService.error('Please select at least one lab test.');
      return;
    }

    this.isSubmitting = true;
    const fv = this.consultationForm.value;

    const payload: any = {
      encounter:    fv.encounter,
      symptoms:     fv.symptoms,
      diagnosis:    fv.diagnosis,
      notes:        fv.notes,
      closeEpisode: fv.closeEpisode,
      patient:      this.appointment?.patientId,
      doctor:       this.appointment?.doctorId,
      prescriptions: fv.prescriptions,
      // ── Lab fields ────────────────────────────────────────────────────────
      raiseLabOrder: fv.raiseLabOrder,
      labPriority:   fv.labPriority,
      labNotes:      fv.labNotes,
      labTests:      this.selectedTests,
      hospitalId:    parseInt(localStorage.getItem('hospital_id') || '0'),
    };

    this.consultationService.create(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        this.toastService.success(
          fv.raiseLabOrder
            ? 'Consultation saved & Lab order raised successfully!'
            : 'Consultation saved successfully!'
        );
        this.saved.emit(response);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.toastService.error(err.error?.message || 'Failed to save consultation');
      },
    });
  }

  onClose() { this.close.emit(); }
}