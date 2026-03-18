// src/app/components/sidemenu/sidemenu.ts
// UPDATED — Lab module menu items added for doctor, frontdesk, labtechnician, patient
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  isDiabled?: boolean;
}

@Component({
  selector: 'app-sidemenu',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sidemenu.html',
  styleUrl: './sidemenu.scss',
})
export class Sidemenu implements OnInit {
  isCollapsed = false;
  menuItems: MenuItem[] = [];
  userName  = '';
  userRole  = '';
  userRoles: string[] = [];
  selectedRole = '';

  constructor(private authService: AuthService, private router: Router) {}

  private roleMenus: { [key: string]: MenuItem[] } = {

    superadmin: [
      { label: 'Dashboard',   icon: 'dashboard',    route: '/dashboard' },
      { label: 'Hospitals',   icon: 'hospital',     route: '/hospitals' },
      { label: 'Users',       icon: 'users',        route: '/users' },
      { label: 'Patients',    icon: 'patients',     route: '/patients' },
      { label: 'Lab Orders',  icon: 'lab',          route: '/lab-orders' }, // NEW
      { label: 'Audit Logs',  icon: 'logs',         route: '/audit-logs' },
      { label: 'Reports',     icon: 'reports',      route: '/reports' },
      { label: 'Profile',     icon: 'profile',      route: '/profile' },
      { label: 'Logout',      icon: 'logout',       route: '/logout' },
    ],

    hospitaladmin: [
      { label: 'Dashboard',    icon: 'dashboard',    route: '/dashboard' },
      { label: 'Departments',  icon: 'departments',  route: '/departments', isDiabled: true },
      { label: 'Users',        icon: 'users',        route: '/users' },
      { label: 'Patients',     icon: 'patients',     route: '/patients' },
      { label: 'Appointments', icon: 'appointments', route: '/appointments' },
      { label: 'Lab Orders',   icon: 'lab',          route: '/lab-orders' }, // NEW
      { label: 'Billing',      icon: 'billing',      route: '/billing' },
      { label: 'Inventory',    icon: 'inventory',    route: '/inventory' },
      { label: 'Reports',      icon: 'reports',      route: '/reports' },
      { label: 'Settings',     icon: 'settings',     route: '/settings' },
      { label: 'Profile',      icon: 'profile',      route: '/profile' },
      { label: 'Logout',       icon: 'logout',       route: '/logout' },
    ],

    doctor: [
      { label: 'Dashboard',      icon: 'dashboard',    route: '/dashboard' },
      { label: 'My Appointments', icon: 'appointments', route: '/appointments' },
      { label: 'My Patients',    icon: 'patients',     route: '/patients' },
      { label: 'Consultation',   icon: 'consultation', route: '/consultations' },
      { label: 'Episodes',       icon: 'file',         route: '/episode' },
      { label: 'Lab Orders',     icon: 'lab',          route: '/lab-orders' }, // NEW (was commented out)
      { label: 'Logout',         icon: 'logout',       route: '/logout' },
    ],

    nurse: [
      { label: 'Dashboard',        icon: 'dashboard',  route: '/dashboard' },
      { label: 'Assigned Patients', icon: 'patients', route: '/patients' },
      { label: 'Vitals Entry',     icon: 'vitals',     route: '/vitals-entry' },
      { label: 'Medication',       icon: 'medication', route: '/medication' },
      { label: 'Ward Management',  icon: 'ward',       route: '/ward-management' },
      { label: 'Reports',          icon: 'reports',    route: '/reports' },
      { label: 'Profile',          icon: 'profile',    route: '/profile' },
      { label: 'Logout',           icon: 'logout',     route: '/logout' },
    ],

    frontdesk: [
      { label: 'Dashboard',    icon: 'dashboard',    route: '/dashboard' },
      { label: 'Patients',     icon: 'patients',     route: '/patients' },
      { label: 'Episode',      icon: 'file',         route: '/episode' },
      { label: 'Appointments', icon: 'appointments', route: '/appointments' },
      { label: 'Consultation', icon: 'consultation', route: '/consultations' },
      { label: 'Labs',         icon: 'lab',          route: '/lab-orders' }, // NEW
      { label: 'Billing',      icon: 'billing',      route: '/billing' },
      { label: 'Profile',      icon: 'profile',      route: '/profile' },
      { label: 'Logout',       icon: 'logout',       route: '/logout' },
    ],

    labtechnician: [
      { label: 'Dashboard',         icon: 'dashboard', route: '/dashboard' },
      { label: 'Lab Orders',        icon: 'lab',       route: '/lab-orders' }, // UPDATED (was /lab-orders, now actually wired)
      { label: 'Sample Collection', icon: 'upload',    route: '/lab-orders' }, // filter applied inside
      { label: 'Reports',           icon: 'reports',   route: '/reports' },
      { label: 'Profile',           icon: 'profile',   route: '/profile' },
      { label: 'Logout',            icon: 'logout',    route: '/logout' },
    ],

    pharmacist: [
      { label: 'Dashboard',       icon: 'dashboard',    route: '/dashboard' },
      { label: 'Prescriptions',   icon: 'prescription', route: '/prescriptions' },
      { label: 'Dispense',        icon: 'dispense',     route: '/dispense-medicine' },
      { label: 'Inventory',       icon: 'inventory',    route: '/inventory' },
      { label: 'Sales',           icon: 'sales',        route: '/sales' },
      { label: 'Profile',         icon: 'profile',      route: '/profile' },
      { label: 'Logout',          icon: 'logout',       route: '/logout' },
    ],

    patient: [
      { label: 'Dashboard',       icon: 'dashboard',    route: '/dashboard' },
      { label: 'Book Appointment', icon: 'book',        route: '/book-appointment' },
      { label: 'My Appointments', icon: 'appointments', route: '/my-appointments' },
      { label: 'Prescriptions',   icon: 'prescription', route: '/prescriptions' },
      { label: 'Lab Reports',     icon: 'lab',          route: '/lab-orders' }, // UPDATED — now routes to real lab list
      { label: 'Bills & Payments', icon: 'billing',     route: '/bills-payments' },
      { label: 'Profile',         icon: 'profile',      route: '/profile' },
      { label: 'Logout',          icon: 'logout',       route: '/logout' },
    ],
  };

  ngOnInit() {
    const role = this.authService.getRole();
    const user = localStorage.getItem('user');

    if (user) {
      const userData    = JSON.parse(user);
      this.userName     = `${userData.username}`;
      this.userRoles    = userData.roles.map((r: string) => this.mapRoleToInternal(r));
      this.selectedRole = role || this.userRoles[0];
    }

    if (role) {
      this.userRole  = this.getRoleDisplayName(role);
      this.menuItems = this.roleMenus[role] || [];
    }
  }

  getRoleDisplayName(role: string): string {
    const names: Record<string, string> = {
      superadmin:    'Super Admin',
      hospitaladmin: 'Hospital Admin',
      doctor:        'Doctor',
      nurse:         'Nurse',
      frontdesk:     'Front Desk',
      labtechnician: 'Lab Technician',
      pharmacist:    'Pharmacist',
      patient:       'Patient',
    };
    return names[role] || 'User';
  }

  mapRoleToInternal(role: string): string {
    const map: Record<string, string> = {
      ROLE_SUPER_ADMIN:    'superadmin',
      ROLE_HOSPITAL_ADMIN: 'hospitaladmin',
      ROLE_DOCTOR:         'doctor',
      ROLE_NURSE:          'nurse',
      ROLE_FRONTDESK:      'frontdesk',
      ROLE_LAB_TECHNICIAN: 'labtechnician',
      ROLE_PHARMACIST:     'pharmacist',
      ROLE_PATIENT:        'patient',
    };
    return map[role] || 'patient';
  }

  loadMenuForRole() {
    const role = this.authService.getRole();
    if (role) this.menuItems = this.roleMenus[role] || [];
  }

  onRoleChange() {
    localStorage.setItem('user_role', this.selectedRole);
    this.userRole  = this.getRoleDisplayName(this.selectedRole);
    this.menuItems = this.roleMenus[this.selectedRole] || [];
    this.router.navigate(['/dashboard']).then(() => window.location.reload());
  }

  toggleSidebar() { this.isCollapsed = !this.isCollapsed; }
  onLogout()      { this.authService.logout(); }
}