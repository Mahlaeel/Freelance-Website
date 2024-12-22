import { Component, OnInit } from '@angular/core';
import { AbstractControl, AbstractControlOptions, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  signupForm: FormGroup;
  signupFormGoogle: FormGroup;
  emailError: string | null = null;
  usernameError: string | null = null;
  google_idError: string | null = null;
  google = false;

  constructor(private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
  ) { }

  ngOnInit() {
    const formOptions: AbstractControlOptions = {
      validators: mustMatch('password', 'c_password')
    };

    this.signupForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      username: ['', [Validators.required, Validators.maxLength(255)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      c_password: ['', Validators.required],
      role: [null, Validators.required]  // 'role' will store either 'seller' or 'buyer'
    }, formOptions);

    this.signupFormGoogle = this.fb.group({
      username: ['', [Validators.required, Validators.maxLength(255)]],
      role: [null, Validators.required],
      first_name: [''],
      last_name: [''],
      email: [''],
      image: [''],
      google_id: ['']
    });
  }


  onSubmit() {
    if (this.signupForm.valid) {
      const signupData = this.signupForm.value;
      this.authService.register(signupData).pipe(
        catchError((error) => {
          this.emailError = error.emailError || null;
          this.usernameError = error.usernameError || null;
          return of(null);
        }),
        tap((response) => {
          if (!response) {
            return;
          }
          this.router.navigate(['verify-email'], { queryParams: { email: signupData.email } });
        })
      ).subscribe();
    } else {
      this.signupForm.markAllAsTouched();
    }
  }




  // filling signupGoogleForm with data from google response
  signInWithGoogle(): void {
    this.authService.signupWithGoogle().subscribe({
      next: (userData) => {
        this.google = true;

        this.signupFormGoogle.patchValue({
          username: '',
          role: null,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          image: userData.image,
          google_id: userData.google_id
        });
      },
      error: (error) => {
        console.error('Error fetching user data:', error);
      }
    });
  }

  onSubmitGoogleForm(): void {
    if (this.signupFormGoogle.valid) {
      const signupGoogleData = this.signupFormGoogle.value;

      this.authService.registerWithGoogle(signupGoogleData).pipe(
        catchError((error) => {
          this.google_idError = error.google_idError || null;
          this.usernameError = error.usernameError || null;
          return of(null);
        }),
        switchMap((response) => {
          if (!response) {
            return of(null);
          }
          const token = response.access_token;
          if (!token) {
            throw new Error('Token not found');
          }
          this.authService.saveToken(token, true);
          return this.authService.getUserData(token);
        })
      ).subscribe({
        next: (userData) => {
          this.authService.setUserData(userData, false);
          if (!this.usernameError && !this.google_idError) {
            this.router.navigate(['/']);
          }
        }
      })
    } else {
      this.signupFormGoogle.markAllAsTouched();
    }
  }


  // remove error from back when change input
  onUsernameChange() {
    this.usernameError = null;
  }

  onEmailChange() {
    this.emailError = null;
  }
}

// Validator for matching password and confirm password
export function mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const formGroup = control as FormGroup;
    const mainControl = formGroup.controls[controlName];
    const matchingControl = formGroup.controls[matchingControlName];

    if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
      // If the confirm password control already has errors, don't override them
      return null;
    }

    // Set the mustMatch error if the password and confirm password don't match
    if (mainControl.value !== matchingControl.value) {
      matchingControl.setErrors({ mustMatch: true });
    } else {
      matchingControl.setErrors(null);
    }

    return null; // because it is a synchronous validator
  };
}
