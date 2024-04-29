import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { APIService } from 'src/app/services/API/api.service';

@Component({
  selector: 'app-newclass',
  templateUrl: './newclass.component.html',
  styleUrls: ['./newclass.component.css'],
})
export class NewclassComponent implements OnInit {
  @Input() public data: any = null;
  @Input() public courses?: Map<string, any>;

  course: string = '';
  classID: string = '';
  className: string = '';
  classCode: string = '';
  daySchedule: string = '';
  timeSchedule: string = '';
  showDayScheduleError: boolean = false;

  startHour: string = '';
  startMinute: string = '';
  startPeriod: string = '';
  endHour: string = '';
  endMinute: string = '';
  endPeriod: string = '';

  hours: string[] = Array.from({length: 12}, (_, i) => (i + 1).toString());
  minutes: string[] = Array.from({length: 60}, (_, i) => (i < 10 ? '0' : '') + i.toString());

  weekDays = [
    { name: 'M', checked: false },
    { name: 'T', checked: false },
    { name: 'W', checked: false },
    { name: 'Th', checked: false },
    { name: 'F', checked: false },
    { name: 'Sa', checked: false },
  ];

  
  constructor(private API: APIService, public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    if (this.data) {
      this.className = this.data.className;
      this.classCode = this.data.classCode;
      this.daySchedule = this.data.daySchedule;
      this.timeSchedule = this.data.timeSchedule;
      this.classID = this.data.classID;
      this.course = this.data.courseID;
      this.updateWeekDaysFromSchedule();
      this.parseTimeSchedule();
    }
  }

  parseTimeSchedule() {
    const timeParts = this.timeSchedule.split(' - ');
    const startTime = timeParts[0].split(' ');
    const endTime = timeParts[1].split(' ');

    const start = startTime[0].split(':');
    this.startHour = start[0];
    this.startMinute = start[1];
    this.startPeriod = startTime[1];

    const end = endTime[0].split(':');
    this.endHour = end[0];
    this.endMinute = end[1];
    this.endPeriod = endTime[1];
  }

  updateWeekDaysFromSchedule() {
    this.weekDays.forEach((day) => {
      day.checked = this.daySchedule.split(', ').includes(day.name);
    });
  }

  updateDaySchedule(dayName: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const dayIndex = this.weekDays.findIndex((day) => day.name === dayName);

    if (dayIndex !== -1) {
      this.weekDays[dayIndex].checked = input.checked;

      this.daySchedule = '';

      this.daySchedule = this.weekDays
        .filter((day) => day.checked)
        .map((day) => day.name)
        .join(', ');
    }
  }
  
  updateTimeSchedule() {
    if (this.startHour !== '' && this.startMinute !== '' && this.startPeriod !== '' &&
        this.endHour !== '' && this.endMinute !== '' && this.endPeriod !== '') {
      this.timeSchedule = `${this.startHour}:${this.startMinute} ${this.startPeriod} - ${this.endHour}:${this.endMinute} ${this.endPeriod}`;
    } else {
      this.timeSchedule = '';
    }
  }

  manageClass() {
    this.showDayScheduleError = false;
    const anyDaySelected = this.weekDays.some((day) => day.checked);
    if (
      !this.className.trim() ||
      !this.classCode.trim() ||
      !this.daySchedule.trim() ||
      !anyDaySelected ||
      !this.timeSchedule.trim() ||
      !this.course.trim()
    ) {
      if (!anyDaySelected) {
        this.showDayScheduleError = true;
      }
      return;
    }

    const scheduleString = `${this.daySchedule} (${this.timeSchedule})`;

    const action = this.data == null ? 'Creating' : 'Updating';
    this.API.justSnackbar(`${action} class ....`, 999999999);

    if (this.data == null) {
      this.API.createClass(
        this.course,
        this.className,
        this.classCode,
        scheduleString
      ).subscribe(() => {
        this.API.successSnackbar('Class created successfully');
        this.closeModal('update');
      });
    } else {
      this.API.editClass(
        this.classID,
        this.className,
        this.classCode,
        scheduleString
      ).subscribe(() => {
        this.API.successSnackbar('Class updated successfully');
        this.closeModal('update');
      });
    }
  }

  closeModal(feedback: string | null) {
    this.activeModal.close(feedback);
  }
}
