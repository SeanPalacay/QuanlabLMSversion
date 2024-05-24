import { Component, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';

@Component({
  selector: 'app-thome',
  templateUrl: './thome.component.html',
  styleUrls: ['./thome.component.css']
})
export class ThomeComponent implements AfterViewInit,OnInit {
  month_names: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
  ];

  currentDate: Date = new Date();
  currentMonth: { value: number } = { value: this.currentDate.getMonth() };
  currentYear: { value: number } = { value: this.currentDate.getFullYear() };


  courses:any=[];
  classes:any=[];
  ngOnInit(): void {
    this.API.teacherCoursesAndEnrolled().subscribe(data=>{
      for(let course of data.output){
        const _course = course;
        _course.background = this.API.randomCourseCover(course.language.toLowerCase());
        this.courses.push(_course);
      }
    });
    this.API.teacherAllClasses().subscribe(data=>{
      this.classes = data.output;
    });
  }


  isLeapYear(year: number): boolean {
    return (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) ||
      (year % 100 === 0 && year % 400 === 0);
  }

  getFebDays(year: number): number {
    return this.isLeapYear(year) ? 29 : 28;
  }

  generateCalendar(month: number, year: number): void {
    const calendar_days = document.querySelector('.calendar-days') as HTMLElement;
    calendar_days.innerHTML = '';
    const calendar_header_year = document.querySelector('#year') as HTMLElement;
    const days_of_month: number[] = [
      31, this.getFebDays(year), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31
    ];
  
    const currentDate = new Date();
  
    const month_picker = document.querySelector('#month-picker') as HTMLElement;
    if (month_picker) {
      month_picker.innerHTML = this.month_names[month];
    }
  
    if (calendar_header_year) {
      calendar_header_year.innerHTML = year.toString();
    }
  
    const first_day = new Date(year, month);
  
    for (let i = 0; i <= days_of_month[month] + first_day.getDay() - 1; i++) {
      const day = document.createElement('div');
  
      if (i >= first_day.getDay()) {
        day.innerHTML = (i - first_day.getDay() + 1).toString();
  
        if (i - first_day.getDay() + 1 === currentDate.getDate() &&
          year === currentDate.getFullYear() &&
          month === currentDate.getMonth()
        ) {
          day.classList.add('current-date');
          day.style.color = 'white'; // Add this line to color the current date in blue
          day.style.background = 'linear-gradient(to right, #0172AF , #74FEBD)';// Background color
        }
      }
      calendar_days.appendChild(day);
    }
  }
  

  monthPickerOnClick(): void {
    const month_list = document.querySelector('.month-list') as HTMLElement;
    const dayTextFormate = document.querySelector('.day-text-formate') as HTMLElement;
    const timeFormate = document.querySelector('.time-formate') as HTMLElement;
    const dateFormate = document.querySelector('.date-formate') as HTMLElement;

    if (month_list && dayTextFormate && timeFormate && dateFormate) {
      month_list.classList.remove('hideonce');
      month_list.classList.remove('hide');
      month_list.classList.add('show');
      dayTextFormate.classList.remove('showtime');
      dayTextFormate.classList.add('hidetime');
      timeFormate.classList.remove('showtime');
      timeFormate.classList.add('hideTime');
      dateFormate.classList.remove('showtime');
      dateFormate.classList.add('hideTime');
    }
  }

  monthListOnClick(index: number): void {
    const month_list = document.querySelector('.month-list') as HTMLElement;
    const dayTextFormate = document.querySelector('.day-text-formate') as HTMLElement;
    const timeFormate = document.querySelector('.time-formate') as HTMLElement;
    const dateFormate = document.querySelector('.date-formate') as HTMLElement;

    if (month_list && dayTextFormate && timeFormate && dateFormate) {
      this.currentMonth.value = index;
      this.generateCalendar(this.currentMonth.value, this.currentYear.value);
      month_list.classList.replace('show', 'hide');
      dayTextFormate.classList.remove('hideTime');
      dayTextFormate.classList.add('showtime');
      timeFormate.classList.remove('hideTime');
      timeFormate.classList.add('showtime');
      dateFormate.classList.remove('hideTime');
      dateFormate.classList.add('showtime');
    }
  }

 preYearOnClick(): void {
  console.log('Previous Year Clicked');
  this.currentYear.value = this.currentYear.value - 1;
  this.generateCalendar(this.currentMonth.value, this.currentYear.value);
}

nextYearOnClick(): void {
  console.log('Next Year Clicked');
  this.currentYear.value = this.currentYear.value + 1;
  this.generateCalendar(this.currentMonth.value, this.currentYear.value);
}
  ngAfterViewInit(): void {
    this.generateCalendar(this.currentMonth.value, this.currentYear.value);
  }

  todayShowTime = document.querySelector('.time-formate') as HTMLElement;
  todayShowDate = document.querySelector('.date-formate') as HTMLElement;

  constructor(private router: Router, private API:APIService) {
    const currshowDate = new Date();
    const showCurrentDateOption: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long' as const,
    };
    
    const currentDateFormate = new Intl.DateTimeFormat(
      'en-US',
      showCurrentDateOption
    ).format(currshowDate);
    
    if (this.todayShowDate) {
      this.todayShowDate.textContent = currentDateFormate;
    }

    setInterval(() => {
      const timer = new Date();
      const option: Intl.DateTimeFormatOptions = {
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
      };
      
      const formateTimer = new Intl.DateTimeFormat('en-us', option).format(timer);
      const time = `${`${timer.getHours()}`.padStart(
        2,
        '0'
      )}:${`${timer.getMinutes()}`.padStart(
        2,
        '0'
      )}: ${`${timer.getSeconds()}`.padStart(2, '0')}`;
      if (this.todayShowTime) {
        this.todayShowTime.textContent = formateTimer;
      }
    }, 1000);
  }
  openMessage() {
    this.router.navigate(['teacher/communication']);
  }
  openInbox(){
    this.router.navigate(['teacher/communication']);
  }
}
