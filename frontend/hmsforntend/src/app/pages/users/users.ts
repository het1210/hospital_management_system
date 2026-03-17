import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserForm } from '../../components/user-form/user-form';
import { ViewUsers } from '../../components/view-users/view-users';
import { User } from '../../models/users.model';

@Component({
  selector: 'app-users',
  imports: [CommonModule, UserForm, ViewUsers],
  templateUrl: './users.html',
  styleUrl: './users.scss',
})
export class Users {
  @ViewChild(ViewUsers) viewUsersComponent!: ViewUsers;
  
  showModal = false;
  editingUser: User | null = null;

  openAddUser() {
    this.editingUser = null;
    this.showModal = true;
  }

  onEditUser(user: User) {
    this.editingUser = user;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingUser = null;
  }

  onUserSaved() {
    this.showModal = false;
    this.editingUser = null;
    this.viewUsersComponent.refresh();
  }
}
