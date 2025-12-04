import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../endpoints/user.service';
import { UserResource } from '../../../../resources/user.model';
import { AppointmentsService } from '../../../endpoints/appointments.service';
import { DoctorsService } from '../../../endpoints/doctors.service';
import { DoctorResource } from '../../../../resources/doctor.model';
import { AppointmentResource } from '../../../../resources/appointment.model';
import { environment } from '../../../../environments/environment';
import { Table } from 'primeng/table';
import { response } from 'express';
import { AssignmentsService } from '../../../endpoints/assignments.service';
@Component({
  selector: 'app-assignments',
  templateUrl: './assignments.component.html',
  styleUrl: './assignments.component.css'
})
export class AssignmentsComponent implements OnInit {
  apptDetails: boolean = false;
  id: any;
  user!: any;
  appointment!: AppointmentResource[];
  avatar_file!: string;
  searchValue: string | undefined;
  singleAppt: any = '';
  pendingAppointment: any;
  acceptedAppointment: any;
  declinedAppointment: any;
  btnDisable: boolean = false;


  constructor(
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
    private appointmentEndpoint: AssignmentsService,
  ) {

  }

  ngOnInit(): void {
    this.id = localStorage.getItem('id')

    this.getUser();
  }
  getUser() {
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user
        this.avatar_file = environment.apiUrl + '/file/get/';
        // Handle both nurses and other_professionals
        const professionalId = this.user.nurses?.id || this.user.other_professionals?.id;
        
        if (!professionalId) {
          console.error('No nurse or other_professional ID found');
          return;
        }
        
        this.appointmentEndpoint.get(professionalId).subscribe({
          next: (response: any) => {
            this.appointment = response.assignment;
            this.pendingAppointment = this.appointment.filter((user: any) => user.status=='pending').length;
            this.acceptedAppointment = this.appointment.filter((user: any) => user.status=='done').length;
          
          }
        })

      }
    })
  }

  viewAppt(appt_id: any) {
    this.appointmentEndpoint.getSingle(appt_id).subscribe({
      next: (response: any) => {
        this.singleAppt = response.assignment[0];
        this.apptDetails = true;
      }
    })
  }

  
  clear(table: Table) {
    table.clear();
    this.searchValue = ''
  }

  status(id: any, status: any) {
    this.btnDisable=true;
    if (status == 'done') {
      const formData = {
        status: 'done'
      }
      this.editStatus(id, formData);
      this.getUser();

      return;
    } else if (status == 'Declined') {
      const formData = {
        status: 'Declined'
      }
      this.editStatus(id, formData);
      this.getUser();

      return;
    } else {
      const formData = {
        status: 'pending'
      }
      this.editStatus(id, formData);
      this.getUser();

      return;

    }
  }

  editStatus(id: any, status: any) {

    this.appointmentEndpoint.edit(id, status).subscribe({
      next: (response: any) => {
        // this.apptDetails = false;
        // this.viewAppt(id);
        this.btnDisable=false;

      }
    })
  }
}
