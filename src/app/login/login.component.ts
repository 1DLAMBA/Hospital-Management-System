import { Component } from '@angular/core';
import { AppModule } from '../app.module';
import { UserResource } from '../../resources/user.model';
import { UserService } from '../endpoints/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Router, ActivatedRoute,
  ActivatedRouteSnapshot,
  Route,
} from '@angular/router';
import { MessageService } from 'primeng/api';
import { HttpResponse } from '@angular/common/http';


@Component({
  selector: 'app-login',

  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [MessageService]
})
export class LoginComponent {
  user?: UserResource;
  LoginForm: FormGroup;

  constructor(
    private loginEndpoint: UserService,
    private fb: FormBuilder,
    private readonly router: Router,
    private messageService: MessageService
  ) {
    this.LoginForm = this.fb.group({
      email: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    })
  }
  show(message: any) {

    console.log('toast method')
    this.messageService.add({ severity: 'error', summary: 'Error', detail: message });
  }

  login() {
    if (this.LoginForm.invalid) {
      window.alert('Failed!')
    }
    const formData = {
      email: this.LoginForm.value.email,
      password: this.LoginForm.value.password,
    }
    this.loginEndpoint.login(formData).subscribe({
      next: (response: any) => {
        console.log(response.content)
        this.router.navigate(['panel']);
      },
      error: (res: HttpResponse<any>) => {

        this.show(res)
      }
    })
  }

}
