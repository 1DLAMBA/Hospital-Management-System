import { Injectable, TemplateRef } from '@angular/core';

@Injectable({
    providedIn: 'root'
})

export class AuthService{

    constructor(){
        // this.getUserDataFromLocalStorage();
    }

    user: any;
    isLoggedIn = false;

    login(user: any){
        this.isLoggedIn=true;
        this.user = user;
        // localStorage.setItem('userData', JSON.stringify(this.user.user))
    }
    logout(){
        this.isLoggedIn=false;
    }

    // getUserDataFromLocalStorage(){
    //     const userData = localStorage.getItem("userData");
    //     if(userData){
    //         this.isLoggedIn=true;
    //         // this.user =JSON.parse(userData)
    //     }
    // }
}