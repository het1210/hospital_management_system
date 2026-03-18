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

export const routes: Routes = [
    {
        path: '',
        component: Login
    },
    {
        path: '',
        component: Home,
        canActivate: [authGuard],
        children: [
            {
                path: 'dashboard',
                component: Dashboard
            },
            {
                path: 'hospitals',
                component: Hospitals,
                canActivate : [authRole]
            },
            {
                path: 'users',
                component: Users,
                canActivate : [authRole]
            },
            {
                path: 'patients',
                component: Patients
            },
            {
                path: 'appointments',
                component: AppointmentsComponent
            },
            {
                path: 'episode',
                component: EpisodesComponent
            },
            {
                path:'consultations',
                component: ConsultationsPage
            },
            {
                path: 'episode/details/:id',
                component: ViewEpisodeDetails
            },
            {
                path: 'qr-print',
               loadComponent: ()=> import('./components/qr-print/qr-print').then(m => m.QrPrint)
            }
        ]
    },
    {
        path: '**',
        component: Notfound
    }
];
