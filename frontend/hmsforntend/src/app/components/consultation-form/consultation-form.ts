import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { ConsultationService } from '../../services/consultation.service';
import { ToastService } from '../../services/toast.service';
import { Consultation } from '../../models/consultation.model';
import { Appointment } from '../../models/appointment.model';

@Component({
  selector: 'app-consultation-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './consultation-form.html',
  styleUrl: './consultation-form.scss',
})
export class ConsultationForm implements OnInit {
  @Input() appointment: Appointment | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  consultationForm: FormGroup;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private consultationService: ConsultationService,
    private toastService: ToastService
  ) {
    this.consultationForm = this.fb.group({
      encounter: ['', [Validators.required]],
      symptoms: ['', [Validators.required]],
      diagnosis: ['', [Validators.required]],
      notes: [''],
      closeEpisode: [false], 
      prescriptions: this.fb.array([])
    });
  }

  ngOnInit() {
    if (this.appointment?.id) {
      this.consultationForm.patchValue({
        encounter: this.appointment.encounterId
      });
    }
    this.addPrescription();
  }

  get prescriptions(): FormArray {
    return this.consultationForm.get('prescriptions') as FormArray;
  }

  createPrescription(): FormGroup {
    return this.fb.group({
      medicineName: ['', [Validators.required]],
      dosage: ['', [Validators.required]],
      frequency: ['', [Validators.required]],
      duration: ['', [Validators.required]]
    });
  }

  addPrescription() {
    this.prescriptions.push(this.createPrescription());
  }

  removePrescription(index: number) {
    if (this.prescriptions.length > 1) {
      this.prescriptions.removeAt(index);
    }
  }

  onSubmit() {
    if (this.consultationForm.valid) {
      this.isSubmitting = true;
      const consultationData: Consultation = {
        ...this.consultationForm.value,
        patient: this.appointment?.patientId,
        doctor: this.appointment?.doctorId
      }

      this.consultationService.create(consultationData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.toastService.success('Consultation saved successfully!');
          this.saved.emit(response);
        },
        error: (error) => {
          this.isSubmitting = false;
          const errorMsg = error.error?.message || 'Failed to save consultation';
          this.toastService.error(errorMsg);
        }
      });
    }
  }

  onClose() {
    this.close.emit();
  }
}
