import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { UserService } from '../../../../endpoints/user.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { OtherProfessionalsService } from '../../../../endpoints/other-professionals.service';
import { BankAccountService } from '../../../../endpoints/bank-account.service';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { environment } from '../../../../../environments/environment';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AppointmentsService } from '../../../../endpoints/appointments.service';
import { NgbCalendar, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { ClientsService } from '../../../../endpoints/clients.service';
import { ClientResource } from '../../../../../resources/client.model';
import { AppointmentResource } from '../../../../../resources/appointment.model';
import { MedicalService } from '../../../../endpoints/medical.service';
import { AuthService } from '../../../../auth.service';
import { BankAccount } from '../../../../models/bank-account.model';




@Component({
  selector: 'app-doctor-profile',
  templateUrl: './doctor-profile.component.html',
  styleUrl: './doctor-profile.component.css',
  providers: [MessageService],
})
export class DoctorProfileComponent implements OnInit {
  today = inject(NgbCalendar).getToday();
  id: string = this.route.snapshot.params['id'];
  singleDoctor!: ClientResource | any;
  singleOtherProfessional!: any;
  professionalType: 'doctor' | 'other_professional' = 'doctor';
  avatar_file!: string;
  date: Date[] | undefined;
  visible: boolean = false;
  availabilityGroup!: FormGroup;
  appointments!:AppointmentResource[] | any;
  user_id: any;
  formData: any;
  preview: boolean = false;
  user: any;
  appointment: boolean = true;
  medicalRecords!: any[];

  // Bank Account
  bankAccount: BankAccount | null = null;
  showBankDialog: boolean = false;
  bankDialogMode: 'add' | 'edit' = 'add';

  completionForm!: FormGroup;
  completionSubmitting = false;
  degreeLoader = false;
  passportLoader = false;
  signatureLoader = false;
  idCardLoader = false;
  degreeFileKey: string | null = null;
  passportFileKey: string | null = null;
  signatureFileKey: string | null = null;
  idCardFileKey: string | null = null;
  uploadedDegreeUrl: string | null = null;
  uploadedPassportUrl: string | null = null;
  uploadedSignatureUrl: string | null = null;
  uploadedIdCardUrl: string | null = null;

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
    { label: 'Other', value: 'Other' },
  ];

  constructor(
    private route: ActivatedRoute,
    private userEndpoint: UserService,
    private readonly router: Router,
    private messageService: MessageService,
    private doctorEndpoint: DoctorsService,
    private otherProfessionalEndpoint: OtherProfessionalsService,
    private medicalEndpoint: MedicalService,
    private authService: AuthService,
    private bankAccountService: BankAccountService,
    private http: HttpClient,
  ) {
    this.availabilityGroup = new FormGroup({
      checked: new FormControl<boolean>(false)
    });
    this.completionForm = new FormGroup({
      license_number: new FormControl(''),
      med_school: new FormControl('', Validators.required),
      specialization: new FormControl('', Validators.required),
      grad_year: new FormControl('', Validators.required),
      professional_type: new FormControl(''),
    });
  }

  ngOnInit(): void {
    this.user_id = localStorage.getItem('id');
    this.id = this.route.snapshot.params['id'] || this.user_id || '';
    this.getUser();
    this.route.params.subscribe((p) => {
      this.id = p['id'] || this.user_id || '';
      this.getUser();
    });

    this.availabilityGroup.get('checked')?.valueChanges.subscribe((checked: boolean) => {
      if (this.user?.registration_complete && this.singleDoctor?.id && this.professionalType === 'doctor') {
        this.toggleAvailability(checked);
      }
    });
  }

  successAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }
  dangerAlert(message: any) {
    this.messageService.add({ severity: 'error', detail: message });
  }

  getUser(): void {
    const uid = this.id || this.user_id;
    this.userEndpoint.get(uid as any).subscribe({
      next: (response: any) => {
        this.user = response.user;
        this.avatar_file = environment.apiUrl + '/file/get/';

        if (this.user.user_type === 'doctor' && this.user.doctors?.id) {
          this.professionalType = 'doctor';
          this.getsingleDoctor(this.user.doctors.id);
          if (this.user.registration_complete && this.user.doctors.availability !== undefined && this.user.doctors.availability !== null) {
            const availability = this.convertToBoolean(this.user.doctors.availability);
            this.availabilityGroup.patchValue({ checked: availability }, { emitEvent: false });
          }
        } else if (this.user.user_type === 'other_professional' && this.user.other_professionals?.id) {
          this.professionalType = 'other_professional';
          this.getsingleOtherProfessional(this.user.other_professionals.id);
        }

        this.patchCompletionFormFromUser();
        this.loadBankAccount();
        if (this.authService.user) {
          this.authService.login({ user: this.user });
        }
      }
    });
  }

  get showRegistrationCompletion(): boolean {
    return !!this.user && this.user.registration_complete === false;
  }

  /** Credentials/uploads satisfied; only bank (or API lag) keeps registration incomplete */
  get showAddBankAccountShortcut(): boolean {
    return this.showRegistrationCompletion && !this.bankAccount && this.isNonBankProfileComplete();
  }

  scrollToBankAccountSection(): void {
    document.getElementById('profile-bank-account-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private isNonBankProfileComplete(): boolean {
    const row = this.user?.doctors || this.user?.other_professionals;
    if (!this.user || !row) {
      return false;
    }
    const fv = this.completionForm?.value;
    const med = (fv?.med_school ?? row.med_school ?? '') as string;
    const spec = (fv?.specialization ?? row.specialization ?? '') as string;
    const grad = fv?.grad_year ?? row.grad_year;

    if (!this.filledProfessionalValue(med) || !this.filledProfessionalValue(spec) || !this.gradYearOk(grad)) {
      return false;
    }

    if (this.professionalType === 'other_professional') {
      const pt = (fv?.professional_type ?? (row as { professional_type?: string }).professional_type ?? '') as string;
      if (!this.filledProfessionalValue(pt)) {
        return false;
      }
    } else {
      const lic = (fv?.license_number ?? row.license_number ?? '') as string;
      if (!this.filledProfessionalValue(lic)) {
        return false;
      }
    }

    const hasDegree = this.filledProfessionalValue(row.degree_file) || !!this.degreeFileKey;
    const hasSig = this.filledProfessionalValue(row.signature) || !!this.signatureFileKey;
    const hasId = this.filledProfessionalValue(row.id_card) || !!this.idCardFileKey;
    const hasPassport = this.filledProfessionalValue(this.user.passport) || !!this.passportFileKey;

    return hasDegree && hasSig && hasId && hasPassport;
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

  private patchCompletionFormFromUser(): void {
    if (!this.user) {
      return;
    }
    const d = this.user.doctors;
    const o = this.user.other_professionals;
    const row = d || o;
    if (!row) {
      return;
    }
    this.completionForm.patchValue({
      license_number: row.license_number || '',
      med_school: row.med_school || '',
      specialization: row.specialization || '',
      grad_year: row.grad_year != null ? String(row.grad_year) : '',
      professional_type: o?.professional_type || '',
    }, { emitEvent: false });
    if (this.user.user_type === 'other_professional') {
      this.completionForm.get('professional_type')?.setValidators([Validators.required]);
      this.completionForm.get('license_number')?.clearValidators();
    } else {
      this.completionForm.get('professional_type')?.clearValidators();
      this.completionForm.get('license_number')?.setValidators([Validators.required]);
    }
    this.completionForm.get('professional_type')?.updateValueAndValidity();
    this.completionForm.get('license_number')?.updateValueAndValidity();
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
          this.degreeFileKey = key;
          this.uploadedDegreeUrl = url;
        } else if (kind === 'passport') {
          this.passportFileKey = key;
          this.uploadedPassportUrl = url;
          this.userEndpoint.patchProfile(this.user.id, { passport: key }).subscribe({
            next: (r: any) => {
              this.user = r.user;
              this.successAlert('Passport saved');
            },
            error: () => this.dangerAlert('Could not save passport'),
          });
        } else if (kind === 'signature') {
          this.signatureFileKey = key;
          this.uploadedSignatureUrl = url;
        } else {
          this.idCardFileKey = key;
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
    if (!this.degreeFileKey && !this.user?.doctors?.degree_file && !this.user?.other_professionals?.degree_file) {
      this.dangerAlert('Please upload your degree certificate');
      return;
    }
    if (!this.signatureFileKey && !this.user?.doctors?.signature && !this.user?.other_professionals?.signature) {
      this.dangerAlert('Please upload your signature');
      return;
    }
    if (!this.idCardFileKey && !this.user?.doctors?.id_card && !this.user?.other_professionals?.id_card) {
      this.dangerAlert('Please upload your ID card');
      return;
    }
    if (!this.user?.passport && !this.passportFileKey) {
      this.dangerAlert('Please upload your passport photo');
      return;
    }

    const degree = this.stripFileKey(this.uploadedDegreeUrl) || this.user?.doctors?.degree_file || this.user?.other_professionals?.degree_file;
    const signature = this.stripFileKey(this.uploadedSignatureUrl) || this.user?.doctors?.signature || this.user?.other_professionals?.signature;
    const idCard = this.stripFileKey(this.uploadedIdCardUrl) || this.user?.doctors?.id_card || this.user?.other_professionals?.id_card;

    const base: any = {
      license_number: this.completionForm.value.license_number || null,
      med_school: this.completionForm.value.med_school,
      specialization: this.completionForm.value.specialization,
      grad_year: parseInt(String(this.completionForm.value.grad_year), 10),
      degree_file: degree,
      signature,
      id_card: idCard,
    };

    this.completionSubmitting = true;

    const done = () => {
      this.completionSubmitting = false;
      this.successAlert('Profile updated');
      this.getUser();
    };

    if (this.professionalType === 'doctor' && this.user.doctors?.id) {
      this.doctorEndpoint.update(this.user.doctors.id, base).subscribe({
        next: () => done(),
        error: (err) => {
          this.completionSubmitting = false;
          this.dangerAlert(err?.error?.error || 'Update failed');
        },
      });
    } else if (this.professionalType === 'other_professional' && this.user.other_professionals?.id) {
      this.otherProfessionalEndpoint.update(this.user.other_professionals.id, {
        ...base,
        professional_type: this.completionForm.value.professional_type,
      }).subscribe({
        next: () => done(),
        error: (err) => {
          this.completionSubmitting = false;
          this.dangerAlert(err?.error?.error || 'Update failed');
        },
      });
    } else {
      this.completionSubmitting = false;
      this.dangerAlert('No professional profile found');
    }
  }

  // Helper function to properly convert availability value to boolean
  private convertToBoolean(value: any): boolean {
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      return value === '1' || value.toLowerCase() === 'true';
    }
    if (typeof value === 'number') {
      return value === 1;
    }
    return false;
  }

 


  showDialog() {
    this.visible = true;
  }
  
  getsingleDoctor(id: any) {
    this.doctorEndpoint.getSingle(id).subscribe({
      next: (response: any) => {
        this.singleDoctor = response.doctor;
        if (this.user?.registration_complete) {
          this.loadMedicalRecords(this.singleDoctor.id);
        }

        this.appointments = this.singleDoctor.appointments;
        if (this.appointments && this.appointments.date_time) {
          const appointmentDate = new Date(this.appointments.date_time);
          const today = new Date();
          if(appointmentDate.getDate() < today.getDate()){
            this.appointment=false;
          }
        }
        console.log('APPOINTEMENTS', this.appointments);
        
        // Initialize availability toggle with current doctor availability
        if (this.singleDoctor?.availability !== undefined) {
          const availability = this.convertToBoolean(this.singleDoctor.availability);
          this.availabilityGroup.patchValue({ checked: availability }, { emitEvent: false });
        }
        
        this.avatar_file = environment.apiUrl + '/file/get/';
      }
    })
  }

  getsingleOtherProfessional(id: any) {
    this.otherProfessionalEndpoint.getSingle(id).subscribe({
      next: (response: any) => {
        this.singleOtherProfessional = response.other_professional;
        // Note: Medical records might not be applicable for other_professionals
        // this.loadMedicalRecords(this.singleOtherProfessional.id);
        
        this.avatar_file = environment.apiUrl + '/file/get/';
      },
      error: (error: any) => {
        console.error('Error loading other professional:', error);
      }
    })
  }

  openMedRecordView(record: any) {
    // this.selectedMedRecord = record;
    // this.viewMedRecordDialog = true;
  }

  private loadMedicalRecords(id: any): void {
    console.log('USER', this.user);
    this.medicalEndpoint.getDoc(id).subscribe({
      next: (response: any) => {
        this.medicalRecords = response.record;
        console.table(this.medicalRecords);
        // this.loadingFlags.medicalRecords = true;
        // this.checkLoadingComplete();
      },
      error: (error: any) => {
        this.dangerAlert('Failed to get medical record');
        // this.loadingFlags.medicalRecords = true;
        // this.checkLoadingComplete();
      }
    });
  }

  toggleAvailability(availability: boolean) {
    if (!this.singleDoctor?.id) {
      return;
    }
    
    this.doctorEndpoint.toggleAvailability(this.singleDoctor.id, availability).subscribe({
      next: (response: any) => {
        this.successAlert(response.message || 'Availability updated successfully');
        // Update local doctor data
        if (response.doctor) {
          this.singleDoctor.availability = response.doctor.availability;
          // Also update user.doctors.availability if it exists
          if (this.user?.doctors) {
            this.user.doctors.availability = response.doctor.availability;
          }
        }
      },
      error: (error: any) => {
        this.dangerAlert('Failed to update availability');
        // Revert the toggle on error
        this.availabilityGroup.patchValue({ checked: !availability }, { emitEvent: false });
      }
    });
  }

  back() {
    // this.visible = false;
    this.preview = false;

  }

  // Bank Account Methods
  loadBankAccount(): void {
    // Set user_id for the service
    if (this.user_id) {
      this.bankAccountService.setUserId(this.user_id);
    }
    this.bankAccountService.getBankAccount().subscribe({
      next: (response: any) => {
        this.bankAccount = response.bank_account;
      },
      error: () => {
        // Bank account not found is okay, just means none set up yet
        this.bankAccount = null;
      }
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
      detail: this.bankDialogMode === 'add' ? 'Bank account added successfully' : 'Bank account updated successfully'
    });
  }

  get professionalName(): string {
    return this.user?.name || '';
  }

}

