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

    login(user: any){
        this.isLoggedIn=true;
        this.user = user;
        // Save user data to localStorage
        localStorage.setItem('userData', JSON.stringify(user));
    }
    
    logout(){
        this.isLoggedIn=false;
        this.user = null;
        // Clear user data from localStorage
        localStorage.removeItem('userData');
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