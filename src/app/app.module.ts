import { AppRoutingModule, routes } from "./app.routes";
import { MessageComponent, StreamAutocompleteTextareaModule, StreamChatModule } from 'stream-chat-angular';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, ApplicationConfig, importProvidersFrom } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { NgbModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { LandingComponent } from "./landing/landing.component";
import { NavBarComponent } from "./nav-bar/nav-bar.component";
import { AppComponent } from "./app.component";
import { Routes, RouterModule, RouteReuseStrategy } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from "@angular/common";
import { FormGroup, FormControl } from '@angular/forms';
import { SharedModule } from "./shared.module";
import { HttpClientModule } from "@angular/common/http";
import { FooterComponent } from "./footer/footer.component";
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { LoginComponent } from "./login/login.component";
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CalendarModule } from 'primeng/calendar';
import { UserService } from "./endpoints/user.service";
import { RegisterComponent } from "./register/register.component";
import { RadioButtonModule } from 'primeng/radiobutton';
import { FileUploadModule } from 'primeng/fileupload';
import { ToastModule } from 'primeng/toast';
import { DoctorsService } from "./endpoints/doctors.service";
import { ClientsService } from "./endpoints/clients.service";
import { NursesService } from "./endpoints/nurses.service";
import { AboutComponent } from "./about/about.component";
import { ServicesComponent } from "./services/services.component";
import { ContactComponent } from "./contact/contact.component";
import { PanelModule } from "./panel/panel.module";
import { MessageService } from "primeng/api";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastsContainer } from "./toast-container";
import { AnimateOnScroll, AnimateOnScrollModule } from 'primeng/animateonscroll';
import { NgxSpinnerModule } from "ngx-spinner";
import { AppointmentsService } from "./endpoints/appointments.service";
import { AssignmentsService } from "./endpoints/assignments.service";
import { MedicalService } from "./endpoints/medical.service";
import { ConversationService } from "./endpoints/conversation.service";
import { MessagesComponent } from "./panel/dashboard/messages/messages.component";
import { MessagesService } from "./endpoints/messages.service";
import { ChatDialogComponent } from "./panel/chat-dialog/chat-dialog.component";
import { ChatDialogService } from "./panel/chat-dialog.service";
import { DialogService, DynamicDialogModule } from "primeng/dynamicdialog";

// Custom route reuse strategy
export class CustomRouteReuseStrategy implements RouteReuseStrategy {
  shouldDetach() { return false; }
  store() { }
  shouldAttach() { return false; }
  retrieve() { return null; }
  shouldReuseRoute() { return false; }
}

@NgModule({
    declarations: [
        LandingComponent,
        NavBarComponent,
        FooterComponent,
        LoginComponent,
        RegisterComponent,
        AboutComponent,
        ServicesComponent,
        ContactComponent,
        //   ChatDialogComponent
    ],
    imports: [ 
        NgbModule,
        CommonModule,
        RouterOutlet,
        AppRoutingModule,
        HttpClientModule,
        DialogModule,
        ButtonModule,
        DividerModule,
        InputTextModule,
        ReactiveFormsModule,
        FormsModule,
        RadioButtonModule,
        FileUploadModule,
        ToastModule,
        CalendarModule,
        NgbTooltipModule,
        DialogModule,
        ToastsContainer,
        AnimateOnScrollModule,
        NgxSpinnerModule,
        DynamicDialogModule,
        PanelModule
    ],
    exports:[
        NavBarComponent,
        FooterComponent,
        LandingComponent,
        LoginComponent,
        RegisterComponent,
        AboutComponent,
    ],
    providers:[
        UserService,
        DoctorsService,
        ClientsService,
        NursesService,
        ServicesComponent,
        ContactComponent,
        PanelModule,
        AppointmentsService,
        AssignmentsService,
        MedicalService,
        TranslateService,
        ChatDialogService,
        DialogService,
        importProvidersFrom(TranslateModule.forRoot()),
        { provide: RouteReuseStrategy, useClass: CustomRouteReuseStrategy }
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppModule { }