import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit {
  RegisterForm!: FormGroup;
  
  constructor(){
    this.RegisterForm = new FormGroup({
      
    })
  }

 ngOnInit(): void {
   
 }

}
