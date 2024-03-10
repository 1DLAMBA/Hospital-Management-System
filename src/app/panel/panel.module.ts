import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PanelRoutingModule } from './panel-routing.module';
import { PanelComponent } from './dashboard/panel/panel.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';




@NgModule({
  declarations: [
    DashboardComponent,
    PanelComponent],
  imports: [
    CommonModule,
    PanelRoutingModule,
    NgbModule,
    HttpClientModule,

  ],
  bootstrap :[DashboardComponent]
})
export class PanelModule { }
