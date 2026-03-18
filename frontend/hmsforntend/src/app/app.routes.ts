// src/app/app.routes.ts
// UPDATED — Lab module routes added
import { Routes } from '@angular/router';
import { Login } from './pages/login/login';
import { Home } from './pages/home/home';
import { Dashboard } from './pages/dashboard/dashboard';
import { Hospitals } from './pages/hospitals/hospitals';
import { Users } from './pages/users/users';
import { authGuard, authRole } from './guards/auth-guard';
import { Patients } from './pages/patients/patients';
import { AppointmentsComponent } from './pages/appointments/appointments';
import { EpisodesComponent } from './pages/episodes/episodes.component';
import { ConsultationsPage } from './pages/consultations/consultations';
import { ViewEpisodeDetails } from './pages/view-episode-details/view-episode-details';
import { Notfound } from './components/notfound/notfound';

// ── Lab Module imports (NEW) ───────────────────────────────────────────────
import { LabList }          from './pages/labs/lab-list/lab-list';
import { LabDetails }       from './pages/labs/lab-details/lab-details';
import { LabBooking }       from './pages/labs/lab-booking/lab-booking';
import { SampleCollection } from './pages/labs/sample-collection/sample-collection';
import { LabReport }        from './pages/labs/lab-report/lab-report';

export const routes: Routes = [
  {
    path: '',
    component: Login,
  },
  {
    path: '',
    component: Home,
    canActivate: [authGuard],
    children: [
      { path: 'dashboard',   component: Dashboard },
      { path: 'hospitals',   component: Hospitals, canActivate: [authRole] },
      { path: 'users',       component: Users,     canActivate: [authRole] },
      { path: 'patients',    component: Patients },
      { path: 'appointments', component: AppointmentsComponent },
      { path: 'episode',     component: EpisodesComponent },
      { path: 'consultations', component: ConsultationsPage },
      { path: 'episode/details/:id', component: ViewEpisodeDetails },
      {
        path: 'qr-print',
        loadComponent: () =>
          import('./components/qr-print/qr-print').then(m => m.QrPrint),
      },

      // ── LAB MODULE ROUTES (NEW) ────────────────────────────────────────────
      {
        // Frontdesk + Lab Tech: paginated list of all lab orders
        path: 'lab-orders',
        component: LabList,
      },
      {
        // All roles: view full detail of a single lab order
        path: 'lab-orders/:id',
        component: LabDetails,
      },
      {
        // Frontdesk: book a lab appointment for a ORDERED lab order
        path: 'lab-orders/:id/book',
        component: LabBooking,
      },
      {
        // Lab Tech: collect sample for a BOOKED lab order
        path: 'lab-orders/:id/collect-sample',
        component: SampleCollection,
      },
      {
        // All: view/print the final lab report
        path: 'lab-orders/:id/report',
        component: LabReport,
      },
      // ── END LAB MODULE ROUTES ─────────────────────────────────────────────
    ],
  },
  {
    path: '**',
    component: Notfound,
  },
];