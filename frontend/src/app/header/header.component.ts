import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  guest: boolean = true;
  role: string = '';
  userData: any;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      this.userData = JSON.parse(storedUserData);
      this.role = this.userData.role;
      this.guest = !this.role;
    } else {
      this.authService.userData$.subscribe(userData => {
        this.userData = userData;
        this.role = userData?.role || '';
        this.guest = !this.role;
      });
    }
  }

  onLogout() {
    this.authService.logout();
    localStorage.removeItem('userData');
    this.router.navigate(['/']);
  }
}
