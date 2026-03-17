import { Component, EventEmitter, Input, Output, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Episode } from '../../models/episode.model';
import { EpisodeService } from '../../services/episode.service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-episode-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './episode-view.component.html',
  styleUrls: ['./episode-view.component.scss']
})
export class EpisodeViewComponent implements OnInit {
  episodes: Episode[] = [];
  currentPage = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;
  searchTerm = '';
  user = localStorage.getItem('user_role');

  patientSearchText = '';
  filteredPatients: any[] = [];
  showPatientDropdown = false;
  isPatientDropdownOpen = false;
  private patientSearchSubject = new Subject<string>();
  selectedPatientAdhaar: string | null = null;

  @Output() editEpisode = new EventEmitter<number>();
  @Output() deleteEpisode = new EventEmitter<number>();

  constructor(
    private episodeService: EpisodeService, 
    private patientService: PatientService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) { 
    this.setupDebounce();
  }

  ngOnInit(): void {
    // this.loadEpisodes();
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
              adhaarNumber: p.adhaarNumber,
              name: `${p.firstName} ${p.lastName}`,
              displayText: `${p.firstName} ${p.lastName} (Adhaar: ${p.adhaarNumber})`
            }));
            this.showPatientDropdown = this.filteredPatients.length > 0;
            this.cdr.detectChanges();
          },
          error: (error) => console.error('Error searching patients:', error)
        });
      } else {
        this.showPatientDropdown = false;
        this.cdr.detectChanges();
      }
    });
  }

  loadEpisodes(): void {
    this.episodeService.getAll(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        console.log('Load episodes response:', response);
        this.episodes = response.data.content || response.data || [];
        this.totalPages = response.data.totalPages || 0;
        this.totalElements = response.data.totalElements || 0;
        console.log('Episodes after load:', this.episodes);
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading episodes:', error)
    });
  }

  onSearch(event: any): void {
    const query = event.target.value;
    this.patientSearchText = query;
    if (this.selectedPatientAdhaar && query !== this.filteredPatients.find(p => p.adhaarNumber === this.selectedPatientAdhaar)?.name) {
      this.selectedPatientAdhaar = null;
      // Revert to all episodes if search is cleared manually
      if (!query.trim()) {
         this.loadEpisodes();
      }
    }
    this.patientSearchSubject.next(query);
  }

  togglePatientDropdown() {
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
          displayText: `${p.firstName} ${p.lastName} (Adhaar: ${p.adhaarNumber})`
        }));
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error loading patients:', error)
    });
  }

  selectPatient(patient: any) {
    this.patientSearchText = patient.name;
    this.selectedPatientAdhaar = patient.adhaarNumber;
    this.showPatientDropdown = false;
    this.isPatientDropdownOpen = false;
    
    // Now load episodes for this specific patient adhaar
    this.currentPage = 0;
    this.searchEpisodesByAdhaar(patient.adhaarNumber);
  }

  searchEpisodesByAdhaar(adhaarNumber: string): void {
    this.episodeService.search(adhaarNumber, this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        const episodeArry = response.data.content || [];
        this.episodes = episodeArry.map(ep =>{
          return{
            ...ep,
            status: ep.endDate? 'CLOSE' : 'ACTIVE' 
          }
        })
        this.totalPages = response.data.totalPages || 0;
        this.totalElements = response.data.totalElements || 0;
        this.cdr.detectChanges();
      },
      error: (error) => console.error('Error searching episodes by adhaar:', error)
    });
  }

  onSearchClick(): void {
    if (this.selectedPatientAdhaar) {
      this.searchEpisodesByAdhaar(this.selectedPatientAdhaar);
    } else if (this.patientSearchText.trim()) {
      // If no patient selected from dropdown but button clicked, try searching episodes directly by the text (might be an adhaar number typed directly)
      this.searchEpisodesByAdhaar(this.patientSearchText.trim());
    } else {
      this.loadEpisodes();
    }
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    if (this.selectedPatientAdhaar) {
      this.searchEpisodesByAdhaar(this.selectedPatientAdhaar);
    } else {
      this.loadEpisodes();
    }
  }

  refresh(): void {
    this.loadEpisodes();
  }

  onEdit(id: number): void {
    this.editEpisode.emit(id);
  }

  onView(id: number): void {
    console.log(`view ${id}`);
    this.router.navigate(['/episode/details', id]);
  }

  onDelete(id: number): void {
    if (confirm('Are you sure you want to delete this episode?')) {
      this.deleteEpisode.emit(id);
    }
  }

  ngOnDestroy() {
    this.patientSearchSubject.complete();
  }
}

