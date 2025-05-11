import { Component , OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../../endpoints/user.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
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

@Component({
  selector: 'app-profile-page',
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.css'
})
export class ProfilePageComponent implements OnInit {
  today = inject(NgbCalendar).getToday();
  id: string = this.route.snapshot.params['id'];
  singleClient!: ClientResource | any;
  avatar_file!: string;
  date: Date[] | undefined;
  visible: boolean = false;
  apptFormGroup!: FormGroup;
  appointments!:AppointmentResource[] | any;
  user_id: any;
  formData: any;
  preview: boolean = false;
  user: any;
  appointment: boolean = true;
  medicalRecords!: any[];
  viewMedRecordDialog: boolean = false;
  selectedMedRecord: any = null;


  
  constructor(
    private route: ActivatedRoute,
    private userEndpoint: UserService,
    private readonly router: Router,
    private messageService: MessageService,
    private clientEndpoint: ClientsService,
    private medicalEndpoint: MedicalService
  ) {
    this.apptFormGroup = new FormGroup({
      symptoms: new FormControl('', Validators.required),
      date: new FormControl('', Validators.required)
    })
  }

  ngOnInit(): void {
    // this.getSingleClient(this.id);
    this.user_id = localStorage.getItem('id');
    this.getUser();
    this.getClientRecord();

  }

  successAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }
  dangerAlert(message: any) {

    this.messageService.add({ severity: 'success', detail: message });
  }

  getClientRecord(){
    this.medicalEndpoint.getClient(this.user.clients.id).subscribe({
      next: (response: any) => {
        this.medicalRecords = response.record;
        console.table(this.medicalRecords)
        
    // this.getClient(this.user.id);

      },
      error:(error:any)=>{
        this.dangerAlert('Failed to get medical record');
      }})
  }

  getUser (){
    this.userEndpoint.get(this.user_id).subscribe({
      next: (response: any) => {
        this.user = response.user;
        
    // this.getClient(this.user.id);

        this.avatar_file = environment.apiUrl + '/file/get/';        
      }
    })
  }

  openMedRecordView(record: any) {
    this.selectedMedRecord = record;
    this.viewMedRecordDialog = true;
  }

  printMedRecord() {
    const printContents = document.getElementById('printable-med-record')?.innerHTML;
    if (printContents) {
      const printWindow = window.open('', '', 'height=600,width=800');
      if (printWindow) {
        printWindow.document.write('<html><head><title>Print Medical Record</title>');
        printWindow.document.write('<style>body{font-family:sans-serif;} .print-header{background:#6366f1;color:white;padding:1rem;} .print-section{margin:1rem 0;} .print-label{font-weight:bold;} .print-value{margin-left:0.5rem;} .print-footer{margin-top:2rem;}</style>');
        printWindow.document.write('</head><body >');
        printWindow.document.write(printContents);
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        printWindow.print();
      }
    }
  }


  showDialog() {
    this.visible = true;
  }
 
  back() {
    // this.visible = false;
    this.preview = false;

  }

 
 

}

