import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../endpoints/user.service';
import { MessageService } from 'primeng/api';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-otp-verification',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, ToastModule],
  templateUrl: './otp-verification.component.html',
  styleUrl: './otp-verification.component.css'
})
export class OtpVerificationComponent implements OnInit {
  @Input() userId!: number;
  @Input() userEmail!: string;
  @Input() userType!: string;
  @Output() verified = new EventEmitter<void>();

  otpForm!: FormGroup;
  isLoading = false;
  isRegenerating = false;
  otpInputs: string[] = ['', '', '', ''];
  otpDigits = [0, 1, 2, 3];

  constructor(
    private userService: UserService,
    private messageService: MessageService,
    private spinner: NgxSpinnerService,
    private router: Router
  ) {
    this.otpForm = new FormGroup({
      digit0: new FormControl('', [Validators.required, Validators.pattern(/^\d$/)]),
      digit1: new FormControl('', [Validators.required, Validators.pattern(/^\d$/)]),
      digit2: new FormControl('', [Validators.required, Validators.pattern(/^\d$/)]),
      digit3: new FormControl('', [Validators.required, Validators.pattern(/^\d$/)])
    });
  }

  ngOnInit(): void {
    // Auto-focus first input
    setTimeout(() => {
      const firstInput = document.querySelector('#otp-digit-0') as HTMLInputElement;
      if (firstInput) {
        firstInput.focus();
      }
    }, 100);
  }

  onDigitInput(event: any, index: number): void {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '').slice(0, 1);
    
    // Update the form control without triggering change detection issues
    this.otpForm.get(`digit${index}`)?.setValue(value, { emitEvent: false, onlySelf: true });
    this.otpInputs[index] = value;
    
    // Ensure input stays visible
    input.style.display = 'block';
    input.style.visibility = 'visible';
    input.style.opacity = '1';
    
    // Move to next input if digit entered
    if (value && index < 3) {
      setTimeout(() => {
        const nextInput = document.querySelector(`#otp-digit-${index + 1}`) as HTMLInputElement;
        if (nextInput) {
          nextInput.focus();
          nextInput.style.display = 'block';
          nextInput.style.visibility = 'visible';
          nextInput.style.opacity = '1';
        }
      }, 10);
    }
    
    // Auto-submit when all 4 digits are entered
    if (this.isOtpComplete()) {
      setTimeout(() => {
        this.verifyOtp();
      }, 100);
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    
    // Ensure input stays visible
    input.style.display = 'block';
    input.style.visibility = 'visible';
    input.style.opacity = '1';
    
    // Handle backspace
    if (event.key === 'Backspace' && !this.otpInputs[index] && index > 0) {
      event.preventDefault();
      const prevInput = document.querySelector(`#otp-digit-${index - 1}`) as HTMLInputElement;
      if (prevInput) {
        prevInput.focus();
        prevInput.select();
        prevInput.style.display = 'block';
        prevInput.style.visibility = 'visible';
        prevInput.style.opacity = '1';
      }
    }
    
    // Handle paste
    if (event.ctrlKey && event.key === 'v') {
      event.preventDefault();
      navigator.clipboard.readText().then(text => {
        const digits = text.replace(/\D/g, '').slice(0, 4);
        if (digits.length === 4) {
          for (let i = 0; i < 4; i++) {
            this.otpForm.get(`digit${i}`)?.setValue(digits[i], { emitEvent: false });
            this.otpInputs[i] = digits[i];
          }
          // Focus last input
          const lastInput = document.querySelector('#otp-digit-3') as HTMLInputElement;
          if (lastInput) {
            lastInput.focus();
          }
          // Auto-submit
          setTimeout(() => {
            this.verifyOtp();
          }, 100);
        }
      });
    }
  }

  isOtpComplete(): boolean {
    return this.otpInputs.every(digit => digit !== '');
  }

  getOtpValue(): string {
    return this.otpInputs.join('');
  }

  verifyOtp(): void {
    const otpValue = this.getOtpValue();
    
    if (!this.isOtpComplete() || otpValue.length !== 4) {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Error', 
        detail: 'Please enter a valid 4-digit OTP code' 
      });
      return;
    }

    this.isLoading = true;
    this.spinner.show();

    this.userService.verifyOtp({
      user_id: this.userId,
      otp: otpValue
    }).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.spinner.hide();
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'Email verified successfully!' 
        });
        
        // Emit verified event
        this.verified.emit();
        
        // Navigate based on user type
        setTimeout(() => {
          switch (this.userType) {
            case 'doctor':
            case 'other_professional':
              this.router.navigate(['panel/doctor-panel', this.userId]);
              break;
            case 'nurse':
              this.router.navigate(['panel/nurse-panel']);
              break;
            default:
              this.router.navigate(['login']);
          }
        }, 1000);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.spinner.hide();
        const errorMessage = error.error?.error || 'Invalid OTP code. Please try again.';
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: errorMessage 
        });
        // Clear all inputs and refocus first
        this.clearOtpInputs();
        setTimeout(() => {
          const firstInput = document.querySelector('#otp-digit-0') as HTMLInputElement;
          if (firstInput) {
            firstInput.focus();
          }
        }, 100);
      }
    });
  }

  regenerateOtp(): void {
    this.isRegenerating = true;
    this.spinner.show();

    this.userService.regenerateOtp({ user_id: this.userId }).subscribe({
      next: (response: any) => {
        this.isRegenerating = false;
        this.spinner.hide();
        this.messageService.add({ 
          severity: 'success', 
          summary: 'Success', 
          detail: 'New OTP has been sent to your email' 
        });
      },
      error: (error: any) => {
        this.isRegenerating = false;
        this.spinner.hide();
        const errorMessage = error.error?.error || 'Failed to regenerate OTP. Please try again.';
        this.messageService.add({ 
          severity: 'error', 
          summary: 'Error', 
          detail: errorMessage 
        });
      }
    });
  }

  clearOtpInputs(): void {
    for (let i = 0; i < 4; i++) {
      this.otpForm.get(`digit${i}`)?.setValue('', { emitEvent: false, onlySelf: true });
      this.otpInputs[i] = '';
      const input = document.querySelector(`#otp-digit-${i}`) as HTMLInputElement;
      if (input) {
        input.style.display = 'block';
        input.style.visibility = 'visible';
        input.style.opacity = '1';
      }
    }
  }

  trackByIndex(index: number): number {
    return index;
  }

  onInputFocus(event: FocusEvent, index: number): void {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    input.style.display = 'block';
    input.style.visibility = 'visible';
    input.style.opacity = '1';
  }

  onInputClick(event: MouseEvent, index: number): void {
    event.stopPropagation();
    const input = event.target as HTMLInputElement;
    input.style.display = 'block';
    input.style.visibility = 'visible';
    input.style.opacity = '1';
    input.focus();
  }
}
