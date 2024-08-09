import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../endpoints/user.service';
import { UserResource } from '../../../../../resources/user.model';
import { AppointmentsService } from '../../../../endpoints/appointments.service';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { response } from 'express';
import { ActivatedRoute } from '@angular/router';
import { AppointmentResource } from '../../../../../resources/appointment.model';
import moment from 'moment';



@Component({
  selector: 'app-doctor-panel',
  templateUrl: './doctor-panel.component.html',
  styleUrl: './doctor-panel.component.css'
})
export class DoctorPanelComponent implements OnInit {
  id: any;
  user!: any;
  data: any;
  options: any;
  products!: any;
  date: Date[] | undefined;
  upc_appt!: any[];
  doctor!: DoctorResource;
  appointment: AppointmentResource[] | any;
  acceptedAppointment!: AppointmentResource[];
  pendingAppointment!: number;
  recentAppt!: any;
  complaint!: string;
  acceptedAppointmentNum: any;
  today!: Date;
  previousAppointment!: AppointmentResource[];
  ThisMonth: any;


  constructor(
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
    private appointmentEndpoint: AppointmentsService,
  ) {
   
  }
  ngOnInit(): void {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.8,
      plugins: {
        legend: {
          labels: {
            color: 'white'
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: 'white',
            font: {
              weight: 500
            }
          },
          grid: {
            color: '#31385261',
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: 'white'
          },
          grid: {
            color: '#31385261',
            drawBorder: false
          }
        }

      }
    };
    this.products = [
      {
        name: 'John Doe',
        serial: '1',
        category: 'gyan',
        patient: 'good'
      },
      {
        name: 'Samuel Larry',
        serial: '2',
        category: 'gyan',
        patient: 'good'
      },
      {
        name: 'Gideon Oj',
        serial: '3',
        category: 'Dark',
        patient: 'good'
      },
    ]
    this.id = localStorage.getItem('id')
    this.getUser();
    this.getDocUser();
    this.getDocAppt();
  }

  splitComplaint(complaint: string) {
    const words = complaint.split(' ');
    return words.slice(0, 2).join(' ');

  }

  getUser() {
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user
        this.appointmentEndpoint.get(this.user.doctors.id, 'doctor').subscribe({
          next: (response: any) => {
            this.appointment = response.appointments;
            const jan= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'Accepted' && month === '01';
            }).length;
            const feb= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'Accepted' && month === '02';
            }).length;
            const mar= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'Accepted' && month === '03';
            }).length;
            const apr= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'Accepted' && month === '04';
            }).length;
            const may= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'Accepted' && month === '05';
            }).length;
            const jun= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'Accepted' && month === '06';
            }).length;
            const jul= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'Accepted' && month === '07';
            }).length;
            const aug= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'Accepted' && month === '08';
            }).length;
            const sep= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'Accepted' && month === '09';
            }).length;
            const oct= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'Accepted' && month === '10';
            }).length;
            const nov= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'Accepted' && month === '11';
            }).length;
            const dec= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'Accepted' && month === '12';
            }).length;



            const DEC_jan= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'pending' && month === '01';
            }).length;
            const DEC_feb= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'pending' && month === '02';
            }).length;
            const DEC_mar= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'pending' && month === '03';
            }).length;
            const DEC_apr= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'pending' && month === '04';
            }).length;
            const DEC_may= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'pending' && month === '05';
            }).length;
            const DEC_jun= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'pending' && month === '06';
            }).length;
            const DEC_jul= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'pending' && month === '07';
            }).length;
            const DEC_aug= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'pending' && month === '08';
            }).length;
            const DEC_sep= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'pending' && month === '09';
            }).length;
            const DEC_oct= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'pending' && month === '10';
            }).length;
            const DEC_nov= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'pending' && month === '11';
            }).length;
            const DEC_dec= this.appointment.filter((appointment: any) => {
              const month = moment(appointment.date_time).format('MM');
              return appointment.status === 'pending' && month === '12';
            }).length;

            this.data = {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [
                {
                  label: 'Accepted',
                  backgroundColor: '#0055aa',
                  borderColor: '#0055aa',
                  data: [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
                },
                {
                  label: 'Ignored',
                  backgroundColor: '#7A8AB5',
                  borderColor: '#7A8AB5',
                  data: [DEC_jan, DEC_feb, DEC_mar, DEC_apr, DEC_may, DEC_jun, DEC_jul, DEC_aug, DEC_sep, DEC_oct, DEC_nov, DEC_dec]
                }
              ]
            };
            console.log("MONTH", this.ThisMonth);
            
            this.acceptedAppointmentNum = this.appointment.filter((user: any) => user.status == 'Accepted').length;
            this.acceptedAppointment = this.appointment.filter((user: any) => user.status == 'Accepted');
            const date = new Date();
            this.previousAppointment = this.acceptedAppointment.filter((user: any) => {
              const appointmentDate = new Date(user.date_time);
              const today = new Date();
              return appointmentDate < today;
            });

            ;
            this.upc_appt = this.acceptedAppointment.filter((user: any) => {
              const appointmentDate = new Date(user.date_time);
              const today = new Date();
              return appointmentDate > today;
            });
            this.recentAppt = this.acceptedAppointment[0];

            this.complaint = this.splitComplaint(this.recentAppt.symptoms)
            this.pendingAppointment = this.appointment.filter((user: any) => user.status == 'pending').length;

          }
        })

      }
    })


  }

  getDocUser() {
    this.doctorEndpoint.getDocUser(this.id).subscribe({
      next: (response: any) => {
        this.doctor = response.doctor;

      }
    })
  }

  getDocAppt() {
    // console.log('HERE', this.doctor);
    console.log('HERE', this.user.doctors.id);

  }

}
