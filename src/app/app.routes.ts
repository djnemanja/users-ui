import { Routes } from '@angular/router';
import { authGuard, loginGuard } from './guards/auth.guard';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
    {
      path: 'login',
      component: LoginComponent,
      canActivate: [loginGuard]
    },
    {
      path: 'register',
      component: RegisterComponent,
      canActivate: [loginGuard]
    },
    {
      path: '',
      loadChildren: () => import('./modules/users/users.routes').then(m => m.USERS_ROUTES),
      canActivate: [authGuard]
    },
    {
      path: '**',
      redirectTo: ''
    }
];
