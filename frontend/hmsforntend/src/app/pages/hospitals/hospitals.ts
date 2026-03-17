import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HospitalForm } from '../../components/hospital-form/hospital-form';
import { ViewHospitals } from '../../components/view-hospitals/view-hospitals';
import { Hospital } from '../../models/hospital.model';

@Component({
  selector: 'app-hospitals',
  imports: [CommonModule, HospitalForm, ViewHospitals],
  templateUrl: './hospitals.html',
  styleUrl: './hospitals.scss',
})
export class Hospitals {
  @ViewChild(ViewHospitals) viewHospitalsComponent!: ViewHospitals;
  
  showModal = false;
  editingHospital: Hospital | null = null;

  openAddHospital() {
    this.editingHospital = null;
    this.showModal = true;
  }

  onEditHospital(hospital: Hospital) {
    this.editingHospital = hospital;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.editingHospital = null;
  }

  onHospitalSaved() {
    this.showModal = false;
    this.editingHospital = null;
    this.viewHospitalsComponent.refresh();
  }
}
