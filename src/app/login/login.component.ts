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
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { ToastService } from '../toast.service';
import { ToastsContainer } from '../toast-container';
import { NgxSpinnerService } from "ngx-spinner";
import { AuthService } from '../auth.service';


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
  error_message: string='';
  submitLoading: boolean=false;
  showOtpVerification: boolean = false;
  pendingVerificationUserId: number | null = null;
  pendingVerificationEmail: string = '';
  pendingVerificationUserType: string = '';

  constructor(
    private loginEndpoint: UserService,
    private fb: FormBuilder,
    private readonly router: Router,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
    private authService: AuthService,
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

  onOtpVerified() {
    // After OTP verification, attempt login again
    this.showOtpVerification = false;
    this.login();
  }

  login() {
    this.spinner.show();
    this.submitLoading = true;

    if (this.LoginForm.invalid) {
      this.spinner.hide();
      this.show('Please Fill Accordingly')
      return;

    }
    const formData = {
      email: this.LoginForm.value.email,
      password: this.LoginForm.value.password,
    }
    console.log('Log in' , formData);
    
    this.loginEndpoint.login(formData).subscribe({
      next: (response: any) => {
        this.submitLoading = false;
        console.log(response.user)
        this.spinner.hide();
        this.authService.login(response)
        // Ensure ID is available to routed components during their ngOnInit
        localStorage.setItem('id', response.user.id)
        switch (response.user.user_type) {
          case 'doctor':
          case 'other_professional':
            this.router.navigate(['panel/doctor-panel', response.user.id]);
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
      },
      error: (res: HttpErrorResponse) => {
        console.log(res);
        this.submitLoading = false;
        this.spinner.hide();
        
        // Check if error is due to unverified email
        if (res.status === 403 && res.error?.requires_verification) {
          this.showOtpVerification = true;
          this.pendingVerificationUserId = res.error.user_id;
          this.pendingVerificationEmail = res.error.email;
          this.pendingVerificationUserType = res.error.user_type;
          return;
        }
        
        if(res.status === 400){
          this.error_message=res.error;
        }
        this.invalidDetails = true;
        this.error_message=res.message || res.error || 'Invalid credentials';

      }
    })
  }

}
