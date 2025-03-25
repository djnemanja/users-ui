import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { AuthService } from '../../services/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    PasswordModule,
    ButtonModule,
    RippleModule,
    RouterModule,
    ToastModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  messageService = inject(MessageService);
  
  errorMessage = signal<string | null>(null);
  isLoadingSig = signal<boolean>(false);

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  };

  form = this.fb.nonNullable.group({
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    address: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.errorMessage.set(null);
    this.isLoadingSig.set(true);
    
    const { confirmPassword, ...userData } = this.form.getRawValue();
    
    this.authService.register(userData).subscribe({
      next: (response) => {
        this.isLoadingSig.set(false);

        this.messageService.add({
          severity: 'success',
          summary: 'Registration Successful',
          detail: 'Your account has been created. You can now login.',
          life: 5000
        });

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 500);
      },
      error: (error) => {
        this.errorMessage.set(error.error?.message || 'Registration error. Please try again.');
        this.isLoadingSig.set(false);
      }
    });
  }
}
