import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { UserService } from '../../../services/user.service';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { MenuModule } from 'primeng/menu';
import { User } from '../../../types/user';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MessageService, ConfirmationService } from 'primeng/api';
import { HeaderComponent } from '../../../components/header/header.component';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule, 
    ButtonModule, 
    CardModule, 
    MenuModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    HeaderComponent,
    ConfirmDialogModule,
    ToastModule,
    DropdownModule
  ],
  providers: [ConfirmationService],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent implements OnInit {
  authService = inject(AuthService);
  userService = inject(UserService);
  messageService = inject(MessageService);
  confirmationService = inject(ConfirmationService);
  fb = inject(FormBuilder);
  
  users = signal<User[]>([]);
  
  private _editDialogVisible = signal(false);
  
  get dialogVisible(): boolean {
    return this._editDialogVisible();
  }
  
  set dialogVisible(value: boolean) {
    this._editDialogVisible.set(value);
  }
  
  selectedUser = signal<User | null>(null);
  
  roleOptions = [
    { label: 'User', value: 'user' },
    { label: 'Admin', value: 'admin' }
  ];
  
  userForm = this.fb.group({
    first_name: ['', Validators.required],
    last_name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    address: [''],
    role: ['user']
  });
  
  ngOnInit() {
    this.loadUsers();
  }
  
  loadUsers() {
    this.userService.getAllUsers().subscribe(users => {
      this.users.set(users);
    });
  }
  
  openEditDialog(user: User) {
    this.selectedUser.set(user);

    this.userForm.patchValue({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      email: user.email || '',
      address: user.address || '',
      role: user.role || 'user'
    });
    
    this.dialogVisible = true;
  }
  
  saveUser() {
    if (this.userForm.invalid || !this.selectedUser()) return;
    
    const userId = this.selectedUser()?.id;
    if (!userId) return;
    
    this.userService.updateUser(userId, this.userForm.value as Partial<User>).subscribe({
      next: (updatedUser) => {
        this.loadUsers();
        
        this.dialogVisible = false;
        
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'User has been successfully updated'
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'An error occurred while updating the user'
        });
      }
    });
  }
  
  deleteUser(userId: string) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this user?',
      accept: () => {
        this.userService.deleteUser(userId).subscribe({
          next: () => {
            this.loadUsers();
    
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'User has been successfully deleted'
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'An error occurred while deleting the user'
            });
          }
        });
      }
    });
  }
  
  logout() {
    this.authService.logout().subscribe();
  }
}
