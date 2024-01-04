
import { AppRoutingModule, routes } from "./app.routes";
import { NgModule } from '@angular/core';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { LandingComponent } from "./landing/landing.component";
import { NavBarComponent } from "./nav-bar/nav-bar.component";
import { AppComponent } from "./app.component";
import { Routes, RouterModule } from '@angular/router';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from "@angular/common";
import { SharedModule } from "./shared.module";
import { HttpClientModule } from "@angular/common/http";
import { FooterComponent } from "./footer/footer.component";
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';

@NgModule({

    declarations: [
        LandingComponent,
        NavBarComponent,
        FooterComponent
        

         ],
    imports: [ 
        AppComponent,
        NgbModule,
        CommonModule,
        RouterOutlet,
        AppRoutingModule,
        HttpClientModule,
        DialogModule,
        ButtonModule,
        


         ],
         exports:[
            NavBarComponent,
            FooterComponent
         ]
})
export class AppModule { }