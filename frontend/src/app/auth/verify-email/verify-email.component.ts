import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent {
  verifyForm: FormGroup;
  email: string;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private authService: AuthService,
    private router: Router
  ) {
    this.email = this.route.snapshot.queryParamMap.get('email') || '';
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.pattern('^[0-9]{6}$')]],
    });
  }

  onSubmit() {
    if (this.verifyForm.valid) {
      const code = this.verifyForm.get('code')?.value;
      this.authService.verifyCode(this.email, code).pipe(
        switchMap(() => {
          return this.authService.createUser(this.email);
        }),
        switchMap((response) => {
          if (!response) {
            throw new Error('فشل في إنشاء المستخدم');
          }
          const token = response.token;
          if (!token) {
            throw new Error('لم يتم العثور على التوكن');
          }
          this.authService.saveToken(token, true);
          return this.authService.getUserData(token);
        })
      ).subscribe({
        next: (userData) => {
          if (userData) {
            this.authService.setUserData(userData, false); // false Because we do not have remember_token
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('خطأ أثناء التحقق أو استرجاع بيانات المستخدم:', error);
          this.errorMessage = 'رمز التحقق غير صحيح أو منتهي الصلاحية.';
        },
      });
    } else {
      this.verifyForm.markAllAsTouched();
    }
  }

  resendCode() {
    this.authService.resendVerificationCode(this.email).subscribe({
      next: () => {
        console.log('تم إعادة إرسال رمز التحقق بنجاح.');
        this.errorMessage = null;
        this.successMessage = 'تم إعادة إرسال رمز التحقق بنجاح.';
      },
      error: (error) => {
        console.error('حدث خطأ أثناء إعادة إرسال الرمز:', error);
        this.errorMessage = 'تعذر إعادة إرسال رمز التحقق. حاول مرة أخرى.';
        this.successMessage = null;
      },
    });
  }
}
