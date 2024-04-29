import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { APIService } from 'src/app/services/API/api.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit,OnDestroy {
  teachers = 0;
  students = 0;

  getStudents$?:Subscription;
  getTeachers$?:Subscription;
  
  constructor(private API: APIService){}
  ngOnInit(): void {
     this.getTeachers$ = this.API.getTeachers().subscribe(data=>{
      if(data.success){
        this.teachers = data.output.length;
      }else{
        this.API.failedSnackbar('Unable to load teachers data');
      }
     })

     this.getTeachers$ = this.API.getStudents().subscribe(data=>{
      if(data.success){
        this.students = data.output.length;
      }else{
        this.API.failedSnackbar('Unable to load student data');
      }
     })
  }
  ngOnDestroy(): void {
    this.getTeachers$?.unsubscribe();
    this.getStudents$?.unsubscribe();
  }
}
