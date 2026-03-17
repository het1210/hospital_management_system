import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { RoleService } from '../../services/role.service';
import { HospitalService } from '../../services/hospital.service';
import { ToastService } from '../../services/toast.service';
import { User } from '../../models/users.model';
import { Hospital } from '../../models/hospital.model';

@Component({
  selector: 'app-user-form',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.html',
  styleUrl: './user-form.scss',
})
export class UserForm implements OnChanges {
  @Input() user: User | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  userForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  roles: { id: number; name: string }[] = [];
  hospitals: Hospital[] = [];

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private roleService: RoleService,
    private hospitalService: HospitalService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      gender: ['', [Validators.required]],
      dateOfBirth: ['', [Validators.required]],
      hospitalId: ['', [Validators.required]],
      status: [{ value: 'INACTIVE', disabled: true }],
      roles: this.fb.array([], [Validators.required])
    });
    this.loadRoles();
    this.loadHospitalNames();
  }


  // Load roles from the server and initialize the form array
  loadRoles() {
    this.roleService.getAll().subscribe({
      next: (response) => {
        this.roles = Object.entries(response.data as Record<number, string>)
        .map(([id, name]) => ({
          id: Number(id),
          name
        }));
        this.initializeRoleCheckboxes();
        if (this.isEditMode && this.user) {
          this.setRoleCheckboxes(this.user.roles);
        }
      },
      error: (error) => {
        console.error('Error loading roles:', error);
      }
    });
  }


  // Load hospital names from the server and populate the dropdown
  loadHospitalNames() {
    if(localStorage.getItem('user_role') === 'superadmin') {
      this.hospitalService.getHospitalNames().subscribe({
        next: (response) => {
          this.hospitals = response.data;
          console.log('Loaded hospitals:', this.hospitals);
        },
        error: (error) => {
          console.error('Error loading hospital names:', error);
        }
      });
  } else {
    this.hospitalService.getHospitalNamesExceptSuperAdmin().subscribe({
      next: (response) => {
        this.hospitals = response.data;
        console.log('Loaded hospitals:', this.hospitals);
      },
      error: (error) => {
        console.error('Error loading hospital names:', error);
      }
    });
  }
  }

  initializeRoleCheckboxes() {
    this.rolesFormArray.clear();
    this.roles.forEach(() => {
      this.rolesFormArray.push(this.fb.control(false));
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['user'] && this.user) {
      this.isEditMode = true;
      const hospitalId = this.user.hospitalId || this.user.hospital?.id || '';
      this.userForm.get('status')?.enable();
      this.userForm.patchValue({
        username: this.user.username,
        email: this.user.email,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        phone: this.user.phone,
        gender: this.user.gender,
        dateOfBirth: this.user.dateOfBirth,
        hospitalId: hospitalId,
        status: this.user.status
      });
      if (this.roles.length > 0) {
        this.setRoleCheckboxes(this.user.roles);
      }
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
    } else {
      this.isEditMode = false;
      this.userForm.reset();
      this.userForm.patchValue({ status: 'INACTIVE' });
      this.userForm.get('status')?.disable();
      this.resetRoleCheckboxes();
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }

  get rolesFormArray() {
    return this.userForm.get('roles') as FormArray;
  }

  setRoleCheckboxes(userRoles: number[]) {
    this.rolesFormArray.clear();
    this.roles.forEach(role => {
      this.rolesFormArray.push(this.fb.control(userRoles.includes(role.id)));
    });
  }

  resetRoleCheckboxes() {
    this.rolesFormArray.clear();
    this.roles.forEach(() => {
      this.rolesFormArray.push(this.fb.control(false));
    });
  }


  // Handle form submission for both create and update operations
  onSubmit() {
    if (this.userForm.valid) {
      this.isSubmitting = true;
      const formValue = this.userForm.value;
      const selectedRoleIds = formValue.roles
        .map((checked: boolean, index: number) => checked ? this.roles[index].id : null)
        .filter((id: number | null) => id !== null);
      
      const userData: User = {
        ...formValue,
        roles: selectedRoleIds,
        hospitalId: Number(formValue.hospitalId),
        status: this.isEditMode ? this.userForm.getRawValue().status : 'INACTIVE'
      };
      console.log(userData);
      
      if (this.isEditMode && this.user?.userId) {
        this.userService.update(this.user.userId, userData).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.toastService.success('User updated successfully!', 30000);
            this.userForm.reset();
            this.saved.emit(response);
            this.cdr.detectChanges(); // Ensure the view updates after emitting the event
          },
          error: (error) => {
            this.isSubmitting = false;
            const errorMessage = error.error?.message || 'Failed to update user. Please try again.';
            this.toastService.error(errorMessage, 30000);
            this.cdr.detectChanges(); // Ensure the view updates after showing the error message
          }
        });
      } else {        
        this.userService.create(userData).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.toastService.success('User added successfully!', 30000);
            this.userForm.reset();
            this.saved.emit(response);
            this.cdr.detectChanges(); // Ensure the view updates after emitting the event
          },
          error: (error) => {
            this.isSubmitting = false;
            const errorMessage = error.error?.message || 'Failed to add user. Please try again.';
            this.toastService.error(errorMessage, 30000);
            this.cdr.detectChanges(); // Ensure the view updates after showing the error message
          }
        });
      }
    }
  }

  onClose() {
    this.close.emit();
  }
}
