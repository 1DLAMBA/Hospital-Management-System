import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from '../../../../endpoints/user.service';
import { UserResource } from '../../../../../resources/user.model';
import { AssignmentsService } from '../../../../endpoints/assignments.service';
import { AssigmentResourse } from '../../../../../resources/assignment.model';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { NurseResource } from '../../../../../resources/nurse.model';
import { NursesComponent } from '../../nurses/nurses.component';
import { NursesService } from '../../../../endpoints/nurses.service';
import { Subscription, filter } from 'rxjs';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';



@Component({
  selector: 'app-nurse-panel',
  templateUrl: './nurse-panel.component.html',
  styleUrls: ['./nurse-panel.component.css']
})
export class NursePanelComponent implements OnInit, OnDestroy {
  id: any;
  user!: any
  data: any;
  options: any;
  products!: any;
  date: Date[] | undefined;
  upc_appt: AssigmentResourse[] | any;
  nurse!: DoctorResource;
  appointment: AssigmentResourse[] | any;
  acceptedAppointment!: AssigmentResourse[] | any;
  pendingAppointment!: any[];
  recentAppt!: any;
  complaint!: string;
  acceptedAppointmentNum: any;
  today!: Date;
  previousAppointment!: AssigmentResourse[];
  ThisMonth: any;
  loading: boolean = true;
  private routerSubscription: Subscription | undefined;

  constructor(
    private userEndpoint: UserService,
    private appointmentEndpoint: AssignmentsService,
    private clientEndpoint: NursesService,
    private route: ActivatedRoute,
    private router: Router,
  ){
    this.appointment = [];
    this.upc_appt = [];
    this.previousAppointment = [] as any;
  }
  ngOnInit(): void {
    this.loading = true;
    this.setupChartOptions();
    this.id = localStorage.getItem('id');
    this.loadAllData();

    this.routerSubscription = this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects || event.url;
        if (url.includes('/panel/nurse-panel')) {
          this.loading = true;
          this.loadAllData();
        }
      });
  }

  loadAllData(): void {
    if (!this.id) {
      this.id = localStorage.getItem('id');
    }
    if (!this.id) {
      this.loading = false;
      return;
    }
    // Delegate to existing getUser chain
    this.getUser();
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }
  
  setupChartOptions(): void {
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
                color: 'black'
            }
        }
    },
    scales: {
        x: {
            ticks: {
                color: 'black',
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
                color: 'black'
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
this.id=localStorage.getItem('id')
this.getUser();
  }
  
  
  getUser() {
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user;
        this.appointmentEndpoint.get(this.user.nurses.id).subscribe({
          next: (response: any) => {
            if(response.assignment){
              this.appointment = response.assignment;
              const jan= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()

                
                return appointment.status === 'done' && month.getMonth() ===  0;
              }).length;
              const feb= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()

                
                return appointment.status === 'done' && month.getMonth() ===  1;
              }).length;
              const mar= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()

                
                return appointment.status === 'done' && month.getMonth() ===  2;
              }).length;
              const apr= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()

                
                return appointment.status === 'done' && month.getMonth() ===  3;
              }).length;
              const may= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()

                
                return appointment.status === 'done' && month.getMonth() ===  4;
              }).length;
              const jun= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()

                
                return appointment.status === 'done' && month.getMonth() ===  5;
              }).length;
              const jul= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()

                
                return appointment.status === 'done' && month.getMonth() ===  6;
              }).length;
              const aug= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()

                
                return appointment.status === 'done' && month.getMonth() ===  7;
              }).length;
              const sep= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()

                
                return appointment.status === 'done' && month.getMonth() ===  8;
              }).length;
              const oct= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()

                
                return appointment.status === 'done' && month.getMonth() ===  9;
              }).length;
              const nov= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()

                
                return appointment.status === 'done' && month.getMonth() ===  10;
              }).length;
              const dec= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()

                
                return appointment.status === 'done' && month.getMonth() ===  11;
              }).length;
  
  
  
              const DEC_jan= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()

                
                return appointment.status === 'pending' && month.getMonth() ===  0;
              }).length;

              const DEC_feb= this.appointment.filter((appointment: any) => {
               const month= new Date(appointment.created_at);
                month.getMonth()
                return appointment.status === 'pending' && month.getMonth() ===  1;
              }).length;

              const DEC_mar= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()
                return appointment.status === 'pending' && month.getMonth() ===  2;
              }).length;

              const DEC_apr= this.appointment.filter((appointment: any) => {
                const month= new Date(appointment.created_at);
                month.getMonth()
                return appointment.status === 'pending' && month.getMonth() ===  3;
              }).length;

              const DEC_may= this.appointment.filter((appointment: any) => {
                
                const month= new Date(appointment.created_at);
                month.getMonth()
                return appointment.status === 'pending' && month.getMonth() ===  4;
              }).length;

              const DEC_jun= this.appointment.filter((appointment: any) => {
                
                const month= new Date(appointment.created_at);
                month.getMonth()
                return appointment.status === 'pending' && month.getMonth() ===  5;
              }).length;

              const DEC_jul= this.appointment.filter((appointment: any) => {
                
                const month= new Date(appointment.created_at);
                month.getMonth()
                return appointment.status === 'pending' && month.getMonth() ===  6;
              }).length;

              const DEC_aug= this.appointment.filter((appointment: any) => {
                
                const month= new Date(appointment.created_at);
                month.getMonth()
                return appointment.status === 'pending' && month.getMonth() ===  7;
              }).length;
              const DEC_sep= this.appointment.filter((appointment: any) => {
                
                const month= new Date(appointment.created_at);
                month.getMonth()
                return appointment.status === 'pending' && month.getMonth() ===  8;
              }).length;
              const DEC_oct= this.appointment.filter((appointment: any) => {
                
                const month= new Date(appointment.created_at);
                month.getMonth()
                return appointment.status === 'pending' && month.getMonth() ===  9;
              }).length;
              const DEC_nov= this.appointment.filter((appointment: any) => {
                
                const month= new Date(appointment.created_at);
                month.getMonth()
                return appointment.status === 'pending' && month.getMonth() ===  10;
              }).length;
              const DEC_dec= this.appointment.filter((appointment: any) => {
                
                const month= new Date(appointment.created_at);
                month.getMonth()
                return appointment.status === 'pending' && month.getMonth() ===  11;
              }).length;

              this.data = {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [
                  {
                    label: 'Done',
                    backgroundColor: '#0055aa',
                    borderColor: '#0055aa',
                    data: [jan, feb, mar, apr, may, jun, jul, aug, sep, oct, nov, dec]
                  },
                  {
                    label: 'Pending',
                    backgroundColor: '#7A8AB5',
                    borderColor: '#7A8AB5',
                    data: [DEC_jan, DEC_feb, DEC_mar, DEC_apr, DEC_may, DEC_jun, DEC_jul, DEC_aug, DEC_sep, DEC_oct, DEC_nov, DEC_dec]
                  }
                ]
              };
            } else {
              this.loading = false;
              return;
            }
            

            
            
            this.acceptedAppointmentNum = this.appointment.filter((user: any) => user.status == 'Accepted').length;
            this.acceptedAppointment = this.appointment.filter((user: any) => user.status == 'pending' || user.status == 'done');
            const date = new Date();
            this.previousAppointment = this.appointment.filter((user: any) => {
              return user.status ==='done';

            });

            ;
            this.upc_appt = this.appointment.filter((user: any) => {
              
              return user.status ==='pending';
            });
            this.recentAppt = this.acceptedAppointment[0];

            // this.complaint = this.splitComplaint(this.recentAppt.symptoms)
            this.pendingAppointment = this.appointment.filter((user: any) => user.status == 'pending').length;

          },
          error: (err: any) => {
            console.error('Error loading assignments:', err);
            this.loading = false;
          }
        })

      },
      error: (err: any) => {
        console.error('Error loading nurse user:', err);
        this.loading = false;
      }
    })
  }
}
