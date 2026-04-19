import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../../endpoints/user.service';
import { environment } from '../../../../../environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NgbCalendar } from '@ng-bootstrap/ng-bootstrap';
import { MessageService } from 'primeng/api';
import { NursesService } from '../../../../endpoints/nurses.service';
import { NurseResource } from '../../../../../resources/nurse.model';
import { AuthService } from '../../../../auth.service';
import { BankAccount } from '../../../../models/bank-account.model';
import { BankAccountService } from '../../../../endpoints/bank-account.service';

@Component({
  selector: 'app-nurse-profile',
  templateUrl: './nurse-profile.component.html',
  styleUrl: './nurse-profile.component.css',
  providers: [MessageService],
})
export class NurseProfileComponent implements OnInit {
  today = inject(NgbCalendar).getToday();
  id = '';
  singleNurse!: NurseResource | any;
  avatar_file!: string;
  visible: boolean = false;
  availabilityGroup!: FormGroup;
  user: any;

  bankAccount: BankAccount | null = null;
  showBankDialog: boolean = false;
  bankDialogMode: 'add' | 'edit' = 'add';

  completionForm!: FormGroup;
  completionSubmitting = false;
  degreeLoader = false;
  passportLoader = false;
  signatureLoader = false;
  idCardLoader = false;
  uploadedDegreeUrl: string | null = null;
  uploadedPassportUrl: string | null = null;
  uploadedSignatureUrl: string | null = null;
  uploadedIdCardUrl: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private userEndpoint: UserService,
    private readonly router: Router,
    private messageService: MessageService,
    private nurseEndpoint: NursesService,
    private authService: AuthService,
    private bankAccountService: BankAccountService,
    private http: HttpClient,
  ) {
    this.availabilityGroup = new FormGroup({
      checked: new FormControl<boolean>(true),
    });
    this.completionForm = new FormGroup({
      license_number: new FormControl('', Validators.required),
      med_school: new FormControl('', Validators.required),
      specialization: new FormControl('', Validators.required),
      grad_year: new FormControl('', Validators.required),
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'] || localStorage.getItem('id') || '';
    this.loadProfile();
    this.route.params.subscribe((p) => {
      this.id = p['id'] || localStorage.getItem('id') || '';
      this.loadProfile();
    });
  }

  get showRegistrationCompletion(): boolean {
    return !!this.user && this.user.registration_complete === false;
  }

  get showAddBankAccountShortcut(): boolean {
    return this.showRegistrationCompletion && !this.bankAccount && this.isNonBankProfileComplete();
  }

  scrollToBankAccountSection(): void {
    document.getElementById('profile-bank-account-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private isNonBankProfileComplete(): boolean {
    const n = this.singleNurse;
    if (!this.user || !n) {
      return false;
    }
    const fv = this.completionForm?.value;
    const lic = (fv?.license_number ?? n.license_number ?? '') as string;
    const med = (fv?.med_school ?? n.med_school ?? '') as string;
    const spec = (fv?.specialization ?? n.specialization ?? '') as string;
    const grad = fv?.grad_year ?? n.grad_year;

    if (!this.filledProfessionalValue(lic) || !this.filledProfessionalValue(med) || !this.filledProfessionalValue(spec)) {
      return false;
    }
    if (!this.gradYearOk(grad)) {
      return false;
    }

    const degree = this.stripFileKey(this.uploadedDegreeUrl) || n.degree_file;
    const signature = this.stripFileKey(this.uploadedSignatureUrl) || n.signature;
    const idCard = this.stripFileKey(this.uploadedIdCardUrl) || n.id_card;
    if (!this.filledProfessionalValue(degree) || !this.filledProfessionalValue(signature) || !this.filledProfessionalValue(idCard)) {
      return false;
    }

    const hasPassport = this.filledProfessionalValue(this.user.passport) || !!this.uploadedPassportUrl;
    return hasPassport;
  }

  private filledProfessionalValue(v: unknown): boolean {
    if (v === null || v === undefined) {
      return false;
    }
    if (typeof v === 'string') {
      return v.trim() !== '';
    }
    if (typeof v === 'number') {
      return Number.isFinite(v);
    }
    if (typeof v === 'boolean') {
      return v;
    }
    return false;
  }

  private gradYearOk(v: unknown): boolean {
    if (v === null || v === undefined || v === '') {
      return false;
    }
    const n = Number(v);
    return Number.isFinite(n) && n > 0;
  }

  loadProfile(): void {
    this.userEndpoint.get(this.id as any).subscribe({
      next: (response: any) => {
        this.user = response.user;
        this.avatar_file = environment.apiUrl + '/file/get/';
        const professionalId = this.user.nurses?.id;
        if (!professionalId) {
          return;
        }
        this.nurseEndpoint.getSingle(professionalId).subscribe({
          next: (res: any) => {
            this.singleNurse = res.nurse;
            this.patchCompletionForm();
          },
        });
        this.loadBankAccount();
        if (this.authService.user) {
          this.authService.login({ user: this.user });
        }
      },
    });
  }

  private patchCompletionForm(): void {
    const n = this.singleNurse;
    if (!n) {
      return;
    }
    this.completionForm.patchValue({
      license_number: n.license_number || '',
      med_school: n.med_school || '',
      specialization: n.specialization || '',
      grad_year: n.grad_year != null ? String(n.grad_year) : '',
    }, { emitEvent: false });
  }

  successAlert(message: any): void {
    this.messageService.add({ severity: 'success', detail: message });
  }

  dangerAlert(message: any): void {
    this.messageService.add({ severity: 'error', detail: message });
  }

  showDialog(): void {
    this.visible = true;
  }

  private stripFileKey(fullUrl: string | null): string | null {
    if (!fullUrl) {
      return null;
    }
    const prefix = environment.apiUrl + '/file/get/';
    if (fullUrl.startsWith(prefix)) {
      return fullUrl.slice(prefix.length);
    }
    return fullUrl;
  }

  handleCompletionUpload(event: Event, kind: 'degree' | 'passport' | 'signature' | 'id_card'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.setLoader(kind, true);
    if (!file) {
      this.setLoader(kind, false);
      return;
    }
    const fd = new FormData();
    fd.append('file', file, file.name);
    fd.append('visibility', 'public');
    this.http.post(`${environment.apiUrl}/upload`, fd).subscribe({
      next: (response: any) => {
        this.setLoader(kind, false);
        if (response?.success === false || !response?.data) {
          this.dangerAlert(response?.message || 'Upload failed');
          return;
        }
        const key = response.data as string;
        const url = environment.apiUrl + '/file/get/' + key;
        if (kind === 'degree') {
          this.uploadedDegreeUrl = url;
        } else if (kind === 'passport') {
          this.uploadedPassportUrl = url;
          this.userEndpoint.patchProfile(this.user.id, { passport: key }).subscribe({
            next: (r: any) => {
              this.user = r.user;
              this.successAlert('Passport saved');
            },
            error: () => this.dangerAlert('Could not save passport'),
          });
        } else if (kind === 'signature') {
          this.uploadedSignatureUrl = url;
        } else {
          this.uploadedIdCardUrl = url;
        }
        this.successAlert('Uploaded');
      },
      error: () => {
        this.setLoader(kind, false);
        this.dangerAlert('Upload failed');
      },
    });
    input.value = '';
  }

  private setLoader(kind: 'degree' | 'passport' | 'signature' | 'id_card', on: boolean): void {
    if (kind === 'degree') {
      this.degreeLoader = on;
    } else if (kind === 'passport') {
      this.passportLoader = on;
    } else if (kind === 'signature') {
      this.signatureLoader = on;
    } else {
      this.idCardLoader = on;
    }
  }

  submitRegistrationCompletion(): void {
    if (this.completionForm.invalid) {
      this.completionForm.markAllAsTouched();
      this.dangerAlert('Please fill all required fields');
      return;
    }
    const degree = this.stripFileKey(this.uploadedDegreeUrl) || this.singleNurse?.degree_file;
    const signature = this.stripFileKey(this.uploadedSignatureUrl) || this.singleNurse?.signature;
    const idCard = this.stripFileKey(this.uploadedIdCardUrl) || this.singleNurse?.id_card;
    if (!degree) {
      this.dangerAlert('Please upload your degree certificate');
      return;
    }
    if (!signature) {
      this.dangerAlert('Please upload your signature');
      return;
    }
    if (!idCard) {
      this.dangerAlert('Please upload your ID card');
      return;
    }
    if (!this.user?.passport && !this.uploadedPassportUrl) {
      this.dangerAlert('Please upload your passport photo');
      return;
    }
    const body = {
      license_number: this.completionForm.value.license_number,
      med_school: this.completionForm.value.med_school,
      specialization: this.completionForm.value.specialization,
      grad_year: String(this.completionForm.value.grad_year),
      degree_file: degree,
      signature,
      id_card: idCard,
    };
    this.completionSubmitting = true;
    this.nurseEndpoint.update(this.user.nurses.id, body as any).subscribe({
      next: () => {
        this.completionSubmitting = false;
        this.successAlert('Profile updated');
        this.loadProfile();
      },
      error: (err) => {
        this.completionSubmitting = false;
        this.dangerAlert(err?.error?.error || 'Update failed');
      },
    });
  }

  loadBankAccount(): void {
    if (this.user?.id) {
      this.bankAccountService.setUserId(String(this.user.id));
    }
    this.bankAccountService.getBankAccount().subscribe({
      next: (response: any) => {
        this.bankAccount = response.bank_account;
      },
      error: () => {
        this.bankAccount = null;
      },
    });
  }

  openBankDialog(mode: 'add' | 'edit'): void {
    this.bankDialogMode = mode;
    this.showBankDialog = true;
  }

  closeBankDialog(): void {
    this.showBankDialog = false;
  }

  onBankAccountSaved(bankAccount: BankAccount): void {
    this.bankAccount = bankAccount;
    this.showBankDialog = false;
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: this.bankDialogMode === 'add' ? 'Bank account added successfully' : 'Bank account updated successfully',
    });
    this.loadProfile();
  }

  get professionalName(): string {
    return this.user?.name || '';
  }

  back(): void {
    this.visible = false;
  }

}
