import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewChecked, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter, distinctUntilChanged } from 'rxjs/operators';
import { UserService } from '../../../../endpoints/user.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { environment } from '../../../../../environments/environment';
import { FormControl, FormGroup, Validators , FormBuilder} from '@angular/forms';
import { AppointmentsService } from '../../../../endpoints/appointments.service';
import { NgbCalendar, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
import moment from 'moment';
import { MessageService } from 'primeng/api';
import { ClientsService } from '../../../../endpoints/clients.service';
import { ClientResource } from '../../../../../resources/client.model';
import { AppointmentResource } from '../../../../../resources/appointment.model';
import { MedicalService } from '../../../../endpoints/medical.service';
import { NursesService } from '../../../../endpoints/nurses.service';
import { AssignmentsService } from '../../../../endpoints/assignments.service';
import { NurseResource } from '../../../../../resources/nurse.model';
import { ChatDialogService } from '../../../chat-dialog.service';
import { MessagesService } from '../../../../endpoints/messages.service';
import { error } from 'node:console';
import { MedicalRecordViewComponent } from '../../../../shared/components/medical-record-view/medical-record-view.component';






@Component({
  selector: 'app-client-profile',
  templateUrl: './client-profile.component.html',
  styleUrls: ['./client-profile.component.css']
})
export class ClientProfileComponent implements OnInit, AfterViewChecked, OnDestroy {
  today = inject(NgbCalendar).getToday();
  id!: string;
  singleClient!: ClientResource | any;
  private routeSubscription?: Subscription;
  private routerSubscription?: Subscription;
  private isComponentActive: boolean = true;
  singleNurse!: NurseResource | any;
  medRecord: boolean=false;
  avatar_file!: string;
  date: Date[] | undefined;
  visible: boolean = false;
  apptFormGroup!: FormGroup;
  appointments!: AppointmentResource[] | any;
  user_id: any;
  formData: any;
  preview: boolean = false;
  user: any;
  appointment: boolean = true;
  assignDialog: boolean = false;
  clients!: ClientResource[];
  nurses!: NurseResource[];
  disableAssignBtn: boolean = false;
  createAssignDiag: boolean = false;
  assignForm!: FormGroup;
  assignments!: any[];
  visibleMsg: boolean = false;
  display: boolean = false;
  medicalRecordForm!: FormGroup;
  viewMedRecordDialog: boolean = false;
  selectedMedRecord: any = null;

  position: string = 'center';

  messages: any[] = [];
  newMessage: string = '';
  receiver_id: any;
  @ViewChild('messageContainer') messageContainer!: ElementRef;
  medicalRecords!: any[];
  isLoading: boolean = true;
  savingMedicalRecord: boolean = false;
  private loadingFlags = {
    client: false,
    user: false,
    medicalRecords: false
  };



  constructor(
    private route: ActivatedRoute,
    private userEndpoint: UserService,
    private readonly router: Router,
    private messageService: MessageService,
    private nurseEndpoint: NursesService,
    private clientEndpoint: ClientsService,
    private medicalEndpoint: MedicalService,
    private assignmentEndpoint: AssignmentsService,
    private chatDialogService: ChatDialogService,
    private MessagesEnpoint: MessagesService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.assignForm = new FormGroup({
      assignment_message: new FormControl('', Validators.required),
      // diagnosis: new FormControl('', Validators.required)
    })
    this.medicalRecordForm = this.fb.group({
      record_number: ['', Validators.required],
      diagnosis: ['', Validators.required],
      past_diagnosis: [''],
      allergies: [''],
      treatment: ['']
    });
  }

  ngOnInit() {
    this.user_id = localStorage.getItem('id');
    
    // Subscribe to route parameter changes - this will fire on every navigation
    // Use paramMap for better Angular 17 compatibility
    this.routeSubscription = this.route.paramMap.subscribe(params => {
      const newId = params.get('id');
      if (newId) {
        // Always reload data, even if ID is the same (handles component reuse)
        if (newId !== this.id) {
          this.id = newId;
        }
        this.loadData();
      }
    });
    
    // Subscribe to router navigation events to detect when navigating to this component
    // This handles the case where component is reused with same ID
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (!this.isComponentActive) return;
      
      const currentUrl = event.urlAfterRedirects || event.url;
      const urlId = this.extractIdFromUrl(currentUrl);
      
      // If we're on a client profile route, reload data
      // This ensures data is refreshed even when component is reused
      if (urlId && (currentUrl.includes('/panel/clients/profile/') || currentUrl.includes('/clients/profile/'))) {
        // Update ID if different
        if (urlId !== this.id) {
          this.id = urlId;
        }
        // Always reload data when on this route (handles component reuse)
        // Use setTimeout to avoid multiple rapid calls and ensure component is ready
        setTimeout(() => {
          if (this.isComponentActive && this.router.url === currentUrl) {
            this.loadData();
          }
        }, 100);
      }
    });
  }

  private extractIdFromUrl(url: string): string | null {
    const match = url.match(/\/clients\/profile\/([^\/]+)/) || url.match(/\/profile\/([^\/]+)/);
    return match ? match[1] : null;
  }

  ngOnDestroy(): void {
    // Mark component as inactive
    this.isComponentActive = false;
    
    // Clean up subscriptions
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  private loadData(): void {
    // Reset loading state
    this.isLoading = true;
    this.loadingFlags = { client: false, user: false, medicalRecords: false };
    
    // Reset component state
    this.singleClient = null;
    this.medicalRecords = [];
    this.selectedMedRecord = null;
    
    // Load data
    if (this.id) {
      this.getSingleClient(this.id);
      this.getUser();
      this.getMedicalRecord();
    }
  }

  private checkLoadingComplete(): void {
    if (this.loadingFlags.client && this.loadingFlags.user && this.loadingFlags.medicalRecords) {
      this.isLoading = false;
    }
  }
  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }
  openChat() {
    this.chatDialogService.openChat('sender123', 'receiver456');
  }
  

  successAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }
  dangerAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }

  showMsgDialog(position: string) {
    this.position = position;
    this.visibleMsg = true;
    console.log('reached');
    // prepare and load message history with this client
    this.receiver_id = this.singleClient?.user_id;
    if (this.user_id && this.receiver_id) {
      const formData = {
        user_id: this.user_id,
        receiver_id: this.receiver_id
      };
      this.loadMessageHistory(formData);
    }
  }

  navigateToChat() {
    const receiverId = this.singleClient?.user_id || this.singleClient?.user?.id;
    if (!receiverId) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Unable to determine receiver ID' });
      return;
    }

    this.router.navigate([`/panel/messages/${receiverId}`], {
      queryParams: {
        name: this.singleClient?.user?.name,
        dp: this.singleClient?.user?.passport,
        email: this.singleClient?.user?.email,
        phoneno: this.singleClient?.user?.phoneno,
        gender: this.singleClient?.user?.gender,
        user_type: this.singleClient?.user?.user_type
      }
    });
  }
  showMedRecDialog() {
    // Generate a unique record number (timestamp + random string)
    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase();
    const recordNumber = `MR-${timestamp}-${randomStr}`;
    
    // Set the hidden fields
    this.medicalRecordForm.patchValue({
      client_id: this.singleClient.id, // Set from the current client
      assigned_doctor_id: this.user_id, // Set from logged in user
      record_number: recordNumber // Set the generated record number
    });
    
    this.display = true;
  }

  getMedicalRecord(){
    if (!this.user?.doctors?.id) {
      // If user is not loaded yet, wait for it
      setTimeout(() => {
        if (this.user?.doctors?.id) {
          this.loadMedicalRecords();
        } else {
          this.loadingFlags.medicalRecords = true;
          this.checkLoadingComplete();
        }
      }, 100);
      return;
    }
    this.loadMedicalRecords();
  }

  private loadMedicalRecords(): void {
    this.medicalEndpoint.getDoc(this.user.doctors.id).subscribe({
      next: (response: any) => {
        this.medicalRecords = response.record;
        console.table(this.medicalRecords);
        this.loadingFlags.medicalRecords = true;
        this.checkLoadingComplete();
      },
      error: (error: any) => {
        this.dangerAlert('Failed to get medical record');
        this.loadingFlags.medicalRecords = true;
        this.checkLoadingComplete();
      }
    });
  }
  
  onSubmit(event?: Event) {
    if (event) {
      event.preventDefault();
    }
    
    if (this.medicalRecordForm.valid) {
      // Set loading state
      this.savingMedicalRecord = true;
      
      // Log form values for debugging
      console.log('Medical Record Data:', this.medicalRecordForm.value);
      // Determine which professional ID to use (doctor or other_professional)
      const professionalId = this.user.doctors?.id || this.user.other_professionals?.id;
      if (!professionalId) {
        this.dangerAlert('Unable to determine healthcare provider');
        this.savingMedicalRecord = false;
        return;
      }

      const formData: any = {
        client_id: this.singleClient.id,
        record_number: this.medicalRecordForm.value.record_number,
        diagnosis: this.medicalRecordForm.value.diagnosis,
        past_diagnosis: this.medicalRecordForm.value.past_diagnosis,
        allergies: this.medicalRecordForm.value.allergies,
        treatment: this.medicalRecordForm.value.treatment,
      };

      // Set the appropriate professional ID based on user type
      if (this.user.doctors?.id) {
        formData.assigned_doctor_id = this.user.doctors.id;
      } else if (this.user.other_professionals?.id) {
        formData.other_professional_id = this.user.other_professionals.id;
      }
      // Send to your medical records service
      this.medicalEndpoint.create(formData).subscribe({
        next: (response: any) => {
          console.log('Medical record created:', response);
          this.successAlert('Medical record created successfully');
          // Reset loading state
          this.savingMedicalRecord = false;
          // Close dialog immediately
          this.display = false;
          // Force change detection to ensure dialog closes
          this.cdr.detectChanges();
          // Reset form
          this.medicalRecordForm.reset();
          // Refresh medical records list
          this.getMedicalRecord();
        },
        error: (error: any) => {
          console.error('Error creating medical record:', error);
          this.dangerAlert('Failed to create medical record');
          // Reset loading state on error
          this.savingMedicalRecord = false;
          this.display = false;

        }
      });
    } else {
      // Mark fields as touched to show validation errors
      this.medicalRecordForm.markAllAsTouched();
    }
    // this.display = false;

  }
  sendMessage() {
    if (this.newMessage.trim()) {
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // push to local list
      this.messages.push({
        sender_id: this.user_id,
        message: this.newMessage,
        created_at: timestamp,
      });
      const formData = {
        sender_id: this.user_id,
        receiver_id: this.receiver_id || this.singleClient?.user_id,
        message: this.newMessage
      };
      this.MessagesEnpoint.sendMessage(formData).subscribe({
        next: (response: any) => {
          console.log('Message sent', response);
        },
        error: (error: any) => {
          console.error(error);
        }
      });
      this.newMessage = '';
      this.scrollToBottom();
    }
  }

  loadMessageHistory(formData: any) {
    this.MessagesEnpoint.getMessageHistory(formData).subscribe({
      next: (response: any) => {
        this.messages = response.data || [];
        setTimeout(() => this.scrollToBottom(), 100);
      },
      error: (error: any) => {
        console.error('Failed to load message history', error);
      }
    });
  }

  scrollToBottom(): void {
    try {
      if (this.messageContainer && this.messageContainer.nativeElement) {
        this.messageContainer.nativeElement.scrollTop =
          this.messageContainer.nativeElement.scrollHeight;
      }
    } catch (err) {
      // no-op
    }
  }

  assign() {
    this.nurseEndpoint.get().subscribe({
      next: (response: any) => {
        this.nurses = response.nurse;
        this.assignDialog = true;
      }
    })

  }

  nurseSelect(nurse_id: any) {
    this.disableAssignBtn = true;
    this.nurseEndpoint.getSingle(nurse_id).subscribe({
      next: (response: any) => {
        this.singleNurse = response.nurse;
        this.assignDialog = false;
        this.disableAssignBtn = false;
        this.createAssignDiag = true;

      }
    })


  }

  createAssign() {
    console.log('medData', this.singleClient.user.id);

    const assignmentFormData = {
      assigned_doctor_id: this.user_id,
      assigned_nurse_id: this.singleNurse.id,
      assigned_client_id: this.singleClient.id,
      assignment_message: this.assignForm.value.assignment_message,
      status: 'pending',

    }

    this.assignmentEndpoint.create(assignmentFormData).subscribe({
      next: (response: any) => {
        console.log('assignment created', response);
        this.createAssignDiag = false;
        this.getAssignment(this.singleNurse.id);


      }
    })

  }

  getsingleNurse(id: any) {
    this.nurseEndpoint.getSingle(id).subscribe({
      next: (response: any) => {
        this.singleNurse = response.nurse;
        this.getAssignment(this.singleNurse.id);
        console.log('APPOINTEMENTS', this.singleNurse);
        this.userEndpoint.get(this.singleNurse.user_id).subscribe({
          next: (response: any) => {
            this.user = response.user;
          }
        })
        // this.appointments = this.singleNurse.appointments;
        // const appointmentDate = new Date(this.appointments.date_time);
        // const today = new Date();
        // if(appointmentDate.getDate() < today.getDate()){
        //   this.appointment=false;
        // }

        this.avatar_file = environment.apiUrl + '/file/get/';
        // this.router.navigate([`/doctors/profile/${this.SingleDoctor.id}`])
      }
    })
  }

  getAssignment(id: any) {
    this.assignmentEndpoint.get(id).subscribe({
      next: (response: any) => {
        this.assignments = response.assignment;
      }
    })
  }

  getUser() {
    this.userEndpoint.get(this.user_id).subscribe({
      next: (response: any) => {
        this.user = response.user;
        this.avatar_file = environment.apiUrl + '/file/get/';
        this.loadingFlags.user = true;
        this.checkLoadingComplete();
        // If medical records weren't loaded yet, try again now that user is loaded
        if (!this.loadingFlags.medicalRecords && this.user?.doctors?.id) {
          this.loadMedicalRecords();
        }
      },
      error: (error: any) => {
        this.loadingFlags.user = true;
        this.checkLoadingComplete();
      }
    });
  }




  showDialog() {
    this.visible = true;
  }
  getSingleClient(id: any) {
    this.clientEndpoint.getClient(id).subscribe({
      next: (response: any) => {
        this.singleClient = response.client;
        this.appointments = this.singleClient.appointments;
        if (this.appointments?.date_time) {
          const appointmentDate = new Date(this.appointments.date_time);
          const today = new Date();
          if (appointmentDate.getDate() < today.getDate()) {
            this.appointment = false;
          }
        }
        console.log('APPOINTEMENTS', this.appointments);
        this.avatar_file = environment.apiUrl + '/file/get/';
        this.loadingFlags.client = true;
        this.checkLoadingComplete();
      },
      error: (error: any) => {
        this.loadingFlags.client = true;
        this.checkLoadingComplete();
      }
    });
  }

  back() {
    // this.visible = false;
    this.preview = false;

  }

  openMedRecordView(record: any) {
    this.selectedMedRecord = record;
    this.viewMedRecordDialog = true;
  }

}

