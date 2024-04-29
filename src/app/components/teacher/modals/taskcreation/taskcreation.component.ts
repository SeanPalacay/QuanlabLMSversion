import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { NgbModal,NgbActiveModal  } from '@ng-bootstrap/ng-bootstrap';
import { APIService } from 'src/app/services/API/api.service';
@Component({
  selector: 'app-taskcreation',
  templateUrl: './taskcreation.component.html',
  styleUrls: ['./taskcreation.component.css']
})
export class TaskcreationComponent implements OnInit {
  @Input() data: any; // If you plan to pass data to the modal
  @Input() courses:any = [];
  course:string = '';
  deadline:string= '';
  title:string = '';
  description:string = '';
  file:File|null = null;
constructor(private modalService: NgbModal,private API:APIService, public activeModal: NgbActiveModal){
  
}

ngOnInit(): void {

}
onFileSelected(event: Event){
  const inputElement = event.target as HTMLInputElement;
  if (inputElement.files) {
    this.file = inputElement.files[0];
  }
}
closeModal(close?:string) {
  this.activeModal.close(close);
  // You can pass any data you want back to the calling component here
}
createTask(){
  var attachments = undefined;

  this.API.justSnackbar('Creating task.....', 9999999);
  if(this.file != null){
    var fileparse = this.file.name.split(".");
    var serverLocation = this.API.createID36() + '.' + fileparse[fileparse.length-1];
    this.API.uploadFile(this.file, serverLocation);
    var filelocation = 'files/' + serverLocation;
    var filename = this.file.name;
    attachments = filelocation+'>'+filename; 
  }
  if(this.API.checkInputs([this.deadline, this.title, this.description, this.course])){
    this.API.createTask(this.course,this.title,this.description,this.deadline,attachments).subscribe(()=>{
      this.API.successSnackbar('Task created!');
      this.API.notifyStudentsInCourse(
        `${this.API.getFullName()} uploaded a new task.`,
        `${this.API.getFullName()} uploaded a new task titled, <b>'${this.title}'</b>. Kindly take a moment to check the specified task. The task is due on <b>${this.API.parseDate(this.deadline)}</b>.`,
        this.course);
      this.closeModal('update');
    });
  }else{
    this.API.failedSnackbar('Please fill out all the fields.');
  }
}
}
