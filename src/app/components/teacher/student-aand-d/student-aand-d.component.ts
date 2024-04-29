import { Component, OnInit } from '@angular/core';
import { APIService } from 'src/app/services/API/api.service';

@Component({
  selector: 'app-student-aand-d',
  templateUrl: './student-aand-d.component.html',
  styleUrls: ['./student-aand-d.component.css']
})
export class StudentAandDComponent implements OnInit {
  classes:any;
  students:any;
  constructor(
    private API : APIService
  ){}
  ngOnInit(): void {
    this.loadClasses();
  }

  
  loadStudents(classID:string){
    this.API.getStudentsInClass(classID).subscribe(
      data=>{
        if(data.success){
          this.students = data.output;
        }else{
          this.API.failedSnackbar(data.output, 3000);
        }
      }
    )
  } 

  loadClasses(){
    this.API.getCourseClasses().subscribe(data=>{
      if(data.success){
        this.classes = data.output;
      }else{
        this.API.failedSnackbar('Unable to connect to the server.', 3000);
      }
    });
  }
}
