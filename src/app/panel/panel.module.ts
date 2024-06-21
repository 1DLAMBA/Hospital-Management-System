import { NgModule } from '@angular/core';
import { CommonModule, JsonPipe } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PanelRoutingModule } from './panel-routing.module';
import { PanelComponent } from './dashboard/panel/panel.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';
import { SideNavComponent } from './side-nav/side-nav.component';
import { ToastModule } from 'primeng/toast';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { DoctorPanelComponent } from './dashboard/panel/doctor-panel/doctor-panel.component';
import { ClientPanelComponent } from './dashboard/panel/client-panel/client-panel.component';
import { NursePanelComponent } from './dashboard/panel/nurse-panel/nurse-panel.component';
import { DoctorsComponent } from './dashboard/doctors/doctors.component';
import { ClientDoctorComponent } from './dashboard/doctors/client-doctor/client-doctor.component';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { RouterOutlet } from '@angular/router';
import { DoctorListComponent } from './dashboard/doctors/doctor-list/doctor-list.component';
import { ProfileComponent } from './dashboard/doctors/profile/profile.component';
import { NgbCalendar, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { DoctorAppointmentComponent } from './dashboard/appointment/doctor-appointment/doctor-appointment.component';
import { ClientAppointmentComponent } from './dashboard/appointment/client-appointment/client-appointment.component';
import { AppointmentComponent } from './dashboard/appointment/appointment.component';
import { NgxSpinnerModule, NgxSpinnerService } from 'ngx-spinner';



@NgModule({
  declarations: [
    DashboardComponent,
    PanelComponent,
    SideNavComponent,
    DoctorPanelComponent,
    ClientPanelComponent,
    NursePanelComponent,
    DoctorsComponent,
    ClientDoctorComponent,
    DoctorListComponent,
    ProfileComponent,
    DoctorAppointmentComponent,
    ClientAppointmentComponent,
    AppointmentComponent
  ],
  imports: [
    CommonModule,
    PanelRoutingModule,
    NgbModule,
    HttpClientModule,
    ToastModule,
    ChartModule,
    TableModule,
    CalendarModule,
    FormsModule,
    TimelineModule,
    TagModule,
    InputTextModule,
    ButtonModule,
    DialogModule,
    RouterOutlet,
    ReactiveFormsModule,
    NgbDatepickerModule,
    JsonPipe,
    NgxSpinnerModule
    
  ],
  bootstrap: [DashboardComponent]
})
export class PanelModule { }
