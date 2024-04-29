import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/API/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-tlab',
  templateUrl: './tlab.component.html',
  styleUrls: ['./tlab.component.css']
})
export class TlabComponent implements OnInit{
  courses:any;
  constructor(private API:APIService,private router: Router){}
  ngOnInit(): void {
    this.API.getCourses().subscribe(data=>{
      this.courses = data.output;
    });
  }
  lessonsko() {
    this.router.navigate(['teacher/lab/lessons']);
  }
}
