import { Component, Input } from '@angular/core';
@Component({
  selector: 'app-star-rating',
template: `
<div class="star-rating d-flex flex-row-reverse">
<i class="fa fa-star" *ngFor="let star of stars"></i>
<i class="fa fa-star-half" *ngIf="rating % 1 !== 0"></i>
</div>`,
  styles: [
    `.star-rating {
    font-size: 1em;
    color: #ffc107;
  }`
  ]
})
export class StarRatingComponent {
  @Input() rating: number;
  get stars() {
    return Array(Math.floor(this.rating));
  }
}

