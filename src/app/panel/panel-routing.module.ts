import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './dashboard/panel/panel.component';


const routes: Routes = [{
  path: '',
  component: PanelComponent
}]



@NgModule({
  imports: [RouterModule.forRoot(routes, {
})],
  exports: [RouterModule]
})

export class PanelRoutingModule { }
