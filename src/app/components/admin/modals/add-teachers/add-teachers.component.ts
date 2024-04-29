import { AfterContentInit, Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { APIService } from 'src/app/services/API/api.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-add-teachers',
  templateUrl: './add-teachers.component.html',
  styleUrls: ['./add-teachers.component.css']
})
export class AddTeachersComponent implements AfterContentInit{
  selectedUser:any;
  lastName: string = '';
  firstName: string = '';
  email: string = '';
  password: string = '';
  title: string = '';
  currentDate: string = new Date().getTime().toString();
  teacherId: string = 'Q-T' + this.currentDate.substring(4, 7) + '-' + this.currentDate.substring(7, 13);

  constructor(public activeModal: NgbActiveModal, private API: APIService) {}

  ngAfterContentInit(): void {
    if(this.selectedUser){
      this.lastName = this.selectedUser.lastname;
      this.firstName = this.selectedUser.firstname;
      this.email = this.selectedUser.email;
      this.teacherId = this.selectedUser.visibleid;
      this.title = this.selectedUser.job
    }
  }

  addTeacher() {
    // Validate the inputs
    if (this.API.checkInputs([this.teacherId , this.lastName , this.firstName ,this.title])) {
      const email = this.email.trim() != '' ? this.email : this.selectedUser? this.selectedUser.id:this.teacherId;
      const newTeacher:any = {
        visibleid: this.teacherId ,
        lastname: this.lastName,
        firstname: this.firstName,
        email: email,
        password: this.password.trim() =='' ? null : this.password,
        job: this.title
      };

      if(this.selectedUser){
        newTeacher.id = this.selectedUser.id;
        // Log the details before sending the request
      // console.log('Teacher details before saving:', newTeacher);
      this.API.justSnackbar('Updatiing teacher info...', 999999999);
      // Send a request to the backend to add the new teacher
      this.API.updateTeacher(newTeacher).subscribe(
        (data: any) => {
          if (data.success) {
            // Close the modal and refresh the data
            this.activeModal.close('saved');
          } else {
            // Handle error
            console.error('Failed to save teacher:', data.message);
          }
        },
        (error) => {
          // Handle HTTP error
          if (error instanceof HttpErrorResponse) {
            console.error('HTTP error status:', error.status);
            console.error('HTTP error message:', error.error);
          } else {
            console.error('Unexpected error:', error);
          }
        }
      );
      }else{
        // Log the details before sending the request
      // console.log('Teacher details before saving:', newTeacher);
      this.API.justSnackbar('Adding new teacher...', 999999999);
      // Send a request to the backend to add the new teacher
      this.API.addTeacher(newTeacher).subscribe(
        (data: any) => {
          if (data.success) {
            // Close the modal and refresh the data
            this.activeModal.close('saved');
          } else {
            // Handle error
            console.error('Failed to add teacher:', data.message);
          }
        },
        (error) => {
          // Handle HTTP error
          if (error instanceof HttpErrorResponse) {
            console.error('HTTP error status:', error.status);
            console.error('HTTP error message:', error.error);
          } else {
            console.error('Unexpected error:', error);
          }
        }
      );
      }
    } else {
      // Set an error message for missing fields
      this.API.failedSnackbar('Please fill in all the fields.');
    }
  }

  closeModal() {
    this.activeModal.close();
  }
}
