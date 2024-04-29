import { AfterContentInit, Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { APIService } from 'src/app/services/API/api.service';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
  selector: 'app-add-principal',
  templateUrl: './add-principal.component.html',
  styleUrls: ['./add-principal.component.css']
})
export class AddPrincipalComponent {
  selectedUser:any;
  lastName: string = '';
  firstName: string = '';
  email: string = '';
  password: string = '';
  currentDate: string = new Date().getTime().toString();
  role: string = 'Admin';

  constructor(public activeModal: NgbActiveModal, private API: APIService) {}

  ngAfterContentInit(): void {
    if(this.selectedUser){
      this.lastName = this.selectedUser.lastname;
      this.firstName = this.selectedUser.firstname;
      this.email = this.selectedUser.email;
      this.role = this.selectedUser.role;
    }
  }

  addTeacher() {
    // Validate the inputs
    if (this.API.checkInputs([this.role , this.lastName , this.firstName , this.email])) {
      const email = this.email
      const newTeacher:any = {
        role: this.role ,
        lastname: this.lastName,
        firstname: this.firstName,
        email: email,
        password: this.password.trim() =='' ? null : this.password,
      };

      if(this.selectedUser){
        newTeacher.id = this.selectedUser.id;
        // Log the details before sending the request
      // console.log('Teacher details before saving:', newTeacher);
      this.API.justSnackbar('Updatiing teacher info...', 999999999);
      // Send a request to the backend to add the new teacher
      this.API.updateAdmin(newTeacher).subscribe(
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
      this.API.addAdmin(newTeacher).subscribe(
        (data: any) => {
          console.log(data);
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
