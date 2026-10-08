import { Routes } from '@angular/router';
import { roleGuard } from './core/auth.guard';

export const routes: Routes = [
  // Public
  {
    path: '',
    loadComponent: () =>
      import('./features/public/landing-page/landing-page.component').then(m => m.LandingPageComponent),
  },
  {
    path: 'entrar',
    loadComponent: () =>
      import('./features/public/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'demo',
    loadComponent: () =>
      import('./features/public/profile-choice/profile-choice.component').then(m => m.ProfileChoiceComponent),
  },

  // Institution area
  {
    path: 'instituicao',
    canActivate: [roleGuard],
    data: { role: 'instituicao' },
    loadComponent: () =>
      import('./features/institution/layout/institution-layout.component').then(m => m.InstitutionLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/institution/dashboard/institution-dashboard.component').then(m => m.InstitutionDashboardComponent),
      },
      {
        path: 'solicitar',
        loadComponent: () =>
          import('./features/institution/create-request/create-request.component').then(m => m.CreateRequestComponent),
      },
      {
        path: 'solicitacoes',
        loadComponent: () =>
          import('./features/institution/my-requests/my-requests.component').then(m => m.MyRequestsComponent),
      },
      {
        path: 'professores',
        loadComponent: () =>
          import('./features/institution/search-teachers/search-teachers.component').then(m => m.SearchTeachersComponent),
      },
      {
        path: 'professor/:id',
        loadComponent: () =>
          import('./features/institution/teacher-detail/teacher-detail.component').then(m => m.TeacherDetailComponent),
      },
    ],
  },

  // Teacher area
  {
    path: 'professor',
    canActivate: [roleGuard],
    data: { role: 'professor' },
    loadComponent: () =>
      import('./features/teacher/layout/teacher-layout.component').then(m => m.TeacherLayoutComponent),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/teacher/dashboard/teacher-dashboard.component').then(m => m.TeacherDashboardComponent),
      },
      {
        path: 'convites',
        loadComponent: () =>
          import('./features/teacher/invites/teacher-invites.component').then(m => m.TeacherInvitesComponent),
      },
      {
        path: 'perfil',
        loadComponent: () => import('./features/teacher/profile/teacher-profile.component').then(m => m.TeacherProfileComponent),
      },
      {
        path: 'confirmadas',
        loadComponent: () =>
          import('./features/teacher/confirmed/teacher-confirmed.component').then(m => m.TeacherConfirmedComponent),
      },
    ],
  },

  { path: '**', redirectTo: '' },
];
