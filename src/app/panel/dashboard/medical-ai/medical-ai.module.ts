import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MedicalAIComponent } from './medical-ai.component';
import { FormsModule } from '@angular/forms';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

const routes: Routes = [
  { path: '', component: MedicalAIComponent }
];

@NgModule({
  declarations: [
    MedicalAIComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    InputTextareaModule,
    ButtonModule,
    ProgressSpinnerModule,
    ToastModule,
    RouterModule.forChild(routes),
    HttpClientModule
  ]
})
export class MedicalAIModule { } 