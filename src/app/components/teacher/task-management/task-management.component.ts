import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TaskcreationComponent } from '../modals/taskcreation/taskcreation.component';
import { CreateFeedbackComponent } from '../modals/create-feedback/create-feedback.component';
import { APIService } from 'src/app/services/API/api.service';
import { Router } from '@angular/router';
import { TeacherViewComponent } from '../teacher-view/teacher-view.component';

@Component({
  selector: 'app-task-management',
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.css'],
})
export class TaskManagementComponent implements OnInit {
  currentDate!: string;
  courses: Map<string, any> = new Map();
  tasks: any = [];
  filterCourse: string = '';
  submissions: any = [];

  // Add Router to the constructor
  constructor(
    private modalService: NgbModal,
    private API: APIService,
    private router: Router
  ) {}

  ngOnInit() {
    this.API.showLoader();
    const currentDate = new Date();
    this.currentDate = currentDate.toISOString().split('T')[0];
    this.API.teacherAllCourses().subscribe((data) => {
      for (let course of data.output) {
        this.courses.set(course.id, course);
      }
      this.API.hideLoader();
    });
    this.API.teacherGetAllSubmissions().subscribe((data) => {
      this.submissions = data.output;
    });
    this.loadTasks();
  }

  loadTasks() {
    this.API.teacherGetTasks().subscribe((data) => {
      this.tasks = data.output;
    });
  }

  selectCourse(courseid: string) {
    this.filterCourse = courseid;
  }

  openFile(file: string) {
    this.API.openFile(file);
  }

  taskCreation() {
    const modalRef = this.modalService.open(TaskcreationComponent);
    modalRef.componentInstance.courses = Array.from(this.courses.values());
    modalRef.closed.subscribe((data) => {
      if (data != undefined) {
        this.loadTasks();
      }
    });
  }

  createfeedback() {
    const modalRef = this.modalService.open(CreateFeedbackComponent);
  }

  navigateToTeacherView(submission:any): void {

    this.router.navigate(['teacher/teacher-view',{sid: submission.id, aid:submission.assignmentid, s: submission.firstname + " " + submission.lastname }]);
  }
  navigateBack(): void {
    this.router.navigate(['teacher/t-home']);
  }
}
