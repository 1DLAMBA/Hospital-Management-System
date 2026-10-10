import { Injectable, TemplateRef } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class AuthService{

    constructor(){
        this.getUserDataFromLocalStorage();
    }

    user: any;
    isLoggedIn = false;

    login(user: any, token?: string){
        this.isLoggedIn=true;
        this.user = user;
        // Save user data to localStorage
        localStorage.setItem('userData', JSON.stringify(user));
        // User sign-ins have no token; drop any left from an admin or hospital session.
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }

    logout(){
        this.isLoggedIn=false;
        this.user = null;
        // Clear user data from localStorage
        localStorage.removeItem('userData');
        localStorage.removeItem('token');
    }

    getUserDataFromLocalStorage(){
        const userData = localStorage.getItem("userData");
        const userId = localStorage.getItem("id");
        if(userData && userId){
            try {
                this.user = JSON.parse(userData);
                this.isLoggedIn = true;
            } catch (e) {
                console.error('Error parsing user data from localStorage:', e);
                this.isLoggedIn = false;
                this.user = null;
            }
        }
    }
}