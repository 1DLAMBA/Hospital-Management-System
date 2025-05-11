import { Component, OnInit } from '@angular/core';
import { UserService } from '../../../../endpoints/user.service';
import { UserResource } from '../../../../../resources/user.model';
import { AppointmentResource } from '../../../../../resources/appointment.model';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { ClientsService } from '../../../../endpoints/clients.service';
import { AppointmentsService } from '../../../../endpoints/appointments.service';
import moment from 'moment';
import { DoctorsService } from '../../../../endpoints/doctors.service';

@Component({
  selector: 'app-client-panel',
  templateUrl: './client-panel.component.html',
  styleUrl: './client-panel.component.css'
})
export class ClientPanelComponent implements OnInit {
  id: any;
  user!: any
  data: any;
  options: any;
  products!: any;
  date: Date[] | undefined;
  upc_appt: AppointmentResource[] | any;
  doctor!: DoctorResource;
  appointment: AppointmentResource[] | any;
  acceptedAppointment!: AppointmentResource[] | any;
  pendingAppointment!: any[];
  recentAppt!: any;
  complaint!: string;
  acceptedAppointmentNum: any;
  today!: Date;
  previousAppointment!: AppointmentResource[];
  ThisMonth: any;
  doctorResource:DoctorResource[]=[];
   

  constructor(
    private userEndpoint: UserService,
    private appointmentEndpoint: AppointmentsService,
    private clientEndpoint: ClientsService,
    private doctorEnpoint: DoctorsService
  ){
    this.upc_appt =[
      {status: 'Ali Muhammed - General checkup', date:'12/10/2020 10:30', icon: 'pi pi-shopping-cart', color:'#0055aa' },
      {status: 'Ali Muhammed - General checkup', date:'12/10/2020 10:30', icon: 'pi pi-shopping-cart', color:'#0055aa' },
      {status: 'Ali Muhammed - General checkup', date:'12/10/2020 10:30', icon: 'pi pi-shopping-cart', color:'#0055aa' },
      {status: 'Ali Muhammed - General checkup', date:'12/10/2020 10:30', icon: 'pi pi-shopping-cart', color:'#0055aa' },

    ]
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

    this.id=localStorage.getItem('id')
    this.getUser();
    this.getDoctor();
  }
  splitComplaint(complaint: string) {
    const words = complaint.split(' ');
    return words.slice(0, 2).join(' ');

  }
getDoctor(){
  this.doctorEnpoint.get().subscribe({
    next:(response:any)=>{
      this.doctorResource=response.doctor;
    }
  })
}

  
  getUser() {
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user
        this.appointmentEndpoint.get(this.user.clients.id, 'client').subscribe({
          next: (response: any) => {
            this.appointment = response.appointments;
            this.acceptedAppointment = this.appointment.filter((user: any) => user.status == 'Accepted');
            this.upc_appt = this.appointment.filter((user: any) => {
                          const appointmentDate = new Date(user.date_time);
                          const today = new Date();
                          return appointmentDate.getDate() >= today.getDate();
                        });
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



        

            this.data = {
              labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
              datasets: [
                {
                  label: 'Visits',
                  backgroundColor: '#0055aa',
                  borderColor: '#0055aa',
                  data: [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
                }
              ]
            };
            console.log("MONTH", this.ThisMonth);
            
            this.acceptedAppointmentNum = this.appointment.filter((user: any) => user.status == 'Accepted').length;
            const date = new Date();
            this.previousAppointment = this.acceptedAppointment.filter((user: any) => {
              const appointmentDate = new Date(user.date_time);
              const today = new Date();
              return appointmentDate < today;
            });

            
            
            console.log(this.upc_appt, this.appointment);
            
            this.recentAppt = this.acceptedAppointment[0];

            this.complaint = this.splitComplaint(this.recentAppt.symptoms)
            this.pendingAppointment = this.appointment.filter((user: any) => {
              const appointmentDate = new Date(user.date_time);
              const today = new Date();
              return appointmentDate > today ;
            });
          }
        })

      }
    })


  }
   

}

