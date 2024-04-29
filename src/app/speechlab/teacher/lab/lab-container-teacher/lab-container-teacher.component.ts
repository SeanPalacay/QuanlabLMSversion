import { Component } from '@angular/core';

@Component({
  selector: 'app-lab-container-teacher',
  templateUrl: './lab-container-teacher.component.html',
  styleUrls: ['./lab-container-teacher.component.css']
})
export class LabContainerTeacherComponent {
  childValue: boolean = true;

  handleValueChanged(value: boolean) {
    this.childValue = value;
  }
}
