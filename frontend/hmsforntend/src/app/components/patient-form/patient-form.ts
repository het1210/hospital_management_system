import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { PatientService } from '../../services/patient.service';
import { HospitalService } from '../../services/hospital.service';
import { ToastService } from '../../services/toast.service';
import { Patient } from '../../models/patient.model';
import { Hospital } from '../../models/hospital.model';

@Component({
  selector: 'app-patient-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './patient-form.html',
  styleUrl: './patient-form.scss',
})
export class PatientForm implements OnChanges {
  @Input() patient: Patient | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  patientForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  hospitals: Hospital[] = [];
  createdBy :Number | null =  localStorage.getItem('user_id') ? Number(localStorage.getItem('user_id')) : null;

  constructor(
    private fb: FormBuilder,
    private patientService: PatientService,
    private hospitalService: HospitalService,
    private toastService: ToastService
  ) {
    
    
    this.patientForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      gender: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      state: [''],
      pincode: ['', [Validators.required, Validators.pattern(/^[0-9]{6}$/)]],
      adhaarNumber: ['', [Validators.pattern(/^[0-9]{12}$/)]],
      hospitalId: [[], [Validators.required]]
    });
    this.loadHospitalNames();
  }

  loadHospitalNames() {
    const role = localStorage.getItem('user_role');
    if (role === 'superadmin') {
      this.hospitalService.getHospitalNames().subscribe({
        next: (response) => this.hospitals = response.data,
        error: (error) => console.error('Error loading hospitals:', error)
      });
    } else {
      this.hospitalService.getHospitalNamesExceptSuperAdmin().subscribe({
        next: (response) => this.hospitals = response.data,
        error: (error) => console.error('Error loading hospitals:', error)
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['patient'] && this.patient) {
      this.isEditMode = true;
      this.patientForm.patchValue({
        firstName: this.patient.firstName,
        lastName: this.patient.lastName,
        email: this.patient.email,
        phone: this.patient.phone,
        gender: this.patient.gender,
        dateOfBirth: this.patient.dateOfBirth,
        address: this.patient.address,
        city: this.patient.city,
        state: this.patient.state,
        pincode: this.patient.pincode,
        adhaarNumber: this.patient.adhaarNumber,
        hospitalId: this.patient.hospitalId || []
      });
    } else {
      this.isEditMode = false;
      this.patientForm.reset();
      this.patientForm.patchValue({ hospitalId: [] });
    }
  }

  onSubmit() {
    
    
    if (this.patientForm.valid) {
      this.isSubmitting = true;
      const formValue = this.patientForm.value;
    
      
      if (this.isEditMode && this.patient?.id) {
        const patientData: Patient = {
        ...formValue,
        patientIdentifier: this.patient.patientIdentifier,
        updatedBy: this.createdBy
      };
        
        console.log('Updating patient with data:', patientData);   
        this.patientService.update(this.patient.id, patientData).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.toastService.success('Patient updated successfully!', 30000);
            this.patientForm.reset();
            this.saved.emit(response);
          },
          error: (error) => {
            this.isSubmitting = false;
            const errorMessage = error.error?.message || 'Failed to update patient. Please try again.';
            this.toastService.error(errorMessage, 30000);
          }
        });
      } else {
        const patientData: Patient = {
        ...formValue,
        createdBy: this.createdBy,
        updatedBy: this.createdBy
      };
       console.log('Creating patient with data:', patientData);       
        this.patientService.create(patientData).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.toastService.success('Patient added successfully!', 30000);
            this.patientForm.reset();
            this.saved.emit(response);
          },
          error: (error) => {
            this.isSubmitting = false;
            const errorMessage = error.error?.message || 'Failed to add patient. Please try again.';
            this.toastService.error(errorMessage, 30000);
          }
        });
      }
    }
  }

  onClose() {
    this.close.emit();
  }
}
