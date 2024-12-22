import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { UserProfileService } from './user-profile.service';

declare var bootstrap: any; // استخدم Bootstrap لإظهار وإخفاء المودال

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.css']
})
export class UserProfileComponent implements OnInit {
  role: string = '';
  userData: any;
  jobTitle: string = '';
  aboutMe: string = '';
  phoneNumber: string = '';
  phoneVerificationStatus: string = '';
  maxChars: number = 1000;
  remainingChars: number = this.maxChars;
  tempImage: string | null = null;
  services: any[] = [];

  constructor(private authService: AuthService,
    private userProfileService: UserProfileService) { }

  ngOnInit(): void {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      this.userData = JSON.parse(storedUserData);
      this.userData.last_seen = new Date().toISOString();
      this.role = this.userData.role;
    } else {
      this.authService.userData$.subscribe(userData => {
        this.userData = userData;
        this.role = userData?.role || '';
      });
    }

    if (this.userData.role === 'seller') {
      this.fetchServices(this.userData.id);
    }
  }

  fetchServices(userId: number): void {
    this.userProfileService.getServices(userId).subscribe(
      (response: any) => {
        if (response.success) {
          this.services = response.services; // تحديث قائمة الخدمات
        }
      },
      (error: any) => {
        console.error('خطأ أثناء جلب الخدمات:', error);
      }
    );
  }

  updateRole(role: string) {
    const userId = this.userData.id;
    this.userProfileService.updateRole(userId, role).subscribe({
      next: () => {
        this.userData.role = role;
        localStorage.setItem('userData', JSON.stringify(this.userData));
          window.location.reload();
      }
    });
  }

  updateRemainingChars() {
    this.remainingChars = this.maxChars - (this.aboutMe?.length || 0);
  }

  onImageUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          this.tempImage = reader.result as string;
          this.userData.image = this.tempImage;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  saveImage(): void {
    if (!this.userData.image) {
      console.error('No image to save');
      return;
    }

    const payload = {
      image: this.userData.image
    };

    this.userProfileService.updateUserImage(this.userData.id, payload).subscribe({
      next: (response) => {
        this.userData.image = response.image_url;
        localStorage.setItem('userData', JSON.stringify(this.userData));
        const modal = document.getElementById('editImageModal');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal?.hide();
        window.location.reload();
      }
    }
    );
  }

  deleteImage(): void {
    this.userProfileService.deleteUserImage(this.userData.id).subscribe({
      next: () => {
        this.userData.image = '';
        localStorage.setItem('userData', JSON.stringify(this.userData));
        const modal = document.getElementById('editImageModal');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal?.hide();
        window.location.reload();
      }
    });
  }

  submitJobTitle(): void {
    this.userProfileService.updateJobTitle(this.userData.id, this.jobTitle).subscribe({
      next: () => {
        this.userData.job_title = this.jobTitle;
        localStorage.setItem('userData', JSON.stringify(this.userData));
        const modal = document.getElementById('jobTitleModal');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal?.hide();
      },
      error: (error) => {
        console.error('Failed to update job title:', error);
      }
    }
    );
  }


  submitAboutMe(): void {
    this.userProfileService.updateAboutMe(this.userData.id, this.aboutMe).subscribe({
      next: () => {
        this.userData.about_me = this.aboutMe;
        localStorage.setItem('userData', JSON.stringify(this.userData));
        const modal = document.getElementById('aboutMeModal');
        const bootstrapModal = bootstrap.Modal.getInstance(modal);
        bootstrapModal?.hide();
      },
      error: (error) => {
        console.error('Failed to update job title:', error);
      }
    }
    );
  }

  isExpanded: boolean = false;

  deleteJobTitle(): void {
    this.userProfileService.deleteJobTitle(this.userData.id).subscribe(
      (response) => {
        this.userData.job_title = null;
        localStorage.setItem('userData', JSON.stringify(this.userData));
      },
      (error) => {
        console.error('Failed to delete job title:', error);
      }
    );
  }

  confirmDeleteJobTitle(): void {
    const confirmation = confirm('هل أنت متأكد من أنك تريد حذف المسمى الوظيفي؟');
    if (confirmation) {
      this.deleteJobTitle();
    }
  }

  submitPhoneVerification(): void {
    this.userProfileService.verifyPhone(this.userData.id, this.phoneNumber).subscribe({
      next: () => {
        this.userData.phone_number = this.phoneNumber;
        localStorage.setItem('userData', JSON.stringify(this.userData));
        this.phoneVerificationStatus = 'رقم الجوال قيد المراجعة';
        const modal = bootstrap.Modal.getInstance(document.getElementById('phoneVerificationModal'));
        modal?.hide();
      },
      error: (error) => {
        console.error('Failed to submit phone verification:', error);
      }
    }

    );
  }

  toggleAboutMe(): void {
    this.isExpanded = !this.isExpanded;
  }

  getLastSeenText(lastSeen: string): string {
    const lastSeenDate = new Date(lastSeen);
    const now = new Date();
    const diffInMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) {
      return 'الآن';
    } else if (diffInHours < 24) {
      return `منذ ${Math.floor(diffInHours)} ساعة`;
    } else if (diffInDays < 2) {
      return 'منذ يوم';
    } else if (diffInDays < 3) {
      return 'منذ يومين';
    } else {
      return lastSeenDate.toLocaleDateString('ar-EG', { year: 'numeric', month: '2-digit', day: '2-digit' });
    }
  }
}
