import { Component, ViewChild } from '@angular/core';
import { FormGroup, FormArray, FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FilePondOptions } from 'filepond';
import { FilePondComponent } from 'ngx-filepond';
import { AuthService } from 'src/app/auth/auth.service';
import { FormServiceService } from '../form-service.service';

@Component({
  selector: 'app-edit-service',
  templateUrl: './edit-service.component.html',
  styleUrls: ['./edit-service.component.css']
})
export class EditServiceComponent {

  constructor(private fb: FormBuilder,
    private formService: FormServiceService,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.serviceForm = this.fb.group({
      title: new FormControl('', [Validators.required, Validators.minLength(5)]),
      mainCategory: new FormControl('', Validators.required),
      category_id: ['', Validators.required,],
      description: new FormControl('', [Validators.required, Validators.minLength(20)]),
      images: new  FormArray([], Validators.required),
      price: new FormControl(0, [Validators.required, Validators.pattern('^[0-9]*$'), Validators.min(1), Validators.max(100) ]),
      duration: ['', Validators.required],
      seller_note: new FormControl('', [Validators.minLength(10), Validators.required]),
      user_id: this.sellerId
    });
  }

  categories: any[] = [];
  subcategories: any[] = [];
  selectedCategoryId: number | null = null;
  userData: any;
  sellerId: any;
  userToken: string;
  serviceId: number;
  service: any;

  serviceForm: FormGroup;

  get f() {
    return this.serviceForm.controls;
  }

  get images(): FormArray {
    return this.serviceForm.get('images') as FormArray;
  }

  //Start filePond confeguration

  @ViewChild('myPond') myPond: FilePondComponent;

  pondOptions: FilePondOptions = {
    allowMultiple: true,
    labelIdle: `<div class="filepond--label-action">أضف صور</div>
    <p>القياس: 800*470 بكسل. الحجم الأقصى: 5 ميجابيات. العدد المسموح: 10 صور</p>`,
    allowFileSizeValidation: true,
    maxFileSize: '5MB',
    labelMaxFileSizeExceeded: 'الملف أكبر من الحد المسموح (5 ميجابايت)',
    maxFiles: 10,
    acceptedFileTypes: ['image/*'],
    labelFileTypeNotAllowed: 'الملف غير مسموح. يجب أن يكون نوع الملف صورة.',
    allowImageValidateSize: true,
    imageValidateSizeMaxHeight: 470,
    imageValidateSizeMaxWidth: 800,
    imageValidateSizeLabelImageSizeTooBig: 'يجب أن تكون الأبعاد أقل من 800×470 بكسل',
  }

  pondFiles: FilePondOptions["files"] = [];

  pondHandleAddFile(event: any) {
    // Start Images Validators
    const fileSize = event.file.file.size;
    const fileDimensions = event.error?.sub;

    if (fileSize > 5*1024*1024) {  // for size
      return;
    }

    if (fileDimensions === "Maximum size is 800 × 470") { //for dimensions
      return;
    }
    // End Images Validators

    if (event && event.file) {
      const base64String = event.file.getFileEncodeBase64String();
      const mimeType = event.file.fileType;
      const dataUrl = `data:${mimeType};base64,${base64String}`; 
      
      // Add Base64 image to FormArray
      this.images.push(this.fb.control(dataUrl));
    }
  }

  pondHandleFileRemove(event: any) {
  // Clear the image data when the file is removed
  const base64String = event.file.getFileEncodeBase64String();
  const mimeType = event.file.fileType;
  const dataUrl = `data:${mimeType};base64,${base64String}`;

  if (event && event.file) {
    // Find the index of the removed image and remove it from the FormArray
    const index = this.images.value.findIndex(image => image.value === dataUrl);
    if (index === -1) {
      this.images.removeAt(index);
    }
  }
}

  // End filePond confeguratin

    //Start Categories Implements
    feachCategories() {
      this.formService.getCategories().subscribe(
        (response) => { 
          return this.categories.push(response.categories)
      })
    }
  
    onCategoryChange(categoryId: number) {
      this.selectedCategoryId = categoryId;
      this.formService.getSubCategories(categoryId).subscribe(
        (response: any) => {
          if(!this.subcategories) {
            return this.subcategories.push(response.category[0].categories)
          }else {
            this.subcategories = [];
            return this.subcategories.push(response.category[0].categories)
          }
        }
      )
    }
    //End Categories Implements
    
  
    ngOnInit(): void {
      //Start get user information
      const storedUserData = localStorage.getItem('userData');
      if (storedUserData) {
        this.userData = JSON.parse(storedUserData);
        this.sellerId = this.userData.id
      } else {
        this.authService.userData$.subscribe(userData => {
          this.sellerId = userData?.id
        });
      }
      //End get user information

      this.serviceId = +this.route.snapshot.paramMap.get('id');

    this.formService.getService(this.serviceId).subscribe(
      (response: any) => {
        console.log(response.service[0])
        this.service = response.service[0];
        this.onCategoryChange(this.service?.category.mainCategory);
        if(this.service.images) {
          this.pondFiles = this.service.images.map((image: string) => ({
            source: image,
          }));
        }
        this.serviceForm.patchValue({
          title: this.service?.title,
          mainCategory: this.service?.category.mainCategory,
          category_id: this.service?.category_id,
          description: this.service?.description,
          images: this.service.images.array?.forEach((image: string) => {
            this.images.push(this.fb.control(image))
          }),
          price: this.service?.price,
          duration: this.service?.duration,
          seller_note: this.service?.seller_note,
          user_id: this.sellerId
        });
      }
    )

      this.feachCategories();
  
    }
  
    onEditService() {
      if(this.serviceForm.valid) {
        const formData = this.serviceForm.getRawValue();
        const userToken = localStorage.getItem('token');

        if(userToken) {
          this.userToken = userToken
        }else {
          const userToken = sessionStorage.getItem('token');
          this.userToken = userToken
        }

        this.formService.editService(this.serviceId, formData, this.userToken).subscribe(
          response => {
            console.log(response.message);
            this.router.navigate([`services/${this.serviceId}`]);
          }
        )
      }
    }

}
