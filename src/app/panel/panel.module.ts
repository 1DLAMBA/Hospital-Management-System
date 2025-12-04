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
import { PanelResolver } from './dashboard/panel/panel-resolver';
import { NursesComponent } from './dashboard/nurses/nurses.component';
import { ClientsComponent } from './dashboard/clients/clients.component';
import { ClientProfileComponent } from './dashboard/clients/client-profile/client-profile.component';
import { ClientListComponent } from './dashboard/clients/client-list/client-list.component';
import { DoctorProfileComponent } from './dashboard/my-profile/doctor-profile/doctor-profile.component';
import { ProfilePageComponent } from './dashboard/my-profile/profile-page/profile-page.component';
import { MyProfileComponent } from './dashboard/my-profile/my-profile.component';
import { InputSwitchModule } from 'primeng/inputswitch';
import { ProfileNurseComponent } from './dashboard/nurses/profile-nurse/profile-nurse.component';
import { NurseListComponent } from './dashboard/nurses/nurse-list/nurse-list.component';
import { NurseProfileComponent } from './dashboard/my-profile/nurse-profile/nurse-profile.component';
import { AssignmentsComponent } from './dashboard/assignments/assignments.component';
import { ChatDialogComponent } from './chat-dialog/chat-dialog.component';
import { ChatDialogService } from './chat-dialog.service';
import { DynamicDialogModule, DialogService } from 'primeng/dynamicdialog';
import { BadgeModule } from 'primeng/badge';
import { InputNumber, InputNumberModule } from 'primeng/inputnumber';
import { MessagesComponent } from './dashboard/messages/messages.component';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SkeletonModule } from 'primeng/skeleton';
import { MessagesService } from '../endpoints/messages.service';
import { ConversationService } from '../endpoints/conversation.service';
import { LoaderComponent } from '../components/loader/loader.component';
import { PanelLoaderComponent } from '../components/panel-loader/panel-loader.component';
import { PanelSkeletonComponent } from '../shared/components/panel-skeleton/panel-skeleton.component';
import { OverlayModule } from 'primeng/overlay';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ChatPageComponent } from './dashboard/messages/chat-page/chat-page.component';
import { SharedModule } from '../shared.module';
import { MedicalRecordViewComponent } from '../shared/components/medical-record-view/medical-record-view.component';

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
    NursesComponent,
    ProfileComponent,
    DoctorAppointmentComponent,
    ClientAppointmentComponent,
    AppointmentComponent,
    ClientsComponent,
    ClientProfileComponent,
    ClientListComponent,
    DoctorProfileComponent,
    ProfilePageComponent,
    MyProfileComponent,
    ProfileNurseComponent,
    NurseListComponent,
    NurseProfileComponent,
    AssignmentsComponent,
    ChatDialogComponent,
    MessagesComponent,
    ChatPageComponent,
    LoaderComponent,
    PanelLoaderComponent,
    PanelSkeletonComponent
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
    NgxSpinnerModule,
    InputSwitchModule,
    DynamicDialogModule, 
    BadgeModule,
    InputNumberModule,
    InputTextModule,
    InputTextareaModule,
    ProgressSpinnerModule,
    SkeletonModule,
    OverlayModule,
    OverlayPanelModule,
    SharedModule,
    MedicalRecordViewComponent,
    
  ],
  exports: [PanelLoaderComponent],
  bootstrap: [DashboardComponent],
  providers:[ChatDialogService, DialogService,MessagesService,ConversationService]
})
export class PanelModule { }
