import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbRatingConfig, NgbRatingModule } from '@ng-bootstrap/ng-bootstrap';
import { APIService } from 'src/app/services/API/api.service';
@Component({
  selector: 'app-coursecontent',
  templateUrl: './coursecontent.component.html',
  styleUrls: ['./coursecontent.component.css']
})
export class CoursecontentComponent implements OnInit{
  @Input() course:any
  lessons:any = [];
  courseCode:string='';
  constructor(private API:APIService,config: NgbRatingConfig, private router:Router  ,public activeModal: NgbActiveModal, ) {
		// customize default values of ratings used by this component tree
		config.max = 5;
		config.readonly = true;
	}

  ngOnInit(): void {
    this.API.teacherCourseLessons(this.course.id).subscribe(data=>{
      this.lessons = this.API.returnSuccess(data,'Faiiled loading lessons');
    })
  }

  showFullContent: boolean = false;

  enroll(){
    if(this.courseCode.trim() == ''){
      this.API.failedSnackbar('Enter course code');
      return;
    }
    this.API.justSnackbar('Enrolling course...');
    this.API.matchCourseCode(this.course.id, this.courseCode).subscribe(data=>{
      if(data.output.length > 0){
        this.API.enrollCourse(data.output[0].id).subscribe(()=>{
          this.API.pushNotifications(
            `${this.API.getFullName()} enrolled to your course, <b>'${this.course.course}'</b>`,
            `${this.API.getFullName()} enrolled to your course, <b>'${this.course.course}'</b>. This student will now have access to your lessons and activities in the said course.`,
            this.course.teacherid
          )
          this.API.successSnackbar('Congratulations! You are officially enrolled in ' + this.course.course)
          this.activeModal.close(true);
        })
      }else{
        this.API.failedSnackbar('Invalid Course Code!');
      }
    });
  }

  openCourse(courseID:string){
    this.API.setCourse(courseID);
    this.router.navigate(['/student/lessons'] );
  }

  toggleReadMore() {
    this.showFullContent = !this.showFullContent;
  }

  close(){
    this.activeModal.close();
  }
}
