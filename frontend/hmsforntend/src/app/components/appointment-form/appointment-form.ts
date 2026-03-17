import { Component, EventEmitter, Output, Input, OnChanges, SimpleChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppointmentService } from '../../services/appointment.service';
import { PatientService } from '../../services/patient.service';
import { UserService } from '../../services/user.service';
import { HospitalService } from '../../services/hospital.service';
import { EpisodeService } from '../../services/episode.service';
import { ToastService } from '../../services/toast.service';
import { Appointment } from '../../models/appointment.model';
import { Hospital } from '../../models/hospital.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-appointment-form',
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './appointment-form.html',
  styleUrl: './appointment-form.scss',
})
export class AppointmentForm implements OnChanges, OnDestroy {
  @Input() appointment: Appointment | null = null;
  @Input() patient: any = null;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  appointmentForm: FormGroup;
  isSubmitting = false;
  isEditMode = false;
  hospitals: Hospital[] = [];

  patientSearchText = '';
  doctorSearchText = '';
  episodeSearchText = '';
  filteredPatients: any[] = [];
  filteredDoctors: any[] = [];
  filteredEpisodes: any[] = [];
  showPatientDropdown = false;
  showDoctorDropdown = false;
  showEpisodeDropdown = false;
  isDoctorDropdownOpen = false;
  isPatientDropdownOpen = false;
  isEpisodeDropdownOpen = false;
  minDate: string;
  isPatientFieldDisabled = false;
  doctorAppointments: Appointment[] = [];
  loadingAppointments = false;

  private patientSearchSubject = new Subject<string>();
  private doctorSearchSubject = new Subject<string>();
  private episodeSearchSubject = new Subject<string>();
  selectedPatientId: number | null = null;
  selectedDoctorId: number | null = null;
  selectedEpisodeId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private userService: UserService,
    private hospitalService: HospitalService,
    private episodeService: EpisodeService,
    private toastService: ToastService,
    private cdr: ChangeDetectorRef
  ) {
    const today = new Date();
    this.minDate = today.toISOString().split('T')[0];

    this.appointmentForm = this.fb.group({
      patientId: ['', [Validators.required]],
      doctorId: ['', [Validators.required]],
      hospitalId: ['', [Validators.required]],
      episodeId: [''],
      type: ['', [Validators.required]],
      status: ['BOOKED', [Validators.required]],
      appointmentDate: ['', [Validators.required]],
      startTime: ['', [Validators.required]],
      endTime: ['', [Validators.required]],

    });

    this.loadHospitals();
    this.setupDebounce();
  }

  setupDebounce() {
    this.patientSearchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      if (query.length >= 2) {
        this.patientService.search(query, 0, 50).subscribe({
          next: (response) => {
            this.filteredPatients = response.data.content.map((p: any) => ({
              id: p.id,
              name: `${p.firstName} ${p.lastName}`,
              displayText: `${p.firstName} ${p.lastName} (ID: ${p.id})`
            }));
            this.showPatientDropdown = this.filteredPatients.length > 0;
          },
          error: (error) => console.error('Error searching patients:', error)
        });
      } else {
        this.showPatientDropdown = false;
      }
    });

    this.doctorSearchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      const hospitalId = this.appointmentForm.get('hospitalId')?.value;
      if (!hospitalId) return;

      if (query.length >= 2) {
        this.userService.search(query, hospitalId).subscribe({
          next: (response) => {
            this.filteredDoctors = response.data.map((d: any) => ({
              userId: d.userId,
              name: `Dr. ${d.firstName} ${d.lastName}`,
              displayText: `Dr. ${d.firstName} ${d.lastName} (ID: ${d.userId})`
            }));
            this.showDoctorDropdown = this.filteredDoctors.length > 0;
          },
          error: (error) => console.error('Error searching doctors:', error)
        });
      } else {
        this.showDoctorDropdown = false;
      }
    });

    this.episodeSearchSubject.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(query => {
      const patientId = this.selectedPatientId;
      const hospitalId = this.appointmentForm.get('hospitalId')?.value;
      if (!patientId || !hospitalId) return;

      if (query.length >= 2) {
        this.loadEpisodesForPatient();
      }
    });
  }

  loadHospitals() {
    const role = localStorage.getItem('user_role');
    if (role === 'superadmin') {
      this.hospitalService.getHospitalNames().subscribe({
        next: (response) => this.hospitals = response.data,
        error: (error) => console.error('Error loading hospitals:', error)
      })
    } else {
      this.hospitalService.getHospitalNamesExceptSuperAdmin().subscribe({
        next: (response) => this.hospitals = response.data,
        error: (error) => console.error('Error loading hospitals:', error)
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['appointment'] && this.appointment) {
      this.isEditMode = true;
      const startDate = new Date(this.appointment.appointmentStart);
      const endDate = new Date(this.appointment.appointmentEnd);
      console.log(this.appointment);
      this.appointmentForm.patchValue({
        patientId: this.appointment.patientId,
        doctorId: this.appointment.doctorId,
        hospitalId: this.appointment.hospitalId,
        episodeId: this.appointment.episodeId,
        type: this.appointment.type,
        status: this.appointment.status,
        appointmentDate: startDate.toISOString().split('T')[0],
        startTime: startDate.toTimeString().slice(0, 5),
        endTime: endDate.toTimeString().slice(0, 5)
      });
      this.patientSearchText = this.appointment.patientName || '';
      this.doctorSearchText = this.appointment.doctorName || '';
      this.episodeSearchText = this.appointment.episodeName || '';
      this.selectedPatientId = this.appointment.patientId;
      this.selectedDoctorId = this.appointment.doctorId;
      this.selectedEpisodeId = this.appointment.episodeId || null;
    } else if (changes['patient'] && this.patient) {
      this.patientSearchText = `${this.patient.firstName} ${this.patient.lastName}`;
      this.selectedPatientId = this.patient.id || this.patient.patientId;
      this.isPatientFieldDisabled = true;
      this.appointmentForm.patchValue({
        patientId: this.selectedPatientId,
        hospitalId: this.patient.hospitalId
      });
      this.loadEpisodesForPatient();
    } else {
      this.isEditMode = false;
      this.appointmentForm.reset();
      this.patientSearchText = '';
      this.doctorSearchText = '';
      this.episodeSearchText = '';
      this.selectedPatientId = null;
      this.selectedDoctorId = null;
      this.selectedEpisodeId = null;
      this.isPatientFieldDisabled = false;
    }
    this.cdr.detectChanges();
  }

  onHospitalChange() {
    this.doctorSearchText = '';
    this.appointmentForm.patchValue({ doctorId: '' });
    this.filteredDoctors = [];
    this.selectedDoctorId = null;
    this.isDoctorDropdownOpen = false;
  }

  togglePatientDropdown() {
    if (this.isPatientFieldDisabled) return;
    this.isPatientDropdownOpen = !this.isPatientDropdownOpen;
    this.showPatientDropdown = this.isPatientDropdownOpen;
    if (this.isPatientDropdownOpen && this.filteredPatients.length === 0) {
      this.loadAllPatients();
    }
  }

  loadAllPatients() {
    this.patientService.search('', 0, 50).subscribe({
      next: (response) => {
        this.filteredPatients = response.data.content.map((p: any) => ({
          id: p.id,
          adhaarNumber: p.adhaarNumber,
          name: `${p.firstName} ${p.lastName}`,
          displayText: `${p.firstName} ${p.lastName} (ID: ${p.adhaarNumber})`
        }));
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading patients:', error)
    });
  }

  toggleDoctorDropdown() {
    const hospitalId = this.appointmentForm.get('hospitalId')?.value;
    if (!hospitalId) {
      this.toastService.error('Please select a hospital first');
      return;
    }
    this.isDoctorDropdownOpen = !this.isDoctorDropdownOpen;
    if (this.isDoctorDropdownOpen && this.filteredDoctors.length === 0) {
      this.loadAllDoctors();
    }
  }

  loadAllDoctors() {
    const hospitalId = this.appointmentForm.get('hospitalId')?.value;
    if (hospitalId) {
      this.userService.search('', hospitalId).subscribe({
        next: (response) => {
          this.filteredDoctors = response.data.map((d: any) => ({
            userId: d.userId,
            name: `Dr. ${d.firstName} ${d.lastName}`,
            displayText: `Dr. ${d.firstName} ${d.lastName} (ID: ${d.userId})`
          }));
          this.cdr.detectChanges();
        },
        error: (error) => console.error('Error loading doctors:', error)
      });
    }
  }

  toggleEpisodeDropdown() {
    if (!this.selectedPatientId) {
      this.toastService.error('Please select a patient first');
      return;
    }
    const hospitalId = this.appointmentForm.get('hospitalId')?.value;
    if (!hospitalId) {
      this.toastService.error('Please select a hospital first');
      return;
    }
    this.isEpisodeDropdownOpen = !this.isEpisodeDropdownOpen;
    if (this.isEpisodeDropdownOpen && this.filteredEpisodes.length === 0) {
      this.loadEpisodesForPatient();
    }
  }

  loadEpisodesForPatient(adhaarNumber?: String) {
    const patientId = this.selectedPatientId;
    const hospitalId = this.appointmentForm.get('hospitalId')?.value;
    // const patientAdharNumber = this.patient?.adhaarNumber;

    if (patientId && hospitalId) {
      this.episodeService.search(`${adhaarNumber}`, 0, 50).subscribe({
        next: (response) => {
          const episodes = response.data.content || response.data || [];
          this.filteredEpisodes = episodes.map((e: any) => ({
            id: e.id,
            episodeType: e.episodeType,
            displayText: `${e.episodeType} (ID: ${e.id}) - ${e.status}`
          }));
          this.cdr.detectChanges();
        },
        error: (error) => console.error('Error loading episodes:', error)
      });
    }
  }

  onPatientSearch(event: any) {
    const query = event.target.value;
    this.patientSearchText = query;
    if (this.selectedPatientId && query !== this.filteredPatients.find(p => p.id === this.selectedPatientId)?.name) {
      this.selectedPatientId = null;
      this.appointmentForm.patchValue({ patientId: '', episodeId: '' });
      this.filteredEpisodes = [];
      this.episodeSearchText = '';
      this.selectedEpisodeId = null;
    }
    this.patientSearchSubject.next(query);
  }

  onDoctorSearch(event: any) {
    const query = event.target.value;
    this.doctorSearchText = query;
    const hospitalId = this.appointmentForm.get('hospitalId')?.value;

    if (!hospitalId) {
      this.toastService.error('Please select a hospital first');
      return;
    }

    if (this.selectedDoctorId && query !== this.filteredDoctors.find(d => d.userId === this.selectedDoctorId)?.name) {
      this.selectedDoctorId = null;
      this.appointmentForm.patchValue({ doctorId: '' });
    }
    this.doctorSearchSubject.next(query);
  }

  onEpisodeSearch(event: any) {
    const query = event.target.value;
    this.episodeSearchText = query;
    if (this.selectedEpisodeId && query !== this.filteredEpisodes.find(e => e.id === this.selectedEpisodeId)?.episodeType) {
      this.selectedEpisodeId = null;
      this.appointmentForm.patchValue({ episodeId: '' });
    }
    this.episodeSearchSubject.next(query);
  }

  selectPatient(patient: any) {
    console.log(patient);

    this.patientSearchText = patient.name;
    this.selectedPatientId = patient.id;
    this.appointmentForm.patchValue({ patientId: patient.id });
    this.showPatientDropdown = false;
    this.isPatientDropdownOpen = false;
    this.loadEpisodesForPatient(patient.adhaarNumber);
  }

  selectDoctor(doctor: any) {
    this.doctorSearchText = doctor.name;
    this.selectedDoctorId = doctor.userId;
    this.appointmentForm.patchValue({ doctorId: doctor.userId });
    this.showDoctorDropdown = false;
    this.isDoctorDropdownOpen = false;
    // this.loadDoctorAppointments(doctor.userId);
  }

  selectEpisode(episode: any) {
    this.episodeSearchText = episode.episodeType;
    this.selectedEpisodeId = episode.id;
    this.appointmentForm.patchValue({ episodeId: episode.id });
    this.showEpisodeDropdown = false;
    this.isEpisodeDropdownOpen = false;
  }

  appointmentDate(event: any) {
    const formValue = this.appointmentForm.value;
    const doctorId = formValue.doctorId;
    if (doctorId) {
      this.loadDoctorAppointments(doctorId);
    }
    else {
      this.toastService.error('Please select a Doctor first');
      return;
    }
  }


  loadDoctorAppointments(doctorId: number) {
    const formValue = this.appointmentForm.value;

    const appointmentStart = `${formValue.appointmentDate}`;
    const appointmentEnd = `${formValue.appointmentDate}`;
    if (appointmentStart && appointmentEnd) {
      this.loadingAppointments = true;
      this.appointmentService.getDoctorAppointments(doctorId, appointmentEnd, appointmentStart).subscribe({
        next: (response) => {
          this.doctorAppointments = response.data;
          this.loadingAppointments = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error('Error loading doctor appointments:', error);
          this.loadingAppointments = false;
          this.cdr.detectChanges();
        }
      });
    }

  }

  formatTime(dateTime: string): string {
    return new Date(dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(dateTime: string): string {
    return new Date(dateTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  onSubmit() {
    if (!this.selectedPatientId || !this.selectedDoctorId) {
      this.toastService.error('Please select a patient and doctor from the dropdown');
      return;
    }

    if (this.appointmentForm.valid) {
      this.isSubmitting = true;
      const formValue = this.appointmentForm.value;

      const appointmentStart = `${formValue.appointmentDate}T${formValue.startTime}:00`;
      const appointmentEnd = `${formValue.appointmentDate}T${formValue.endTime}:00`;

      const appointmentData: any = {
        hospitalId: formValue.hospitalId,
        patientId: formValue.patientId,
        doctorId: formValue.doctorId,
        episodeId: formValue.episodeId || null,
        type: formValue.type,
        status: formValue.status,
        appointmentStart: appointmentStart,
        appointmentEnd: appointmentEnd
      };

      if (this.isEditMode && this.appointment?.id) {
        this.appointmentService.update(this.appointment.id, appointmentData).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.toastService.success('Appointment updated successfully!');
            this.saved.emit(response);
          },
          error: (error) => {
            this.isSubmitting = false;
            const errorMsg = error.error?.message || error.error?.error || 'Failed to update appointment';
            this.toastService.error(errorMsg);
          }
        });
      } else {
        this.appointmentService.create(appointmentData).subscribe({
          next: (response) => {
            this.isSubmitting = false;
            this.toastService.success('Appointment booked successfully!');
            this.saved.emit(response);
          },
          error: (error) => {
            this.isSubmitting = false;
            const errorMsg = error.error?.message || error.error?.error || 'Failed to book appointment';
            this.toastService.error(errorMsg);
          }
        });
      }
    }
  }

  onClose() {
    this.close.emit();
  }

  ngOnDestroy() {
    this.patientSearchSubject.complete();
    this.doctorSearchSubject.complete();
    this.episodeSearchSubject.complete();
  }
}
