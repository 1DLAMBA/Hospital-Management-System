import { AppComponent } from "./app.component";
import { NgModule } from '@angular/core';
import { NavBarComponent } from "./nav-bar/nav-bar.component";
import { CommonModule } from '@angular/common';
import { SkeletonLoaderComponent } from './shared/components/skeleton-loader/skeleton-loader.component';
import { LazyImageComponent } from './shared/components/lazy-image/lazy-image.component';
import { OtpVerificationComponent } from './shared/components/otp-verification/otp-verification.component';

@NgModule({
    declarations: [
        SkeletonLoaderComponent,
        LazyImageComponent
    ],
    imports: [
        CommonModule,
        OtpVerificationComponent
    ],
    exports: [
        SkeletonLoaderComponent,
        LazyImageComponent,
        OtpVerificationComponent
    ]
})
export class SharedModule {}
