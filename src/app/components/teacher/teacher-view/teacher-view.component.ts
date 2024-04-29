import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';
import { Location } from '@angular/common';
import { LoaderService } from 'src/app/loader.service';
@Component({
  selector: 'app-teacher-view',
  templateUrl: './teacher-view.component.html',
  styleUrls: ['./teacher-view.component.css']
})
export class TeacherViewComponent implements OnInit {

  constructor(private router: Router, private route:ActivatedRoute,  private location: Location, private API:APIService) {}
  submissionID:string = '';
  task: any = {
    // title: 'Sample Task Title',
    // submittedTime: 'January 1, 2024 12:00 PM',
    // description: 'This is a sample task description.',
    // attachedFiles: [
    //   // { name: 'botoboto 1.pdf', url: '/files/file1.pdf' },
    //   // { name: 'botoboto 2.ppt', url: '/files/file2.ppt' },
    // ],
    // userComment: 'This is a sample user comment.',
  };

  graded:boolean =false;
  studentID:string = '';
  ngOnInit(): void {
    const taskID = this.route.snapshot.paramMap.get('aid');
    const subID = this.route.snapshot.paramMap.get('sid');
    this.submissionID = subID!;
    const name = this.route.snapshot.paramMap.get('s');
    this.API.showLoader();
    const get$ = this.API.teacherGetAssignment(taskID!).subscribe(data => {
      if (data.output.length <= 0) {
        this.location.back();
      }

      const task = data.output[0];

      const getS$= this.API.teacherGetStudentAssignment(subID!).subscribe(data => {
        const submission = data.output[0];
        // console.log(task,submission)
        this.studentID = submission.studentid;
        const attch = [];
        const submm = [];
        if(task.attachments){
          attch.push({name: task.attachments.split('>')[1], url:task.attachments.split('>')[0]})
        }
        if(submission.attachments){
          submm.push( {name: submission.attachments.split('>')[1], url:submission.attachments.split('>')[0]})
        }
        this.task={
          by:name,
          title : task.title,
          submittedTime: this.API.parseDateTime(submission.time),
          description: task.details,
          attachedFiles: attch,
          submittedFiles: submm,
          userComment: submission.comments
        }
        if(submission.grade){
          this.gradingText = submission.grade;
          this.commentText = submission.feedback ?? ''
          this.graded = true;
        }
        get$.unsubscribe();
        getS$.unsubscribe();
        this.API.hideLoader();
      });

    
    });
  }

  openFile(file:string){
    this.API.openFile(file);
  }

  gradingText: string = '';
  commentText: string = '';

  studentComments: string[] = [
    // 'BOTO BOTO ',
  ];


  submitGrades() {
    if(this.graded){
      this.API.successSnackbar('This student already has a grade.');
      return;
    }
    // Implement your grading submission logic here
    if(!this.API.checkInputs([this.gradingText])){
      this.API.failedSnackbar('Please input a grade.')
      return;
    }
    this.API.justSnackbar('Grading student....', 9999999);
    this.API.teacherGradeTask(this.submissionID, this.gradingText, this.commentText.trim() =='' ? undefined : this.commentText).subscribe(data=>{
      this.API.successSnackbar('Graded a student!');
      this.API.teacherGetStudentAssignment(this.submissionID).subscribe(data2 => {
        const submission = data2.output[0];
        this.gradingText = submission.grade;
        this.commentText = submission.feedback?? '';
        this.graded = true;
      });

      this.API.pushNotifications(
        `${this.API.getFullName()} graded your assignment.`,
        `${this.API.getFullName()} graded your assignment titled, <b>'${this.task.title}'</b>, <br>
          <b>Grade: </b> ${this.gradingText} <br>
          ${this.commentText.trim()==''?'':'<b>Comment: </b>' + this.commentText}
        `,
        this.studentID
      )
    })
    // console.log('Grading submitted:', this.gradingText);
    // console.log('Comment submitted:', this.commentText);
    // You may want to send this data to a backend server for processing
  }

  goBack(): void {
    // Implement the logic to navigate back
    this.router.navigate(['teacher/task-management']); 
  }
}
