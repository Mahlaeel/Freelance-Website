import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  googleExistError: string | null = null;
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      remember_token: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      const loginData = {
        email: this.loginForm.get('email').value,
        password: this.loginForm.get('password').value,
        remember_token: this.loginForm.get('remember_token').value
      };

      this.authService.login(loginData).pipe(
        switchMap((response) => {
          if (!response) {
            throw new Error('Invalid login response');
          }

          const token = response.access_token;
          this.authService.saveToken(token, loginData.remember_token);

          return this.authService.getUserData(token);
        })
      ).subscribe({
        next: (userData) => {
          this.authService.setUserData(userData, loginData.remember_token);
          this.router.navigate(['/']);
        },
        error: (error) => {
          this.errorMessage = error.emailError || error.passwordError || 'تسجيل الدخول غير صالح';
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  onClickGoogle() {
    this.authService.loginWithGoogle().pipe(
      catchError((error) => {
        this.googleExistError = error.google_idError || null;
        return of(null);
      }),
      switchMap((response) => {
        if (!response) {
          throw new Error('Invalid login response');
        }

        const token = response.access_token;
        this.authService.saveToken(token, true);

        return this.authService.getUserData(token);
      })
    ).subscribe({
      next: (userData) => {
        if (!this.googleExistError) {
          this.authService.setUserData(userData, true);
          this.router.navigate(['/']);
        }
      }
    });
  }


}
