import { Component, OnInit, ViewChild, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ViewConsultations } from '../../components/view-consultations/view-consultations';
import { Consultation } from '../../models/consultation.model';
import { ToastService } from '../../services/toast.service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-consultations',
  imports: [CommonModule, FormsModule, ViewConsultations],
  templateUrl: './consultations.html',
  styleUrl: './consultations.scss',
})
export class ConsultationsPage implements OnInit {
  @ViewChild(ViewConsultations) viewConsultations!: ViewConsultations;

  searchTerm: string = '';
  startDate: string = '';
  endDate: string = '';
  searchType: string = 'patient';

  patientSearchText = '';
  filteredPatients: any[] = [];
  showPatientDropdown = false;
  isPatientDropdownOpen = false;
  private patientSearchSubject = new Subject<string>();
  selectedPatientAdhaar: string | null = null;

  constructor(
    private toastService: ToastService,
    private patientService: PatientService,
    private cdr: ChangeDetectorRef
  ) { 
    this.setupDebounce();
  }

  ngOnInit() { }

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

  onSearchDropdown(event: any): void {
    const query = event.target.value;
    this.patientSearchText = query;
    if (this.selectedPatientAdhaar && query !== this.filteredPatients.find(p => p.adhaarNumber === this.selectedPatientAdhaar)?.name) {
      this.selectedPatientAdhaar = null;
      if (!query.trim()) {
        this.viewConsultations?.refresh();
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
    
    // Now load consultations for this adhaar directly
    this.executeSearch(patient.adhaarNumber);
  }

  executeSearch(adhaar: string) {
    if (!adhaar) return;
    this.viewConsultations?.searchByPatient(adhaar as any); // Adhaar string passed correctly
  }

  onSearch() {
    if (this.selectedPatientAdhaar) {
      this.executeSearch(this.selectedPatientAdhaar);
    } else if (this.patientSearchText) {
      this.executeSearch(this.patientSearchText.trim());
    } else {
      this.viewConsultations?.refresh();
    }
  }

  onSearchTypeChange() {
    console.log('Search type changed to:', this.searchType);
    this.patientSearchText = '';
    this.selectedPatientAdhaar = null;
  }

  // onDateRangeChange() {
  //   // Implement date range filter logic
  //   console.log('Date range:', this.startDate, 'to', this.endDate);
  // }

  clearFilters() {
    this.searchTerm = '';
    this.startDate = '';
    this.endDate = '';
    this.viewConsultations?.refresh();
  }

  viewConsultation(consultation: Consultation) {
    console.log('View consultation:', consultation);
  }

  printConsultation(consultation: Consultation) {
    // PDF generation is handled inside view-consultations via ConsultationPdfService
  }

  ngOnDestroy() {
    this.patientSearchSubject.complete();
  }
}

