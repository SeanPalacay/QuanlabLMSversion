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
  timeSchedules: string[] = [''];
  showDayScheduleError: boolean = false;

  startHours: string[] = [''];
  startMinutes: string[] = [''];
  startPeriods: string[] = [''];
  endHours: string[] = [''];
  endMinutes: string[] = [''];
  endPeriods: string[] = [''];

  hours: string[] = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
  minutes: string[] = Array.from({ length: 60 }, (_, i) => (i < 10 ? '0' : '') + i.toString());

  weekDays = [
    { name: 'M', checked: false },
    { name: 'T', checked: false },
    { name: 'W', checked: false },
    { name: 'Th', checked: false },
    { name: 'F', checked: false },
    { name: 'Sa', checked: false },
    { name: 'Su', checked: false },
  ];

  constructor(private API: APIService, public activeModal: NgbActiveModal) {}

  ngOnInit(): void {
    if (this.data) {
      this.className = this.data.className;
      this.classCode = this.data.classCode;
      this.daySchedule = this.data.daySchedule;
      this.classID = this.data.classID;
      this.course = this.data.courseID;
      this.updateWeekDaysFromSchedule();
      this.parseTimeSchedules(this.data.timeSchedule);
    }
  }

  parseTimeSchedules(timeScheduleString: string) {
    this.timeSchedules = timeScheduleString.split(', ').map(schedule => {
      const timeParts = schedule.match(/(\d{1,2}):(\d{2}) ([AP]M) - (\d{1,2}):(\d{2}) ([AP]M)/);
      if (timeParts) {
        const startHour = timeParts[1];
        const startMinute = timeParts[2];
        const startPeriod = timeParts[3];
        const endHour = timeParts[4];
        const endMinute = timeParts[5];
        const endPeriod = timeParts[6];
        return `${startHour}:${startMinute} ${startPeriod} - ${endHour}:${endMinute} ${endPeriod}`;
      }
      return '';
    }).filter(schedule => schedule.trim() !== '');
  
    this.startHours = this.timeSchedules.map(schedule => schedule.split(' - ')[0].split(':')[0]);
    this.startMinutes = this.timeSchedules.map(schedule => schedule.split(' - ')[0].split(':')[1].split(' ')[0]);
    this.startPeriods = this.timeSchedules.map(schedule => schedule.split(' - ')[0].split(' ')[1]);
    this.endHours = this.timeSchedules.map(schedule => schedule.split(' - ')[1].split(':')[0]);
    this.endMinutes = this.timeSchedules.map(schedule => schedule.split(' - ')[1].split(':')[1].split(' ')[0]);
    this.endPeriods = this.timeSchedules.map(schedule => schedule.split(' - ')[1].split(' ')[1]);
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
  
  addTimeSchedule() {
    this.timeSchedules.push('');
    this.startHours.push('');
    this.startMinutes.push('');
    this.startPeriods.push('');
    this.endHours.push('');
    this.endMinutes.push('');
    this.endPeriods.push('');
  }

  removeTimeSchedule(index: number) {
    this.timeSchedules.splice(index, 1);
    this.startHours.splice(index, 1);
    this.startMinutes.splice(index, 1);
    this.startPeriods.splice(index, 1);
    this.endHours.splice(index, 1);
    this.endMinutes.splice(index, 1);
    this.endPeriods.splice(index, 1);
  }

  updateTimeSchedule(index: number) {
    const startHour = this.startHours[index];
    const startMinute = this.startMinutes[index];
    const startPeriod = this.startPeriods[index];
    const endHour = this.endHours[index];
    const endMinute = this.endMinutes[index];
    const endPeriod = this.endPeriods[index];

    if (startHour && startMinute && startPeriod && endHour && endMinute && endPeriod) {
      this.timeSchedules[index] = `${startHour}:${startMinute} ${startPeriod} - ${endHour}:${endMinute} ${endPeriod}`;
    } else {
      this.timeSchedules[index] = '';
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
      this.timeSchedules.some(schedule => !schedule.trim()) ||
      !this.course.trim()
    ) {
      if (!anyDaySelected) {
        this.showDayScheduleError = true;
      }
      return;
    }

    const scheduleString = `${this.daySchedule} (${this.timeSchedules.join(', ')})`;

    const action = this.data == null ? 'Creating' : 'Updating';
this.API.justSnackbar(`${action} class ....`);

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