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
import { OtherProfessionalsService } from '../endpoints/other-professionals.service';
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
  signatureFile: any;
  uploadedSignatureFile: any;
  signatureLoader: boolean = false;
  idCardFile: any;
  uploadedIdCardFile: any;
  idCardLoader: boolean = false;
  userId: any;
  invalidFill: boolean = false;
  submitLoader: boolean = false;
  showOtpVerification: boolean = false;
  registeredUserEmail: string = '';
  registeredUserType: string = '';

  // Professional types for other_professional user type
  professionalTypes = [
    { label: 'Public Health', value: 'Public Health' },
    { label: 'Physiologist', value: 'Physiologist' },
    { label: 'Pharmacist', value: 'Pharmacist' },
    { label: 'Physical Therapist', value: 'Physical Therapist' },
    { label: 'Occupational Therapist', value: 'Occupational Therapist' },
    { label: 'Radiologist', value: 'Radiologist' },
    { label: 'Laboratory Technician', value: 'Laboratory Technician' },
    { label: 'Medical Social Worker', value: 'Medical Social Worker' },
    { label: 'Nutritionist', value: 'Nutritionist' },
    { label: 'Respiratory Therapist', value: 'Respiratory Therapist' },
    { label: 'Other', value: 'Other' }
  ];

  constructor(
    private _http: HttpClient,
    private readonly userEndpoint: UserService,
    private readonly doctorEndpoint: DoctorsService,
    private readonly nurseEndpoint: NursesService,
    private readonly otherProfessionalEndpoint: OtherProfessionalsService,
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
      professional_type: new FormControl(''), // Required conditionally for other_professional
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
      if (this.RegisterForm.value.user_type == 'doctor' || 
          this.RegisterForm.value.user_type == 'nurse' || 
          this.RegisterForm.value.user_type == 'other_professional') {
        // Set professional_type as required for other_professional
        if (this.RegisterForm.value.user_type === 'other_professional') {
          this.RegisterForm.get('professional_type')?.setValidators([Validators.required]);
        } else {
          this.RegisterForm.get('professional_type')?.clearValidators();
        }
        this.RegisterForm.get('professional_type')?.updateValueAndValidity();
        
        this.secondstep = true;
        this.firststep = false;
      }
    }
    else {
      this.degreeError('Please Fill Accordingly')
    }

  }
  submit() {
    // Validate signature and ID card for professionals
    const isProfessional = this.RegisterForm.value.user_type === 'doctor' || 
                          this.RegisterForm.value.user_type === 'nurse' || 
                          this.RegisterForm.value.user_type === 'other_professional';
    
    if (isProfessional) {
      if (!this.signatureFile) {
        this.degreeError('Please upload your signature');
        return;
      }
      if (!this.idCardFile) {
        this.degreeError('Please upload your ID card');
        return;
      }
    }
    
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
    if (this.signatureFile) {
      this.signatureFile = this.uploadedSignatureFile.slice(
        baseUrlLength,
        this.uploadedSignatureFile.length
      );
    }
    if (this.idCardFile) {
      this.idCardFile = this.uploadedIdCardFile.slice(
        baseUrlLength,
        this.uploadedIdCardFile.length
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
        this.userId = response.user.id;
        
        // Check if OTP verification is required
        if (response.requires_verification) {
          this.registeredUserEmail = this.RegisterForm.value.email;
          this.registeredUserType = this.RegisterForm.value.user_type;
        }
        
        this.adduser(this.userId, this.RegisterForm.value.user_type);
      },
      error: (error) => {
        console.log(error);
        this.submitLoader=false;
        this.degreeError(error.error.error)
      }
    })
  }
  finalstep() {
    const isOtherProfessional = this.RegisterForm.value.user_type === 'other_professional';
    const hasProfessionalType = this.RegisterForm.value.professional_type;
    
    if (this.RegisterForm.value.license_number &&
      this.RegisterForm.value.med_school &&
      this.degreeFile &&
      this.RegisterForm.value.specialization &&
      this.RegisterForm.value.grad_year &&
      (!isOtherProfessional || hasProfessionalType)
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
          signature: this.signatureFile,
          id_card: this.idCardFile,
        }
        this.doctorEndpoint.create(user).subscribe({
          next: (response: any) => {
            console.log(response);
            this.submitLoader = false;
            // Show OTP verification instead of navigating to login
            this.showOtpVerification = true;
            this.registeredUserEmail = this.RegisterForm.value.email;
            this.registeredUserType = 'doctor';
          },
          error: (err) => {
            console.log(err);
            this.submitLoader = false;
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
          signature: this.signatureFile,
          id_card: this.idCardFile,
        }
        this.nurseEndpoint.create(nurse).subscribe({
          next: (response) => {
            console.log(response);
            this.submitLoader = false;
            // Show OTP verification instead of navigating to login
            this.showOtpVerification = true;
            this.registeredUserEmail = this.RegisterForm.value.email;
            this.registeredUserType = 'nurse';
          }, 
          error: (err) => {
            console.log(err);
            this.submitLoader = false;
          },
        })
        break;
      case 'other_professional':
        const otherProfessional = {
          user_id: userId,
          professional_type: this.RegisterForm.value.professional_type,
          license_number: this.RegisterForm.value.license_number,
          med_school: this.RegisterForm.value.med_school,
          specialization: this.RegisterForm.value.specialization,
          grad_year: this.RegisterForm.value.grad_year,
          degree_file: this.degreeFile,
          signature: this.signatureFile,
          id_card: this.idCardFile,
        }
        this.otherProfessionalEndpoint.create(otherProfessional).subscribe({
          next: (response) => {
            console.log(response);
            this.submitLoader = false;
            // Show OTP verification instead of navigating to login
            this.showOtpVerification = true;
            this.registeredUserEmail = this.RegisterForm.value.email;
            this.registeredUserType = 'other_professional';
          }, 
          error: (err) => {
            console.log(err);
            this.submitLoader = false;
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
      case 'signature':
        this.signatureLoader = true;
        break;
      case 'id_card':
        this.idCardLoader = true;
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
          case 'signature':
            this.signatureFile = file;
            this.signatureLoader = false;
            break;
          case 'id_card':
            this.idCardFile = file;
            this.idCardLoader = false;
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
          case 'signature':
            this.uploadedSignatureFile = environment.apiUrl + '/file/get/' + this.signatureFile
            this.signatureLoader = false
            break;
          case 'id_card':
            this.uploadedIdCardFile = environment.apiUrl + '/file/get/' + this.idCardFile
            this.idCardLoader = false
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
        this.signatureLoader = false;
        this.idCardLoader = false;
      }

    })
  }

  onOtpVerified() {
    // OTP verification component handles navigation
    this.showOtpVerification = false;
  }

}
