import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BankAccountService } from '../../endpoints/bank-account.service';
import { BankAccount, Bank } from '../../models/bank-account.model';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-bank-account-form',
  templateUrl: './bank-account-form.component.html',
  styleUrls: ['./bank-account-form.component.css']
})
export class BankAccountFormComponent implements OnInit {
  @Input() bankAccount: BankAccount | null = null;
  @Input() professionalName: string = '';
  @Output() saved = new EventEmitter<BankAccount>();
  @Output() cancelled = new EventEmitter<void>();

  bankForm!: FormGroup;
  banks: Bank[] = [];
  loading = false;
  resolving = false;
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private bankAccountService: BankAccountService,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {
    this.isEditing = !!this.bankAccount;
    this.initForm();
    this.loadBanks();
  }

  initForm(): void {
    this.bankForm = this.fb.group({
      account_number: [
        { value: this.bankAccount?.account_number || '', disabled: this.isEditing },
        [Validators.required, Validators.pattern(/^\d{10}$/)]
      ],
      bank_code: [
        { value: this.bankAccount?.bank_code || '', disabled: this.isEditing },
        Validators.required
      ],
      bank_name: [this.bankAccount?.bank_name || '', Validators.required],
      account_name: [
        { value: this.bankAccount?.account_name || '', disabled: true },
        Validators.required
      ],
      consultation_fee: [this.bankAccount?.consultation_fee || 0, [Validators.required, Validators.min(0)]]
    });
  }

  loadBanks(): void {
    this.bankAccountService.getBanks().subscribe({
      next: (response) => {
        this.banks = response.banks || [];
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load banks list'
        });
      }
    });
  }

  onBankChange(): void {
    const selectedBank = this.banks.find(b => b.code === this.bankForm.value.bank_code);
    if (selectedBank) {
      this.bankForm.patchValue({ bank_name: selectedBank.name });
    }
    this.clearResolvedAccount();
  }

  clearResolvedAccount(): void {
    this.bankForm.patchValue({ account_name: '' });
  }

  resolveAccount(): void {
    const accountNumber = this.bankForm.get('account_number')?.value;
    const bankCode = this.bankForm.get('bank_code')?.value;

    if (!accountNumber || !bankCode) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Information',
        detail: 'Please enter account number and select a bank'
      });
      return;
    }

    if (!/^\d{10}$/.test(accountNumber)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Invalid Account',
        detail: 'Account number must be exactly 10 digits'
      });
      return;
    }

    this.resolving = true;
    this.bankAccountService.resolveAccount(accountNumber, bankCode).subscribe({
      next: (response) => {
        this.resolving = false;
        this.bankForm.patchValue({
          account_name: response.account_name
        });
        this.messageService.add({
          severity: 'success',
          summary: 'Account Verified',
          detail: `Account resolved: ${response.account_name}`
        });
      },
      error: () => {
        this.resolving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Verification Failed',
          detail: 'Could not verify account details. Please check and try again.'
        });
      }
    });
  }

  onSubmit(): void {
    if (this.bankForm.invalid) {
      this.markFormGroupTouched(this.bankForm);
      return;
    }

    this.loading = true;
    const formData = this.bankForm.getRawValue();

    if (this.isEditing && this.bankAccount?.id) {
      // Update only consultation fee
      this.bankAccountService.updateBankAccount(this.bankAccount.id, {
        consultation_fee: formData.consultation_fee
      }).subscribe({
        next: (response) => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Updated',
            detail: 'Consultation fee updated successfully'
          });
          this.saved.emit(response.bank_account);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update bank account'
          });
        }
      });
    } else {
      // Create new bank account
      this.bankAccountService.createBankAccount(formData).subscribe({
        next: (response) => {
          this.loading = false;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Bank account added successfully'
          });
          this.saved.emit(response.bank_account);
        },
        error: (error) => {
          this.loading = false;
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to add bank account'
          });
        }
      });
    }
  }

  onCancel(): void {
    this.cancelled.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  get accountNumberError(): string {
    const control = this.bankForm.get('account_number');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Account number is required';
      if (control.errors['pattern']) return 'Account number must be exactly 10 digits';
    }
    return '';
  }

  get bankCodeError(): string {
    const control = this.bankForm.get('bank_code');
    if (control?.touched && control?.errors?.['required']) {
      return 'Please select a bank';
    }
    return '';
  }

  get consultationFeeError(): string {
    const control = this.bankForm.get('consultation_fee');
    if (control?.touched && control?.errors) {
      if (control.errors['required']) return 'Consultation fee is required';
      if (control.errors['min']) return 'Consultation fee cannot be negative';
    }
    return '';
  }
}
