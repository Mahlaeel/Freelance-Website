import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'freelance-website';

  showHeader = true;

  constructor(private router: Router, private authService: AuthService) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        // Hide header on login, register, or any URL starting with /verify-email
        this.showHeader = !(
          event.url.startsWith('/login') ||
          event.url.startsWith('/register') ||
          event.url.match(/^\/verify-email(\?.*)?$/)
        );
      }
    });
  }

  ngOnInit(): void {
    const token = this.authService.getToken();
    if (token) {
      this.authService.getUserData(token).subscribe({
        next: (userData) => {
          this.authService.setUserData(userData, userData.remember_token);
        },
        error: () => {
          this.authService.logout();
        }
      });
    }
  }

}
