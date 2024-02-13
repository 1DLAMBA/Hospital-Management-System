import { Component } from '@angular/core';
import { AppModule } from '../app.module';
import { UserResource } from '../../resources/user.model';
import { UserService } from '../endpoints/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { response } from 'express';


@Component({
  selector: 'app-login',

  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  user?: UserResource;
  LoginForm: FormGroup;

  constructor(
    private loginEndpoint: UserService,
    private fb:FormBuilder
  ){
    this.LoginForm = this.fb.group({
      email: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    })

  }

  login(){
    if(this.LoginForm.invalid){
            
    }
    const formData = {
      email: this.LoginForm.value.email,
      password: this.LoginForm.value.password,
    }
    this.loginEndpoint.login(formData).subscribe({
      next: (response:any) => {
        console.log('LOGGED IN')
      }
    })
  }

}
