import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../endpoints/user.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
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
import { NursesService } from '../../../../endpoints/nurses.service';
import { NurseResource } from '../../../../../resources/nurse.model';
import { AuthService } from '../../../../auth.service';
import { BankAccount } from '../../../../models/bank-account.model';


@Component({
  selector: 'app-nurse-profile',
  templateUrl: './nurse-profile.component.html',
  styleUrl: './nurse-profile.component.css'
})
export class NurseProfileComponent  implements OnInit {
  today = inject(NgbCalendar).getToday();
  id: string = this.route.snapshot.params['id'];
  singleNurse!: NurseResource | any;
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

  // Bank Account
  bankAccount: BankAccount | null = null;
  showBankDialog: boolean = false;
  bankDialogMode: 'add' | 'edit' = 'add';


  
  constructor(
    private route: ActivatedRoute,
    private userEndpoint: UserService,
    private readonly router: Router,
    private messageService: MessageService,
    private nurseEndpoint: NursesService,
    private authService: AuthService,
    private bankAccountService: BankAccountService,
  ) {
    this.availabilityGroup = new FormGroup({
      checked: new FormControl<boolean>(true)
    })
  }

  ngOnInit(): void {
    this.getsingleNurse(this.id);
    // this.user_id = localStorage.getItem('id');
    // this.getUser();
    

  }

  successAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }
  dangerAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }

  

 


  showDialog() {
    this.visible = true;
  }
  getsingleNurse(id: any) {
    this.userEndpoint.get(id).subscribe({
      next:(response: any)=>{
        this.user = response.user;
        console.log('APPOINTEMENTS', this.singleNurse);

        // Handle both nurses and other_professionals
        const professionalId = this.user.nurses?.id || this.user.other_professionals?.id;
        if (!professionalId) {
          console.error('No nurse or other_professional ID found');
          return;
        }
        this.nurseEndpoint.getSingle(professionalId).subscribe({
          next: (response: any) => {
            this.singleNurse = response.nurse;
          }
        })
        // this.appointments = this.singleNurse.appointments;
        // const appointmentDate = new Date(this.appointments.date_time);
        // const today = new Date();
        // if(appointmentDate.getDate() < today.getDate()){
        //   this.appointment=false;
        // }
        
        this.avatar_file = environment.apiUrl + '/file/get/';
        
        // Load bank account
        this.loadBankAccount();
        // this.router.navigate([`/doctors/profile/${this.SingleDoctor.id}`])
      }
    })
  }

  // Bank Account Methods
  loadBankAccount(): void {
    // Set user_id for the service
    if (this.user?.id) {
      this.bankAccountService.setUserId(this.user.id);
    }
    this.bankAccountService.getBankAccount().subscribe({
      next: (response: any) => {
        this.bankAccount = response.bank_account;
      },
      error: () => {
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

  back() {
    // this.visible = false;
    this.preview = false;

  }

  navigateToChat(): void {
    if (this.user && this.user.id) {
      this.router.navigate(['/panel/dashboard/messages/chat'], { 
        queryParams: { 
          receiver_id: this.user.id,
          name: this.user.name,
          avatar: this.user.passport
        } 
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Unable to start chat. User information is not available.'
      });
    }
  }

  editProfile() {
    // Navigate to edit profile page or open edit dialog
    // For now, we'll navigate to an edit profile route
    this.router.navigate(['/panel/dashboard/my-profile/nurse-profile/edit']);
  }

  logout() {
    // Call auth service logout (which clears localStorage)
    this.authService.logout();
    // Clear all localStorage (including id)
    localStorage.clear();
    // Navigate to login page
    this.router.navigate(['/login']);
  }
}
