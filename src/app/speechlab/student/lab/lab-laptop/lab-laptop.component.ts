import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-lab-laptop',
  templateUrl: './lab-laptop.component.html',
  styleUrls: ['./lab-laptop.component.css']
})
export class LabLaptopComponent {
  @Output() valueChanged = new EventEmitter<boolean>();
  value: boolean = false;

  toggleValue() {
    this.value = !this.value;
    this.valueChanged.emit(this.value);
  }

}
