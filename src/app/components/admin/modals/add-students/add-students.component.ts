import { Component } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { APIService } from 'src/app/services/API/api.service';

@Component({
  selector: 'app-add-students',
  templateUrl: './add-students.component.html',
  styleUrls: ['./add-students.component.css'],
})
export class AddStudentsComponent {
  // Declare variables to store input values
  selectedUser:any;
  studentNo: string = '';
  lastName: string = '';
  firstName: string = '';
  email: string = '';
  password: string = '';

  errorMessage: string = ''; // Added error message variable

  constructor(public activeModal: NgbActiveModal, private API: APIService) {}
  ngAfterContentInit(): void {
    if(this.selectedUser){
      this.lastName = this.selectedUser.lastname;
      this.firstName = this.selectedUser.firstname;
      this.email = this.selectedUser.email;
      this.studentNo = this.selectedUser.visibleid;
    }
  }
  // Function to handle adding a new student
  addStudent() {
    console.log('Adding student...');
    console.log('Student details:', this.studentNo, this.lastName, this.firstName, this.email, this.password);

    
    // Validate the inputs
    if (this.studentNo && this.lastName && this.firstName) {
      const email = this.email.trim() != '' ? this.email : this.selectedUser.id;
      // Create a new student object
      const newStudent = {
        id: this.selectedUser.id,
        studentNo: this.studentNo,
        lastname: this.lastName,
        firstname: this.firstName,
        email: email,
        password: this.password.trim() =='' ? null : this.password,
      };
      
      // Send a request to the backend to add the new student
      this.API.justSnackbar('Updating student info....')
      this.API.updateStudentInfo(newStudent).subscribe(
        (data: any) => {
          console.log('Response from server:', data);

          if (data.success) {
            // Close the modal and refresh the data
            this.activeModal.close('saved');
            this.API.successSnackbar('Updated student info!')
          } else {
            // Handle error
            console.error('Failed to add student:', data.message);
            this.errorMessage = 'Failed to add student. Please try again.';
          }
        },
        (error) => {
          // Handle HTTP error
          console.error('HTTP error:', error);
          this.errorMessage = 'Failed to communicate with the server. Please try again later.';
        }
      );
    } else {
      // Set an error message for missing fields
      this.errorMessage = 'Please fill in all the fields.';
    }
  }

  // Function to close the modal
  closeModal() {
    this.activeModal.close();
  }
}
