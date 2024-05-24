import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.css']
})
export class MaterialsComponent implements OnInit {
  task: any;
  assignmentTitle: string = 'Your Assignment Title';
  dueDate: string = 'January 1, 2024';
  description: string = 'You can fetch the actual data from your backend or set them dynamically';
  instructions: string[] = ['Initialize with your default value', 'Initialize with your default value'];
  attachments: any[] = ['Attachment 1', 'Attachment 2'];
  teacherComment:string|null = null;  // Add this line for student comments
  fileUpload: File | null = null;
  comments: string = '';
  uploaded: string|null = null;
  submitted = false;
  overdue: boolean = false;
  grade: number | null = null;
  teachername :string ='';

  constructor(private API: APIService, private route: ActivatedRoute,private router:Router, private location: Location) { }

  navigateBack(): void {
    this.router.navigate(['student/to-do']);
  }


  ngOnInit(): void {
    const taskID = this.route.snapshot.paramMap.get('taskID');
    if (taskID == undefined) {
      this.location.back();
    }

    this.API.showLoader();
    

    // this.API.justSnackbar('Loading content....',999999);
    this.API.studentGetAssignmentByID(taskID!).subscribe(data => {
      if (data.output.length <= 0) {
        this.location.back();
      }
      this.teachername = data.output[0].firstname + ' ' +  data.output[0].lastname
      this.task = data.output[0];
      this.API.studentAssignSubmitted(this.task.id).subscribe(data => {
        if (data.output.length > 0) {
          this.uploaded = data.output[0].attachments;
          this.comments = data.output[0].comments;  // Populate student comments
          this.grade = data.output[0].grade;
          this.submitted = true;
          
          this.teacherComment = data.output[0].feedback;
        }

        this.API.hideLoader();
        // this.API.justSnackbar('Content has been loaded');
      });

      this.assignmentTitle = this.task.title;
      this.dueDate = this.parseDate(this.task.deadline);
      this.description = this.task.details;
      this.attachments[0] = this.task.attachments;
    });
  }

  parseDate(date: string): string {
    const dateObject = new Date(date);
    this.overdue = (dateObject.getTime() - new Date().getTime()) / (1000 * 3600 * 24) < 0;
    return dateObject.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  openFile(file: string): void {
    this.API.openFile(file);
  }

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      this.fileUpload = inputElement.files[0];
    }
  }

  submit(): void {
    if (this.submitted) {
      this.API.successSnackbar('Task is already submitted!');
      return;
    }

    if (!this.API.checkAtLeastOneInput([this.fileUpload, this.comments])) {
      this.API.failedSnackbar('Please insert at least a comment or a file.');
      return;
    }

    let attachments: any = undefined;
    let comment: string | undefined = undefined;

    if (this.comments.trim() !== '') {
      comment = this.comments;
    }


    this.API.justSnackbar('Submitting work....', 9999999);
    if( this.fileUpload != undefined){
     var fileparse =  this.fileUpload.name.split(".");
     var serverLocation = this.API.createID36()+ '.' + fileparse[fileparse.length-1];
     this.API.uploadFile( this.fileUpload, serverLocation);
     var filelocation = 'files/' + serverLocation;
     var filename =  this.fileUpload.name;
      attachments = filelocation+'>'+filename; 
    }

    this.API.studentSubmitAssignment(this.task.id, comment, attachments).subscribe(data => {
      this.submitted = true;
      this.uploaded = attachments;
      this.API.pushNotifications(
        `${this.API.getFullName()} submitted a task`,
        `${this.API.getFullName()} submitted a task titled <b>'${this.task.title}'</b> for checking. Kindly check your task submission list for new submissions.`,
        this.task.teacherid
      )
      this.API.successSnackbar('Submitted output!');
    });
  }
}

  //   if( this.fileUpload != undefined){
  //     var fileparse =  this.fileUpload.name.split(".");
  //     var serverLocation = this.API.createID36()+ '.' + fileparse[fileparse.length-1];
  //     this.API.uploadFile( this.fileUpload, serverLocation);
  //     var filelocation = 'files/' + serverLocation;
  //     var filename =  this.fileUpload.name;
  //     attachments = filelocation+'>'+filename; 
  //   }
  //   console.log(comment);
  //   this.API.studentSubmitAssignment(this.task.id, comment, attachments).subscribe(data=>{
  //     this.submitted= true;
  //     this.uploaded =attachments;
  //     this.API.successSnackbar('Submitted output!');
  //   });
  // }
  
  
  // You can fetch the actual data from your backend or set them dynamically
  // based on your application logic.

  // For example, if you have an API call, you can fetch the data in ngOnInit:
  // ngOnInit() {
  //   this.fetchAssignmentData();
  // }

  // fetchAssignmentData() {
  //   // Assuming you have a service to fetch data
  //   this.materialsService.getAssignmentData().subscribe(data => {
  //     this.assignmentTitle = data.title;
  //     this.dueDate = data.dueDate;
  //     this.description = data.description;
  //     this.instructions = data.instructions;
  //     this.attachments = data.attachments;
  //   });
  // }
// }