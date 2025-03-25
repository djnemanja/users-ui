import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule, 
    CommonModule, 
    InputTextModule, 
    PasswordModule, 
    ButtonModule,
    RippleModule,
    RouterModule
  ],
})
export class LoginComponent {
  fb = inject(FormBuilder);
  authService = inject(AuthService);
  router = inject(Router);
  
  errorMessage = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.errorMessage.set(null);
    
    this.authService.login(this.form.getRawValue()).subscribe({
      next: (response) => {
        if (response && response.user) {
          this.router.navigate(['/']);
        } else {
          this.errorMessage.set('Login failed. Please check your credentials.');
        }
      },
      error: (error) => {
        this.errorMessage.set('Login failed. Please check your credentials.');
      }
    });
  }
}