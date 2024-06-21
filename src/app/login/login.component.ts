import { Component, OnDestroy, OnInit, TemplateRef, inject } from '@angular/core';
import { AppModule } from '../app.module';
import { UserResource } from '../../resources/user.model';
import { UserService } from '../endpoints/user.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  Router, ActivatedRoute,
  ActivatedRouteSnapshot,
  Route,
} from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MessageService } from 'primeng/api';
import { HttpResponse } from '@angular/common/http';
import { ToastService } from '../toast.service';
import { ToastsContainer } from '../toast-container';
import { NgxSpinnerService } from "ngx-spinner";

@Component({
  selector: 'app-login',

  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  providers: [MessageService]
})
export class LoginComponent implements OnDestroy, OnInit {
  toastService = inject(ToastService);
  user?: UserResource;
  LoginForm: FormGroup;
  invalidDetails: boolean = false;

  constructor(
    private loginEndpoint: UserService,
    private fb: FormBuilder,
    private readonly router: Router,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
  ) {
    this.LoginForm = this.fb.group({
      email: this.fb.control('', [Validators.required]),
      password: this.fb.control('', [Validators.required])
    })
  }

  show(message: any) {

    this.messageService.add({ severity: 'error', detail: message });
  }

  invdet() {
    this.invalidDetails = true
  }


  ngOnInit(): void {
    this.spinner.show();
    setTimeout(() => {
      /** spinner ends after 5 seconds */
      this.spinner.hide();
    }, 2000);
  }
  ngOnDestroy(): void {
    this.toastService.clear();
  }

  login() {
    this.spinner.show();

    if (this.LoginForm.invalid) {
      this.spinner.hide();
      this.show('Please Fill Accordingly')
      return;

    }
    const formData = {
      email: this.LoginForm.value.email,
      password: this.LoginForm.value.password,
    }
    this.loginEndpoint.login(formData).subscribe({
      next: (response: any) => {
        console.log(response.user)
        this.spinner.hide();
        switch (response.user.user_type) {
          case 'doctor':
            this.router.navigate(['panel/doctor-panel']);
            break;
          case 'client':
            this.router.navigate(['panel/client-panel']);
            break;
          case 'nurse':
            this.router.navigate(['panel/nurse-panel']);
            break;
        
          default:
            break;
        }
        localStorage.setItem('id', response.user.id)
      },
      error: (res: HttpResponse<any>) => {
        this.invalidDetails = true
        this.spinner.hide();

      }
    })
  }

}
