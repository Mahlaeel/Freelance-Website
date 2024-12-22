import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { HomeComponent } from './home/home.component';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { AddServiceComponent } from './services/add-service/add-service.component';
import { VerifyEmailComponent } from './auth/verify-email/verify-email.component';
import { authGuard, guestGuard } from './guards/auth-guards';
import { serviceResolver } from './services/service/service.resolver';
import { ServiceComponent } from './services/service/service.component';
import { editService } from './guards/service.guard';
import { EditServiceComponent } from './services/edit-service/edit-service.component';


const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'verify-email', component: VerifyEmailComponent, canActivate: [guestGuard] },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'services/:id', component: ServiceComponent, resolve: {serviceData: serviceResolver} },
  { path: 'profile', component: UserProfileComponent, canActivate: [authGuard] },
  { path: 'add-service', component: AddServiceComponent, canActivate: [authGuard] },
  { path: 'edit-service/:id', component: EditServiceComponent, canActivate: [editService]},

  { path: '**', redirectTo: '' }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
