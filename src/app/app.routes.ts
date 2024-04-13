import { RouterModule, Routes } from '@angular/router';
import { LandingComponent } from './landing/landing.component';
import { NgModule } from '@angular/core';
import { ServicesComponent } from './services/services.component';
import { AboutComponent } from './about/about.component';
import { ContactComponent } from './contact/contact.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './panel/dashboard/dashboard.component';
import { PanelComponent } from './panel/dashboard/panel/panel.component';
import { AppointmentComponent } from './panel/dashboard/appointment/appointment.component';

export const routes: Routes = [
    {
        path: '',
        component: LandingComponent,
        data: { animation: 'HomePage' }
      },
      {
        path: 'services',
        component: ServicesComponent,
        data: { animation: 'ServicePage' }

      },
      {
        path: 'about',
        component: AboutComponent,
        data: { animation: 'AboutPage' }
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
        data: { hideNavbarAndFooter: true },
        children: [{
          path: '',
          component: PanelComponent,
        },
        {
          path: 'appointment',
          component: AppointmentComponent,
        },
      ]
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