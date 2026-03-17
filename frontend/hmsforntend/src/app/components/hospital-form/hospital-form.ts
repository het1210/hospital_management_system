import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HospitalService } from '../../services/hospital.service';
import { ToastService } from '../../services/toast.service';
import { Hospital } from '../../models/hospital.model';

@Component({
  selector: 'app-hospital-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './hospital-form.html',
  styleUrl: './hospital-form.scss',
})
export class HospitalForm implements OnChanges {
  @Input() hospital: Hospital | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  hospitalForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private hospitalService: HospitalService,
    private toastService: ToastService
  ) {
    this.hospitalForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: ['', [Validators.required]],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      registrationNumber: ['', [Validators.required]],
      status: ['', [Validators.required]]
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['hospital'] && this.hospital) {
      this.isEditMode = true;
      this.hospitalForm.patchValue({
        name: this.hospital.name,
        email: this.hospital.email,
        phone: this.hospital.phone,
        address: this.hospital.address,
        city: this.hospital.city,
        state: this.hospital.state,
        pincode: this.hospital.pincode,
        registrationNumber: this.hospital.registrationNumber,
        status: this.hospital.status
      });
    } else {
      this.isEditMode = false;
      this.hospitalForm.reset();
    }
  }

  onSubmit() {
    if (this.hospitalForm.valid) {
      this.isSubmitting = true;
      const hospitalData: Hospital = this.hospitalForm.value;
      hospitalData.id = this.hospital?.id; // Include ID for update operations
      if (this.isEditMode && this.hospital?.id) {
        this.hospitalService.update(this.hospital.id, hospitalData).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.toastService.success('Hospital updated successfully!');
            this.hospitalForm.reset();
            this.saved.emit(response);
          },
          error: (error) => {
            this.isSubmitting = false;
            const errorMessage = error.error?.message || 'Failed to update hospital. Please try again.';
            this.toastService.error(errorMessage);
          }
        });
      } else {
        this.hospitalService.create(hospitalData).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.toastService.success('Hospital added successfully!');
            this.hospitalForm.reset();
            this.saved.emit(response);
          },
          error: (error) => {
            this.isSubmitting = false;
            const errorMessage = error.error?.message || 'Failed to add hospital. Please try again.';
            this.toastService.error(errorMessage);
          }
        });
      }
    }
  }


  

  onClose() {
    this.close.emit();
  }
}
