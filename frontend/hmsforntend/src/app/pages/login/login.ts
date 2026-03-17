import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth';
import { ToastService } from '../../services/toast.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  loginForm: FormGroup;
  showPassword = false;
  errorMessage = '';
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      userName: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(1)]]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';
      const { userName, password } = this.loginForm.value;
      
      this.authService.login(userName, password).subscribe({
        next: () => {
          this.isLoading = false;
          this.toastService.success('Login successful! Welcome back.', 5000);
        },
        error: (err) => {
          this.isLoading = false;
          const errorMsg = err.error?.message || 'Login failed. Please check your credentials.';
          this.errorMessage = errorMsg;
          this.toastService.error(errorMsg, 5000);
          this.loginForm.reset();
        }
      });
    }
  }
}