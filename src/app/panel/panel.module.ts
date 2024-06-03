import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { FormsModule } from '@angular/forms';
import { TimelineModule } from 'primeng/timeline';
import { TagModule } from 'primeng/tag';
import { DoctorPanelComponent } from './dashboard/panel/doctor-panel/doctor-panel.component';
import { ClientPanelComponent } from './dashboard/panel/client-panel/client-panel.component';


@NgModule({
  declarations: [
    DashboardComponent,
    PanelComponent,
    SideNavComponent,
    DoctorPanelComponent,
    ClientPanelComponent

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
    TagModule

  ],
  bootstrap: [DashboardComponent]
})
export class PanelModule { }
