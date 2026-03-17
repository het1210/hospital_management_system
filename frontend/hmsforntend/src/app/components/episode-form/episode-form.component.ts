import { Component, EventEmitter, Input, OnInit, Output, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EpisodeService } from '../../services/episode.service';
import { PatientService } from '../../services/patient.service';
import { Episode } from '../../models/episode.model';
import { Patient } from '../../models/patient.model';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-episode-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './episode-form.component.html',
  styleUrls: ['./episode-form.component.scss']
})
export class EpisodeFormComponent implements OnInit, OnDestroy {
  @Input() episodeId: number | null = null;
  @Output() formSubmitted = new EventEmitter<void>();
  @Output() formCancelled = new EventEmitter<void>();

  episodeForm: FormGroup;
  patients: Patient[] = [];
  filteredPatients: any[] = [];
  isEditMode = false;
  showPatientDropdown = false;
  patientSearchText = '';
  private patientSearchSubject = new Subject<string>();
  selectedPatientId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private episodeService: EpisodeService,
    private patientService: PatientService,
    private cdr: ChangeDetectorRef
  ) {
    this.episodeForm = this.fb.group({
      patientId: ['', Validators.required],
      episodeType: ['', Validators.required],
      reason: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: [''],
      status: ['ACTIVE', Validators.required]
    });
  }

  ngOnInit(): void {
    this.setupDebounce();
    if (this.episodeId) {
      this.isEditMode = true;
      this.loadEpisode();
    }
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
            this.cdr.detectChanges();
          },
          error: (error) => console.error('Error searching patients:', error)
        });
      } else {
        this.showPatientDropdown = false;
      }
    });
  }

  loadEpisode(): void {
    if (this.episodeId) {
      this.episodeService.getById(this.episodeId).subscribe({
        next: (response) => {
          const episode = response.data;
          this.episodeForm.patchValue({
            patientId: episode.patientId,
            episodeType: episode.episodeType,
            reason: episode.reason,
            startDate: episode.startDate.split('T')[0],
            endDate: episode.endDate.split('T')[0],
            status: episode.status
          });
          this.patientSearchText = episode.patientName || '';
          this.selectedPatientId = episode.patientId;
        },
        error: (error) => console.error('Error loading episode:', error)
      });
    }
  }

  togglePatientDropdown(): void {
    this.showPatientDropdown = !this.showPatientDropdown;
    if (this.showPatientDropdown && this.filteredPatients.length === 0) {
      this.loadAllPatients();
    }
  }

  loadAllPatients() {
    this.patientService.search('', 0, 50).subscribe({
      next: (response) => {
        this.filteredPatients = response.data.content.map((p: any) => ({
          id: p.id,
          name: `${p.firstName} ${p.lastName}`,
          displayText: `${p.firstName} ${p.lastName} (ID: ${p.id})`
        }));
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading patients:', error)
    });
  }

  onPatientSearch(event: any): void {
    const query = event.target.value;
    this.patientSearchText = query;
    if (this.selectedPatientId && query !== this.filteredPatients.find(p => p.id === this.selectedPatientId)?.name) {
      this.selectedPatientId = null;
      this.episodeForm.patchValue({ patientId: '' });
    }
    this.patientSearchSubject.next(query);
  }

  selectPatient(patient: any): void {
    this.episodeForm.patchValue({ patientId: patient.id });
    this.patientSearchText = patient.name;
    this.selectedPatientId = patient.id;
    this.showPatientDropdown = false;
  }

  onSubmit(): void {
    if (!this.selectedPatientId) {
      alert('Please select a patient from the dropdown');
      return;
    }
    
    if (this.episodeForm.valid) {
      const episode: Episode = {
        ...this.episodeForm.value,
        hospitalId: Number(localStorage.getItem('hospital_id')),
        startDate: new Date(this.episodeForm.value.startDate).toISOString(),
        endDate: this.episodeForm.value.endDate ? new Date(this.episodeForm.value.endDate).toISOString() : null
      };

      if (this.isEditMode && this.episodeId) {
        this.episodeService.update(this.episodeId, episode).subscribe({
          next: () => {
            alert('Episode updated successfully');
            this.formSubmitted.emit();
          },
          error: (error) => {
            console.error('Error updating episode:', error);
            alert('Failed to update episode');
          }
        });
      } else {
        this.episodeService.create(episode).subscribe({
          next: () => {
            alert('Episode created successfully');
            this.formSubmitted.emit();
          },
          error: (error) => {
            console.error('Error creating episode:', error);
            alert('Failed to create episode');
          }
        });
      }
    }
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  ngOnDestroy() {
    this.patientSearchSubject.complete();
  }
}
