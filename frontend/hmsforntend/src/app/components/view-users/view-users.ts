import { ChangeDetectorRef, Component, OnInit, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { ToastService } from '../../services/toast.service';
import { AuthService } from '../../services/auth';
import { User } from '../../models/users.model';

@Component({
  selector: 'app-view-users',
  imports: [CommonModule, FormsModule],
  templateUrl: './view-users.html',
  styleUrl: './view-users.scss',
})
export class ViewUsers implements OnInit {
  @Output() edit = new EventEmitter<User>();

  users: User[] = [];
  isLoading = true;
  isSuperAdmin = false;

  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private userService: UserService,
    private toastService: ToastService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.isSuperAdmin = this.authService.getRole() === 'superadmin';
    this.loadUsers();
  }

  // Load users with pagination
  loadUsers() {
    this.isLoading = true;
    if (this.isSuperAdmin) {
      this.userService.getAll(this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.users = response.data.content;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
          this.isLoading = false;
          this.cdRef.detectChanges();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoading = false;
          this.cdRef.detectChanges();
        }
      });
    }
    else{
      this.userService.getAllExceptSuperAdmin(this.currentPage, this.pageSize).subscribe({
        next: (response) => {
          this.users = response.data.content;
          this.totalPages = response.data.totalPages;
          this.totalElements = response.data.totalElements;
          this.isLoading = false;
          this.cdRef.detectChanges();
        },
        error: (error) => {
          console.error('Error loading users:', error);
          this.isLoading = false;
          this.cdRef.detectChanges();
        }
      });

    }
  }

  goToPage(page: number) {
    this.currentPage = page;
    this.loadUsers();
  }

  nextPage() {
    if (this.currentPage < this.totalPages - 1) {
      this.currentPage++;
      this.loadUsers();
    }
  }

  previousPage() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.loadUsers();
    }
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i);
  }

  refresh() {
    this.loadUsers();
  }

  deleteUser(id: number) {
    if (confirm('Are you sure you want to delete this user?')) {
      this.userService.delete(id).subscribe({
        next: () => {
          this.toastService.success('User deleted successfully!');
          this.loadUsers();
        },
        error: (error) => {
          const errorMessage = error.error?.message || 'Failed to delete user. Please try again.';
          this.toastService.error(errorMessage);
        }
      });
    }
  }

  editUser(user: User) {
    this.edit.emit(user);
  }

  onPageSizeChange() {
    this.currentPage = 0;
    this.loadUsers();
  }
}
