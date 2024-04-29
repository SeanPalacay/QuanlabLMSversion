import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css']
})
export class CardComponent {
  @Input() difficulty:number = 0;
  @Input() picture: string = '';
  @Input() number: string = '';
  @Input() lecture: string = '';
  @Input() profilepic: string='';
  @Input() name: string = '';
  @Input() job: string = '';
  @Input() enrolled:number = 0;
}
