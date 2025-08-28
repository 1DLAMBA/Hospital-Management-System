import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { MedicalAIService } from '../endpoints/medical-ai.service';

@NgModule({
  imports: [
    HttpClientModule
  ],
  providers: [
    MedicalAIService
  ]
})
export class MedicalAISharedModule { }
