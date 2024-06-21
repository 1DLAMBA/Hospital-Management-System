import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../endpoints/user.service';
import { UserDTO } from '../../resources/user.model';
import { DoctorsService } from '../endpoints/doctors.service';
import {
  Router, ActivatedRoute,
  ActivatedRouteSnapshot,
  Route,
} from '@angular/router';
import { ClientsService } from '../endpoints/clients.service';
import { NursesService } from '../endpoints/nurses.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';

interface UploadEvent {
  originalEvent: Event;
  files: File[];
}
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css',
  providers: [MessageService]
})
export class RegisterComponent implements OnInit {
  RegisterForm!: FormGroup;
  clientForm!: FormGroup;
  userDto!: UserDTO;
  firststep: boolean = true;
  clientstep: boolean = false;
  secondstep: boolean = false;
  photostep: boolean = false;
  passportLoader: boolean = false;
  degreeFile: any;
  uploadedDegreeFile: any;
  loader: boolean = false;
  passport: any;
  uploadedPassport: any;
  userId: any;
  invalidFill: boolean = false;
  submitLoader: boolean = false;

  constructor(
    private _http: HttpClient,
    private readonly userEndpoint: UserService,
    private readonly doctorEndpoint: DoctorsService,
    private readonly nurseEndpoint: NursesService,
    private readonly clientEndpoint: ClientsService,
    private readonly router: Router,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,


  ) {
    this.RegisterForm = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
      confirm_password: new FormControl('', Validators.required),
      user_type: new FormControl('', Validators.required),
      license_number: new FormControl('', Validators.required),
      med_school: new FormControl('', Validators.required),
      specialization: new FormControl('', Validators.required),
      grad_year: new FormControl('', Validators.required),
      phoneno: new FormControl('', Validators.required),
      gender: new FormControl('', Validators.required),
    })
    this.clientForm = new FormGroup({
      date_of_birth: new FormControl<Date | null>(null)
    })
  }

  ngOnInit(): void {

  }
  degreeSuccess(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }
  degreeError(message: any) {

    this.messageService.add({ severity: 'error', detail: message });
  }
  // Logic For stepper
  next() {
    if (this.RegisterForm.value.user_type &&
      this.RegisterForm.value.name &&
      this.RegisterForm.value.email &&
      this.RegisterForm.value.phoneno &&
      this.RegisterForm.value.gender &&
      this.RegisterForm.value.password &&
      this.RegisterForm.value.confirm_password
    ) {
      if (this.RegisterForm.value.password != this.RegisterForm.value.confirm_password) {
        window.alert('Passwords dont match');
        return;
      }

      if (this.RegisterForm.value.user_type == 'client') {
        this.firststep = false;
        this.clientstep = true;
      }
      if (this.RegisterForm.value.user_type == 'doctor' || this.RegisterForm.value.user_type == 'nurse') {
        this.secondstep = true;
        this.firststep = false;
      }
    }
    else {
      this.degreeError('Please Fill Accordingly')
    }

  }
  submit() {
    // if(!this.passport.invalid){
    //   this.degreeError('Upload Passport')
    // }
    this.submitLoader=true;
    const baseUrlLength = (environment.apiUrl + '/file/get/').length;
    if (this.degreeFile) {
      this.degreeFile = this.uploadedDegreeFile.slice(
        baseUrlLength,
        this.uploadedDegreeFile.length
      );
    }
    if (this.passport) {
      this.passport = this.uploadedPassport.slice(
        baseUrlLength,
        this.uploadedPassport.length
      );
    }

    const formData = {
      name: this.RegisterForm.value.name,
      email: this.RegisterForm.value.email,
      password: this.RegisterForm.value.password,
      phoneno: this.RegisterForm.value.phoneno,
      user_type: this.RegisterForm.value.user_type,
      gender: this.RegisterForm.value.gender,
      passport: this.passport,
    }
    this.userEndpoint.register(formData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.userId = response.user.id
        this.adduser(this.userId, this.RegisterForm.value.user_type)

      },
      error: (error) => {
        console.log(error);
        this.submitLoader=false;
        this.degreeError(error.error.error)
      }
    })
  }
  finalstep() {
    if (this.RegisterForm.value.license_number &&
      this.RegisterForm.value.med_school &&
      !this.degreeFile.invalid &&
      this.RegisterForm.value.specialization &&
      this.RegisterForm.value.grad_year
    ) {

      this.secondstep = false;
      this.photostep = true;
    }
    else {
      this.degreeError('Please Fill Accordingly')
    }
  }
  firstframe() {
    this.firststep = true;
    this.secondstep = false;
    this.clientstep = false;
    this.photostep = false;
  }
  secondstepback() {
    this.secondstep = true;
    this.photostep = false
  }

  stepcheck() {
    if (this.RegisterForm.value.user_type == 'client') {
      this.clientstep = true;
      this.photostep = false;
      return;
    } else {
      this.secondstepback();
    }
  }
  clientToFinal() {
    if (this.clientForm.value.date_of_birth) {
      this.clientstep = false;
      this.photostep = true;
      return;
    }
    this.degreeError('Please fill accordingly')
  }

  adduser(userId: any, user_type: any) {
    switch (user_type) {
      case 'doctor':
        const user = {
          user_id: userId,
          license_number: this.RegisterForm.value.license_number,
          med_school: this.RegisterForm.value.med_school,
          specialization: this.RegisterForm.value.specialization,
          grad_year: this.RegisterForm.value.grad_year,
          degree_file: this.degreeFile,
        }
        this.doctorEndpoint.create(user).subscribe({
          next: (response: any) => {
            console.log(response);
            this.router.navigate(['login'])

          },
          error(err) {
            console.log(err)
          },
        })
        break;
      case 'nurse':

        const nurse = {
          user_id: userId,
          license_number: this.RegisterForm.value.license_number,
          med_school: this.RegisterForm.value.med_school,
          specialization: this.RegisterForm.value.specialization,
          grad_year: this.RegisterForm.value.grad_year,
          degree_file: this.degreeFile,
        }
        this.nurseEndpoint.create(nurse).subscribe({
          next: (response) => {
            console.log(response);
            this.router.navigate(['login'])
          }, error(err) {

          },
        })
        break;
      case 'client':

        const client = {
          user_id: userId,
          date_of_birth: this.clientForm.value.date_of_birth
        }
        this.clientEndpoint.create(client).subscribe({
          next: (response) => {
            console.log(response);
            this.router.navigate(['login'])
          }, error(err) {

          },
        })
        break;
    }
  }

  // File UPLOAD
  handleFileUpload(e: any, type: string) {
    switch (type) {
      case 'degree':
        this.loader = true;
        break;
      case 'passport':
        this.passportLoader = true;
        break;
      default:
        window.alert('something went wrong')
        break;

    }
    let file = e.target.files[0];
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);
    formData.append('visibility', 'public');

    this._http.post(`${environment.apiUrl}/upload`, formData).subscribe({
      next: (response: any) => {
        const file = response.data;
        this.loader = false;

        switch (type) {
          case 'degree':
            this.degreeFile = file;
            break;
          case 'passport':
            this.passport = file;
            this.passportLoader = false;
            break;
          default:
            window.alert('something went wrong')
            break;

        }
      },
      complete: () => {
        this.loader = false;
        this.degreeSuccess('Uploaded')

        switch (type) {
          case 'degree':
            this.uploadedDegreeFile = environment.apiUrl + '/file/get/' + this.degreeFile
            break;
          case 'passport':
            this.uploadedPassport = environment.apiUrl + '/file/get/' + this.passport
            this.passportLoader = false

            break;
          default:
            window.alert('something went wrong')
            break;
        }

      },
      error: (error: any) => {
        this.loader = false;
        this.degreeError('Please try again')
        this.passportLoader = false;
      }

    })
  }



}
