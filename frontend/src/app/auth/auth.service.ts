import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, catchError, from, Observable, switchMap, tap, throwError } from 'rxjs';
import { getAuth, signInWithPopup, GoogleAuthProvider, Auth, UserCredential } from "firebase/auth";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://127.0.0.1:8000/api'; // Base API URL
  private userData = new BehaviorSubject<any>(null);
  userData$ = this.userData.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

// Verify Email Code
verifyCode(email: string, code: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/verify-code`, { email, code });
}

// Save Registered User After Verification
createUser(email: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/create-user`, { email });
}

// Resend verification code
resendVerificationCode(email: string): Observable<any> {
  return this.http.post(`${this.apiUrl}/resend-code`, { email }).pipe(
    tap(() => console.log('رمز التحقق أُعيد إرساله بنجاح')),
    catchError((error) => {
      console.error('خطأ أثناء إعادة إرسال رمز التحقق:', error);
      return throwError(() => new Error('إعادة الإرسال فشلت'));
    })
  );
}

  // Register
  register(signupData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, signupData).pipe(
      tap((response: any) => {
        this.setUserData(response.user, false);  //false because we don't have here remember_token
      }),
      catchError(this.handleErrorRegister)
    );
  }

  private handleErrorRegister(error: HttpErrorResponse) {
    let emailError: string | null = null;
    let usernameError: string | null = null;
    let google_idError: string | null = null;

    if (error.error && error.error.errors) {
      const errorMessage = error.error.errors;

      if (errorMessage.email && errorMessage.email[0].includes("البريد الإلكتروني")) {
        emailError = errorMessage.email[0];
      }
      if (errorMessage.username && errorMessage.username[0].includes("اسم المستخدم")) {
        usernameError = errorMessage.username[0];
      }
      if (errorMessage.google_id && errorMessage.google_id[0].includes("هذا الحساب")) {
        google_idError = errorMessage.google_id[0];
      }
    }

    return throwError(() => ({ emailError, usernameError, google_idError }));
  }

  //Login
  login(loginData: { email: string; password: string; remember_token?: boolean }): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, loginData).pipe(
      tap((response: any) => {
        this.saveToken(response.token, loginData.remember_token ?? false);
      }),
      catchError(this.handleErrorLogin)
    );
  }

  private handleErrorLogin(error: HttpErrorResponse) {
    let emailError: string | null = null;
    let passwordError: string | null = null;
    let googleExistError: string | null = null;


    if (error.error) {
      const errorMessage = error.error.message;
      if (error.error.errors) {
        if (error.error.errors.email) {
          emailError = error.error.errors.email[0];
        }
        if (error.error.errors.password) {
          passwordError = error.error.errors.password[0];
        }
      } else {
        emailError = errorMessage;
      }
    }

    return throwError(() => ({ emailError, passwordError }));
  }


  signupWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    return from(signInWithPopup(auth, provider)).pipe(
      switchMap((userCredential) => {
        const googleUser = userCredential.user;
        const userData = {
          email: googleUser.email,
          first_name: googleUser.displayName?.split(' ')[0] || '',
          last_name: googleUser.displayName?.split(' ')[1] || '',
          image: googleUser.photoURL,
          google_id: googleUser.uid,
          provider: 'google',
        };
        this.userData.next(userData);  // Temporarily save user data to display in the form
        return this.userData$;
      }),
      catchError(() => {
        return throwError(() => new Error('Error logging in with Google'));
      })
    );
  }

  registerWithGoogle(signupData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/google-register`, signupData).pipe(
      tap((response: any) => this.saveToken(response.token, false)),
      catchError(this.handleErrorRegister)
    );
  }


  loginWithGoogle(): Observable<any> {
    const provider = new GoogleAuthProvider();
    const auth = getAuth();

    return from(signInWithPopup(auth, provider)).pipe(
      switchMap((result) => {
        const google_id = result.user?.uid;
        const signupData = { google_id };

        return this.http.post(`${this.apiUrl}/google-login`, signupData).pipe(
          tap((response: any) => this.saveToken(response.access_token, true)),
          catchError(this.handleErrorRegister)
        );
      }),
      catchError((error) => {
        console.error('Error during Google sign-in', error);
        return throwError(() => error);
      })
    );
  }

  saveToken(token: string, remember: boolean): void {
    if (remember) {
      localStorage.setItem('token', token);
    } else {
      sessionStorage.setItem('token', token);
    }
  }

  getToken(): string | null {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getUserData(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/user`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    }).pipe(
      tap(userData => this.setUserData(userData, userData.remember_token))
    );
  }

  setUserData(userData: any, remember: boolean): void {
    this.userData.next(userData);

    const storage = remember ? localStorage : sessionStorage;
    const storageKey = 'userData';

    if (userData) {
      const dataToStore = {
        ...userData,
        storedAt: new Date().getTime() // تخزين وقت التخزين
      };
      storage.setItem(storageKey, JSON.stringify(dataToStore));
    } else {
      storage.removeItem(storageKey);
    }
  }

  getStoredUserData(): any {
    const storedData = localStorage.getItem('userData') || sessionStorage.getItem('userData');
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      const currentTime = new Date().getTime();

      // فرضًا إذا كانت البيانات محفوظة في localStorage وتريد أن تبقى 24 ساعة
      const expireTime = 24 * 60 * 60 * 1000; // 24 ساعة

      if (currentTime - parsedData.storedAt < expireTime) {
        return parsedData; // البيانات صالحة
      } else {
        this.clearUserData(); // البيانات انتهت صلاحيتها
      }
    }

    return null; // لا توجد بيانات أو بيانات منتهية الصلاحية
  }

  clearUserData(): void {
    localStorage.removeItem('userData');
    sessionStorage.removeItem('userData');
    this.userData.next(null);
  }



  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('userData');

    this.userData.next(null);
    this.router.navigate(['/login']);
  }
}


