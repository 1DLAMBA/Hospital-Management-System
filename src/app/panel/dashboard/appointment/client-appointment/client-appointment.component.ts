import { Component , OnInit } from '@angular/core';
import { UserService } from '../../../../endpoints/user.service';
import { UserResource } from '../../../../../resources/user.model';
import { AppointmentsService } from '../../../../endpoints/appointments.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { AppointmentResource } from '../../../../../resources/appointment.model';
import { environment } from '../../../../../environments/environment';
import { Table } from 'primeng/table';
import { response } from 'express';

@Component({
  selector: 'app-client-appointment',
  templateUrl: './client-appointment.component.html',
  styleUrl: './client-appointment.component.css'
})
export class ClientAppointmentComponent implements OnInit {
  apptDetails: boolean = false;
  id: any;
  user!: any;
  appointment!: AppointmentResource[] | any;
  avatar_file!: string;
  searchValue: string | undefined;
  singleAppt: any = '';
  pendingAppointment: any;
  acceptedAppointment: any;
  declinedAppointment: any;
  btnDisable: boolean = false;
  acceptedAppointmentNum: any;
  futureAppointment!: AppointmentResource | any;
  today: Date = new Date();



  constructor(
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
    private appointmentEndpoint: AppointmentsService,
  ) {

  }

  ngOnInit(): void {
    this.id = localStorage.getItem('id')

    this.getUser();
  }
  getAppt(id: any){
    this.appointmentEndpoint.get(id, 'client').subscribe({
      next: (response: any) => {
        this.appointment = response.appointments;
        this.pendingAppointment = this.appointment.filter((user: any) => user.status=='pending').length;
        this.acceptedAppointment = this.appointment.filter((user: any) => user.status=='Accepted').length;
        this.declinedAppointment = this.appointment.filter((user: any) => user.status=='Declined').length;
        this.today = new Date();
        const nowTs = this.today.getTime();

        // Compute the single next upcoming appointment (ignore past)
        const upcoming = (this.appointment || [])
          .map((appt: any) => ({ ...appt, _dt: new Date(appt.date_time) }))
          .filter((appt: any) => {
            const t = appt._dt?.getTime?.() || new Date(appt.date_time).getTime();
            return (
              t >= nowTs && (appt.status === 'Accepted' || appt.status === 'pending')
            );
          })
          .sort((a: any, b: any) => a._dt.getTime() - b._dt.getTime());

        this.futureAppointment = upcoming.length ? upcoming[0] : null;

        console.log('Next upcoming appointment:', this.futureAppointment);

      }
    })
  }
  getUser() {
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user;
        
        this.avatar_file = environment.apiUrl + '/file/get/';
        this.getAppt(this.user.clients.id)
        

      }
    })
  }

  delete(appt_id: any) {
    this.appointmentEndpoint.delete(appt_id).subscribe({
      next: (response: any) => {
        console.log(response);
        this.getAppt(this.user.clients.id);
      }
    })
  }

  clear(table: Table) {
    table.clear();
    this.searchValue = ''
  }

  status(id: any, status: any) {
    this.btnDisable=true;
    if (status == 'Accepted') {
      const formData = {
        status: 'Accepted'
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
        this.delete(id);
        this.btnDisable=false;

      }
    })
  }
}

