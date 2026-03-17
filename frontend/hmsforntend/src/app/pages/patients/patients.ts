import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ViewPatients } from '../../components/view-patients/view-patients';
import { PatientForm } from '../../components/patient-form/patient-form';
import { AppointmentForm } from '../../components/appointment-form/appointment-form';
import { Patient } from '../../models/patient.model';
import { AuthService } from '../../services/auth';

@Component({
  selector: 'app-patients',
  imports: [CommonModule, ViewPatients, PatientForm, AppointmentForm],
  templateUrl: './patients.html',
  styleUrl: './patients.scss',
})
export class Patients implements OnInit {
  @ViewChild(ViewPatients) viewPatients!: ViewPatients;
  
  showModal = false;
  showAppointmentModal = false;
  selectedPatient: Patient | null = null;
  isNurse = false;


  constructor(
    private authService: AuthService
  ) {}
  ngOnInit() {
    this.isNurse = this.authService.getRole() === 'nurse';
  }

  openAddModal() {
    this.selectedPatient = null;
    this.showModal = true;
  }

  openEditModal(patient: Patient) {
    this.selectedPatient = patient;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.selectedPatient = null;
  }

  onPatientSaved() {
    this.closeModal();
    this.viewPatients.refresh();
  }

  openAppointmentModal(patient: Patient) {
    this.selectedPatient = patient;
    this.showAppointmentModal = true;
  }

  closeAppointmentModal() {
    this.showAppointmentModal = false;
    this.selectedPatient = null;
  }

  onAppointmentSaved() {
    this.closeAppointmentModal();
  }
}
