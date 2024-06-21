import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './dashboard/panel/panel.component';
import { DashboardComponent } from './dashboard/dashboard.component';


const routes: Routes = [{
  path: '',
  component: PanelComponent
},
// {
//   path: '',
//   component: PanelComponent
// }
]



@NgModule({
  imports: [RouterModule.forRoot(routes, {
})],
  exports: [RouterModule]
})

export class PanelRoutingModule { }
