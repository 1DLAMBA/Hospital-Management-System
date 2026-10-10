import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { HospitalsService } from '../endpoints/hospitals.service';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmation = control.get('password_confirmation')?.value;
  return password && confirmation && password !== confirmation ? { passwordMismatch: true } : null;
}

@Component({
  selector: 'app-hospital-register',
  templateUrl: './hospital-register.component.html',
  styleUrl: './hospital-register.component.css',
  providers: [MessageService]
})
export class HospitalRegisterComponent {
  hospitalForm: FormGroup;
  submitLoader = false;

  constructor(
    private readonly hospitalsService: HospitalsService,
    private readonly router: Router,
    private messageService: MessageService,
  ) {
    this.hospitalForm = new FormGroup({
      name: new FormControl('', Validators.required),
      address: new FormControl('', Validators.required),
      phoneno: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      registration_number: new FormControl(''),
      password: new FormControl('', [Validators.required, Validators.minLength(8)]),
      password_confirmation: new FormControl('', Validators.required),
    }, { validators: passwordsMatchValidator });
  }

  getBackendErrorMessage(error: any): string {
    const body = error?.error ?? error;
    const errors = body?.errors;
    if (errors && typeof errors === 'object') {
      const firstKey = Object.keys(errors)[0];
      const messages = firstKey ? errors[firstKey] : null;
      if (Array.isArray(messages) && messages.length > 0) {
        return messages[0];
      }
    }
    return body?.message || 'Please try again';
  }

  submit(): void {
    if (this.hospitalForm.invalid) {
      this.hospitalForm.markAllAsTouched();
      return;
    }

    this.submitLoader = true;
    this.hospitalsService.register(this.hospitalForm.value).subscribe({
      next: () => {
        this.submitLoader = false;
        this.messageService.add({ severity: 'success', detail: 'Hospital registered successfully. Health professionals can now select it during registration.' });
        this.router.navigate(['login']);
      },
      error: (error) => {
        this.submitLoader = false;
        this.messageService.add({ severity: 'error', detail: this.getBackendErrorMessage(error) });
      },
    });
  }
}
