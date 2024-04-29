import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { APIService } from 'src/app/services/API/api.service';

@Component({
  selector: 'app-count',
  templateUrl: './count.component.html',
  styleUrls: ['./count.component.css'],
})
export class CountComponent implements OnInit, OnDestroy{

  constructor(private API:APIService){}

  users = [
    {
      name: 'John Doe',
      wordsSearched: 150,
      sessionsPerClass: 3,
      totalSessions: 900, // Total sessions in minutes
    },
    {
      name: 'Jane Smith',
      wordsSearched: 200,
      sessionsPerClass: 2,
      totalSessions: 600, // Total sessions in minutes
    },
    // Add more user objects as needed
  ];

  classDetails:any = [
    // {
    //   className: 'Math 101',
    //   teacher: 'Mr. Johnson',
    //   numStudents: 30,
    //   minutesPerMonth: 1200,
    // },
    // {
    //   className: 'History 202',
    //   teacher: 'Ms. Williams',
    //   numStudents: 25,
    //   minutesPerMonth: 800,
    // },
    // Add more class detail objects as needed
  ];

  getSession$?:Subscription;
  getSearches$?:Subscription;

  totalWordCount = 0;

  ngOnInit(): void {
    this.getSession$ = this.API.loadMeetingSessions().subscribe(data=>{
      for(let session of data.output){
        this.classDetails.push({
          className : session.class,
          teacher : session.firstname + ' ' + session.lastname,
          numStudents: Number(session.participants) -  1,
          minutes: this.calcMinutes(session.starttime, session.endtime)
        });
      }
    })

    this.getSearches$ = this.API.loadWordSearches().subscribe(data=>{
      this.totalWordCount = data.output.length;
    })
  }

  calcMinutes(start:string, end:string){
    return Number(((Math.abs(new Date(start).getTime() - new Date(end).getTime()) / 1000)/60).toFixed(2) );
  }

  ngOnDestroy(): void {
    this.getSession$?.unsubscribe();
    this.getSearches$?.unsubscribe();
  }

  getTotalWordsSearched(): number {
    // return this.users.reduce((total, user) => total + user.wordsSearched, 0);
    return this.totalWordCount;
  }

  getTotalMinutesSession(): number {
    const totalMinutes = this.classDetails.reduce((total:any, classDetail:any) => total + classDetail.minutes, 0);
    return totalMinutes;
  }

  // Helper function to format minutes into hours and minutes
  formatMinutesToHoursAndMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes.toFixed(0)}m`;
  }
}
