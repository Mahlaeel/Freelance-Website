import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService } from '../auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = 'http://127.0.0.1:8000/api';

  constructor(private http: HttpClient, private authService: AuthService) { }

  updateRole(userId: number, role: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.put(`${this.apiUrl}/users/${userId}/role`, { role }, { headers });
  }


  updateAboutMe(userId: number, aboutMe: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.put(`${this.apiUrl}/users/${userId}/about-me`, { about_me: aboutMe }, { headers });
  }


  updateJobTitle(userId: number, jobTitle: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.put(`${this.apiUrl}/users/${userId}/job-title`, { job_title: jobTitle }, { headers });
  }

  deleteJobTitle(userId: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.delete(`${this.apiUrl}/users/${userId}/job-title`, { headers });
  }

  verifyPhone(userId: number, phoneNumber: string): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.put(`${this.apiUrl}/users/${userId}/verify-phone`, { phone_number: phoneNumber }, { headers });
  }

  updateUserImage(userId: number, payload: { image: string }): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.post(`${this.apiUrl}/users/${userId}/image`, payload, { headers });
  }

  deleteUserImage(userId: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.delete(`${this.apiUrl}/users/${userId}/image`, { headers });
  }

  getServices(userId: number): Observable<any> {
    const headers = new HttpHeaders().set('Authorization', `Bearer ${this.authService.getToken()}`);
    return this.http.get(`${this.apiUrl}/users/${userId}`, { headers });
  }


}
