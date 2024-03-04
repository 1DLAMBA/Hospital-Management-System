import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { NgModule } from '@angular/core';
import { ServicesComponent } from './services/services.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './panel/dashboard/dashboard.component';

export const routes: Routes = [
    {
        path: '',
        component: LandingComponent,
      },
      {
        path: 'services',
        component: ServicesComponent,
      },
      {
        path: 'about',
        component: AboutComponent,
      },
      {
        path: 'contact',
        component: ContactComponent,
      },
      {
        path: 'login',
        component: LoginComponent,
      },
      {
        path: 'register',
        component: RegisterComponent,
      },
      {
        path: 'panel',
        component: DashboardComponent,
      },
];
@NgModule({
    imports: [
      RouterModule.forChild(routes),
      // ... other imports
    ],
    exports: [RouterModule]
    // ... other configurations
  })
  export class AppRoutingModule { }