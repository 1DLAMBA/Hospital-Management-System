import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { PanelComponent } from './dashboard/panel/panel.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MessagesComponent } from './dashboard/messages/messages.component';
import { MedicalAIComponent } from './dashboard/medical-ai/medical-ai.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardComponent,
    children: [
      { path: 'messages', component: MessagesComponent },
      { 
        path: 'medical-ai', 
        component: MedicalAIComponent,
        loadChildren: () => import('./dashboard/medical-ai/medical-ai.component').then(m => m.MedicalAIComponent)
      },
      // ... other routes
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PanelRoutingModule { }
