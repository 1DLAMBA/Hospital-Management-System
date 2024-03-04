
import { AppRoutingModule, routes } from "./app.routes";
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LandingComponent } from "./landing/landing.component";
import { NavBarComponent } from "./nav-bar/nav-bar.component";
import { AppComponent } from "./app.component";
import { Routes, RouterModule } from '@angular/router';
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



@NgModule({

    declarations: [
        LandingComponent,
        NavBarComponent,
        FooterComponent,
        LoginComponent,
        RegisterComponent

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
        CalendarModule
              ],
         exports:[
            NavBarComponent,
            FooterComponent,
            LandingComponent,
            LoginComponent,
            RegisterComponent
            
         ],
         providers:[
            UserService,
            DoctorsService,
            ClientsService
         ],
         bootstrap: [],
})
export class AppModule { }