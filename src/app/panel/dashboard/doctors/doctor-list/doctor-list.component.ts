import { Component, OnInit, OnDestroy } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { DoctorResource } from '../../../../../resources/doctor.model';
import { UserResource } from '../../../../../resources/user.model';
import { ProfessionalResource } from '../../../../../resources/professional.model';
import { DoctorsService } from '../../../../endpoints/doctors.service';
import { OtherProfessionalsService } from '../../../../endpoints/other-professionals.service';
import { UserService } from '../../../../endpoints/user.service';
import { forkJoin, Subscription } from 'rxjs';
import {
  Router,
  NavigationEnd,
} from '@angular/router';
import { filter } from 'rxjs/operators';



@Component({
  selector: 'app-doctor-list',
  templateUrl: './doctor-list.component.html',
  styleUrl: './doctor-list.component.css'
})
export class DoctorListComponent implements OnInit, OnDestroy{
  id: any;
  user!: UserResource;
  firstName!: string;
  avatar_file!:string;
  doctors!: DoctorResource[];
  professionals!: ProfessionalResource[]; // Unified list
  filteredProfessionals!: ProfessionalResource[]; // Filtered list for display
  SingleDoctor!: DoctorResource;
  searchValue: string | undefined;
  showdoc: boolean = false;
  availableCount: number = 0;
  unavailableCount: number = 0;
  
  private routerSubscription?: Subscription;
  private isComponentActive: boolean = true;

  constructor(
    private userEndpoint: UserService,
    private doctorEndpoint: DoctorsService,
    private otherProfessionalEndpoint: OtherProfessionalsService,
    private readonly router: Router,

  ){

  }

  ngOnInit(): void {
    this.id=localStorage.getItem('id');
    this.isComponentActive = true;
    this.loadData();
    
    // Subscribe to router navigation events to detect when navigating to this component
    // This handles the case where component is reused
    this.routerSubscription = this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event) => {
      if (!this.isComponentActive) return;
      
      const currentUrl = event.urlAfterRedirects || event.url;
      
      // If we're on the doctors list route, reload data
      // This ensures data is refreshed even when component is reused
      if (currentUrl.includes('/panel/doctors') && !currentUrl.includes('/profile/')) {
        // Use setTimeout to avoid multiple rapid calls and ensure component is ready
        setTimeout(() => {
          if (this.isComponentActive && this.router.url === currentUrl) {
            this.loadData();
          }
        }, 100);
      }
    });
  }

  ngOnDestroy(): void {
    this.isComponentActive = false;
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadData(): void {
    this.getUser();
    this.getDoctor();
  }

  clearSearch() {
    this.searchValue = '';
    this.filterProfessionals();
  }

  filterProfessionals() {
    if (!this.professionals) {
      this.filteredProfessionals = [];
      return;
    }

    if (!this.searchValue || this.searchValue.trim() === '') {
      this.filteredProfessionals = this.professionals;
      return;
    }

    const searchTerm = this.searchValue.toLowerCase().trim();
    this.filteredProfessionals = this.professionals.filter(professional => 
      professional.user.name.toLowerCase().includes(searchTerm) ||
      professional.specialization?.toLowerCase().includes(searchTerm) ||
      professional.displayType.toLowerCase().includes(searchTerm) ||
      professional.user.email?.toLowerCase().includes(searchTerm)
    );
  }

  getAvailabilityIcon(professional: ProfessionalResource): string {
    if (professional.type === 'doctor' && professional.availability === '1') {
      return 'pi-check-circle';
    } else if (professional.type === 'doctor' && professional.availability === '0') {
      return 'pi-times-circle';
    }
    return 'pi-info-circle';
  }

  getAvailabilityText(professional: ProfessionalResource): string {
    if (professional.type === 'doctor' && professional.availability === '1') {
      return 'Available';
    } else if (professional.type === 'doctor' && professional.availability === '0') {
      return 'Unavailable';
    }
    return 'Available';
  }

  getUser (){
    this.userEndpoint.get(this.id).subscribe({
      next: (response: any) => {
        this.user = response.user
        this.avatar_file = environment.apiUrl + '/file/get/';        
      }
    })
  }

  getDoctor(){
    // Fetch both doctors and other professionals in parallel
    forkJoin({
      doctors: this.doctorEndpoint.get(),
      otherProfessionals: this.otherProfessionalEndpoint.get()
    }).subscribe({
      next: (responses: any) => {
        this.doctors = responses.doctors.doctor;
        
        // Combine doctors and other professionals into unified list
        const doctorsList: ProfessionalResource[] = responses.doctors.doctor.map((doctor: DoctorResource) => ({
          id: doctor.id,
          type: 'doctor' as const,
          displayType: 'Doctor',
          user: doctor.user,
          specialization: doctor.specialization,
          license_number: doctor.license_number,
          med_school: doctor.med_school,
          grad_year: doctor.grad_year,
          degree_file: doctor.degree_file,
          availability: doctor.availability,
          doctor: doctor
        }));
        
        const otherProfessionalsList: ProfessionalResource[] = responses.otherProfessionals.other_professional.map((op: any) => ({
          id: op.id,
          type: 'other_professional' as const,
          displayType: op.professional_type || 'Other Professional',
          user: op.user,
          specialization: op.specialization,
          license_number: op.license_number,
          med_school: op.med_school,
          grad_year: op.grad_year,
          degree_file: op.degree_file,
          professional_type: op.professional_type,
          otherProfessional: op
        }));
        
        // Combine and sort by name
        this.professionals = [...doctorsList, ...otherProfessionalsList].sort((a, b) => 
          a.user.name.localeCompare(b.user.name)
        );
        // Initialize filtered list
        this.filteredProfessionals = this.professionals;
        
        // Calculate available and unavailable counts (only for doctors)
        this.calculateAvailabilityCounts();
      },
      error: (err) => {
        console.error('Error loading professionals:', err);
      }
    })
  }

  getSingleDoctor(id: any, type: 'doctor' | 'other_professional' = 'doctor'){
    // Route both doctors and other_professionals to the same profile component
    // Pass the type as a query parameter so the profile component knows which endpoint to use
    this.router.navigate([`panel/doctors/profile/`, id], { queryParams: { type: type } })
  }

  calculateAvailabilityCounts() {
    if (!this.professionals) {
      this.availableCount = 0;
      this.unavailableCount = 0;
      return;
    }

    // Count only doctors (other_professionals don't have availability)
    const doctors = this.professionals.filter(p => p.type === 'doctor');
    
    // availability is typed as string | undefined, so compare to string values
    this.availableCount = doctors.filter(d => d.availability === '1').length;
    this.unavailableCount = doctors.filter(d => d.availability === '0').length;
  }

}
