import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SwiperContainer } from 'swiper/element';
import { Swiper, SwiperOptions } from 'swiper/types';
import { FormServiceService } from '../form-service.service';
import { map, switchMap, tap } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-service',
  templateUrl: './service.component.html',
  styleUrls: ['./service.component.css']
})
export class ServiceComponent implements AfterViewInit, OnInit {

  constructor(private route: ActivatedRoute,
    private formService: FormServiceService,
    private router: Router,
    private authService: AuthService
  ){}

  serviceId: any;
  service: any;
  userToken: string;
  userData: any;
  userId: any;
  isOwner = false;

  // Start Swiper Configuration

  @ViewChild('swiper') swiper!: ElementRef<SwiperContainer>;

  images = [];
  
  index = 0;

  swiperConfig: SwiperOptions = {
    spaceBetween: 10,
    navigation: true,
    loop: true,
    injectStyles: [
      `          
          .swiper-button-next,
          .swiper-button-prev {
            background-color: white !important;
            padding: 8px 16px !important;
            border-radius: 100% !important;
            border: 2px solid black !important;
            color: red !important;
          }
            `
    ]
  }

  ngAfterViewInit() {
    this.swiper.nativeElement.swiper.activeIndex = this.index;
  }

  slideChange(swiper: any) {
    this.index = swiper.detail[0].activeIndex;
  }

  // End Swiper Confeguration

  onDeleteService(id: any) {
    const userToken = localStorage.getItem('token');
    if(userToken) {
      this.userToken = userToken
    }else {
      const userToken = sessionStorage.getItem('token');
      this.userToken = userToken
    }
    this.formService.deleteService(id, userToken).subscribe(
      response => {
        console.log(response);
      }
    );
    this.router.navigate(['/']);
  }

  confirmDeleteService(id: any) {
    const confirmation = confirm('هل أنت متأكد من حذف هذه الخدمة؟')
    if(confirmation) {
      this.onDeleteService(id);
    }
  }

  ngOnInit(): void {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      this.userData = JSON.parse(storedUserData);
      this.userId = this.userData.id
    } else {
      this.authService.userData$.subscribe(userData => {
        this.userId = userData?.id
      });
    }

    // this.serviceId = this.route.snapshot.paramMap.get('id');
    const resolvedData = this.route.snapshot.data['serviceData'];
    this.service = resolvedData.service[0];
    this.images = [...this.service?.images];

    this.isOwner = this.service?.user_id === this.userId;
    console.log(this.service);

    // this.formService.getService(this.serviceId).subscribe(
    //   (response: any) => {
    //     this.service = response.service[0];
    //     this.images = [...this.service?.images];
    //     this.isOwner = this.service?.user_id === this.userId;
    //   }
    // );
  }

}
