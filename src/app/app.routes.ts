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
import { NursesComponent } from './panel/dashboard/nurses/nurses.component';
import { ClientsComponent } from './panel/dashboard/clients/clients.component';
import { MessagesComponent } from './panel/dashboard/messages/messages.component';
import { MyProfileComponent } from './panel/dashboard/my-profile/my-profile.component';
import { DoctorsComponent } from './panel/dashboard/doctors/doctors.component';
import { ProfileComponent } from './panel/dashboard/doctors/profile/profile.component';
import { DoctorListComponent } from './panel/dashboard/doctors/doctor-list/doctor-list.component';
import { DoctorPanelComponent } from './panel/dashboard/panel/doctor-panel/doctor-panel.component';
import { DoctorAppointmentComponent } from './panel/dashboard/appointment/doctor-appointment/doctor-appointment.component';
import { ClientAppointmentComponent } from './panel/dashboard/appointment/client-appointment/client-appointment.component';
import { ClientPanelComponent } from './panel/dashboard/panel/client-panel/client-panel.component';
import { NursePanelComponent } from './panel/dashboard/panel/nurse-panel/nurse-panel.component';

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
        children: [
          {
          path: 'doctor-panel',
          component: DoctorPanelComponent,
        },
          {
          path: 'nurse-panel',
          component: NursePanelComponent,
        },
          {
          path: 'client-panel',
          component: ClientPanelComponent,
        },
        // {
        //   path: 'appointment',
        //   component: AppointmentComponent,
        // },
        {
          path: 'doctor-appointment',
          component: DoctorAppointmentComponent,
        },
        {
          path: 'client-appointment',
          component: ClientAppointmentComponent,
        },
        {
          path: 'nurses',
          component: NursesComponent,
        },
        {
          path: 'clients',
          component: ClientsComponent
        },
        {
          path: 'doctors',
          component: DoctorsComponent,
          children: [
            {
            path: '',
            component: DoctorListComponent
          },
            {
            path: 'profile/:id',
            component: ProfileComponent
          },
        ]
        },
        {
          path: 'messages',
          component: MessagesComponent
        },
        {
          path: 'profile',
          component: MyProfileComponent
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