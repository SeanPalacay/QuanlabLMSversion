import { Component, OnInit } from '@angular/core';
import { QuizCreationComponent } from '../modals/quiz-creation/quiz-creation.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ActivatedRoute } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';
import { environment } from 'src/environments/environment';
import { ViewerComponent } from 'src/app/components/viewer/viewer.component';
import { EditCourseComponent } from '../../modals/edit-course/edit-course.component';

@Component({
  selector: 'app-tlessons',
  templateUrl: './tlessons.component.html',
  styleUrls: ['./tlessons.component.css']
})
export class TlessonsComponent implements OnInit {
  
  courseID:string;
  course:any;
  lessons:Array<any>= [];
  constructor( private modalService: NgbModal, 
    private route: ActivatedRoute,
    private API:APIService  
  ){
    this.courseID =  this.route.snapshot.paramMap.get('cid')!;
  }
  //sample prof
  professorName: string = 'Lany Maceda';

  

  ngOnInit(): void {
    this.API.teacherGetCoursebyID(this.courseID).subscribe(data=>{
      const output =  this.API.returnSuccess(data, 'Error getting course');
      if(output.length <= 0){
        return;
      }
      this.course = output[0];
      
    });
    this.API.teacherCourseLessons(this.courseID).subscribe(data=>{
      this.lessons =  this.API.returnSuccess(data, 'Error getting lessons');
    })
  }


  openEdit() {
    const modalOptions: NgbModalOptions = {
      centered: false
      // You can add other options here if needed
    };

    const modalRef = this.modalService.open(EditCourseComponent, modalOptions);
    modalRef.componentInstance.myCustomClass = 'custom-modal'; // Pass the custom class name

    // You might pass data or perform any other operations here.
  }



  openFile(file:string){
    const modalOptions: NgbModalOptions = {
      centered: false,
      size: 'lg',
      windowClass: 'viewer-window',
      // You can add other options here if needed
    };
  
    const modalRef = this.modalService.open(ViewerComponent, modalOptions);
    modalRef.componentInstance.link = environment.server +'/' + file; // Pass the custom class name
  }

  openModal() {
    const modalOptions: NgbModalOptions = {
      centered: false
      // You can add other options here if needed
    };

    const modalRef = this.modalService.open(QuizCreationComponent, modalOptions);
    modalRef.componentInstance.myCustomClass = 'custom-modal'; // Pass the custom class name
    // You might pass data or perform any other operations here.
  }

  parseTime(time:string){
    var t = time.split(/[- :]/) as unknown as Array<number>;

// Apply each element to the Date function
  return (new Date(Date.UTC(t[0], t[1]-1, t[2], t[3], t[4], t[5]))).toLocaleString();
  }
}
