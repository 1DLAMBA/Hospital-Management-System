import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { UserService } from '../../../endpoints/user.service';


@Injectable({
    providedIn: 'root'
})
export class PanelResolver implements Resolve<any>{
    id: any;

    constructor(private userEndpoint: UserService) {

    }
    resolve(route: ActivatedRouteSnapshot): Observable<any> {
        this.id = localStorage.getItem('id')

        console.log('Called Get Product in resolver...', route);
        return this.userEndpoint.get(this.id).pipe(
            catchError(error => {
                return of('No data');
            })
        );
    }
}