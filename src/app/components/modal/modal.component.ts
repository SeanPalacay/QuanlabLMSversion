import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { ModalService } from '../modalServices/modal.service';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { APIService } from 'src/app/services/API/api.service';
import { firstValueFrom, lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css'],
})
export class ModalComponent {
  
  @Input() data: any; // If you plan to pass data to the modal
  firstname: string = '';
  lastname: string = '';
  address: string = '';
  email: string = '';
  nationality: string = '';
  birthdate: string = '';
  gender: string = 'Male'
  password: string = '';
  confirmpassword: string = '';
  host: string = new URL(window.location.href).origin;
  inputErrors = {
    firstname: false,
    lastname: false,
    address: false,
    email: false,
    nationality: false,
    birthdate: false,
    gender: false,
    password: false,
    confirmpassword: false,
  };
  registrationSuccessful = false;

  constructor(
    private API: APIService,
    private modalService: NgbModal,
    public activeModal: NgbActiveModal
  ) {}

  closeModal() {
    this.modalService.dismissAll(); // Close all opened modals
  }
  
  


  open(content: any) {
    this.modalService.open(content);
    this.resetErrorFlags(); // Clear error flags when the modal is opened
  }

  async request() {
    this.submitRequest();
  }
 
  async submitRequest() {
    // Reset the input design here
    Object.keys(this.inputErrors).forEach((key) => {
      this.inputErrors[key as keyof typeof this.inputErrors] = false;
    });

    const details = {
      host: this.host,
      firstname: this.firstname,
      lastname: this.lastname,
      address: this.address,
      email: this.email,
      nationality: this.nationality,
      birthdate: this.birthdate,
      gender: this.gender,
      password: this.password,
    };


    for (let [key, value] of Object.entries(details)) {
      if (value.trim() != this.API.escapeHtml(value.trim()) && key != 'password') {
        this.API.failedSnackbar(key[0].toUpperCase() + key.slice(1) + ' contains invalid characters');
        (this.inputErrors as any)[key] = true; // Cast and set the error flag for the input field
        return;
      }
      if (value.trim() == '') {
        this.API.failedSnackbar(key[0].toUpperCase() + key.slice(1) + ' field is required');
        (this.inputErrors as any)[key] = true; // Cast and set the error flag for the input field
        return;
      }
    }
    this.API.justSnackbar('Requesting for registration....', 9999999999);

    if(!(await this.API.checkMaxRegistrations())){
      this.API.failedSnackbar('Maximum number of registration is reached, Please contact or administrator for more requests.');
      return;
    }

    const studTaken = await lastValueFrom(this.API.checkEmailExists(this.email, 'students'));
    if (studTaken.output.length > 0) {
      this.API.failedSnackbar('Email is already taken');
      return;
    }
    const teachTaken = await lastValueFrom(this.API.checkEmailExists(this.email, 'teachers'));
    if (teachTaken.output.length > 0) {
      this.API.failedSnackbar('Email is already taken');
      return;
    }
    if (this.password != this.confirmpassword) {
      this.API.failedSnackbar('Passwords do not match.');
      return;
    }

    // this.API.register(details).subscribe(data=>{
    //   this.API.successSnackbar('Registered!');
    //   console.log(data);
    // })
    

    // Check if pending verification
    const pending$ =  this.API.checkIfPendingVerification(details.email).subscribe(data=>{
      if(data.output.length>0){
        this.API.failedSnackbar('Email is pending for verification.')
      }else{
        this.API.sendVerification(details).subscribe(
          async (data) => {
            await firstValueFrom(this.API.pushVerification(data.response));
            this.API.successSnackbar('Please wait for admin to verify request, a notification will be sent to your email', 9999999999);
            this.API.pushNotifications(
              `New request for account verification`,
              `<b>${details.firstname} ${details.lastname}</b> requested verification for new account.`,
              '[--administrator--]'
             )
            this.registrationSuccessful = true;
            this.closeModal();
          },
          (err) => {
            this.API.failedSnackbar(
              'Error sending request, check if email is valid. Please contact the developers if the problem persists.'
            );
          }
        );
      }
      pending$.unsubscribe();
    })
    
   
  }

  resetErrorFlags() {
    Object.keys(this.inputErrors).forEach((key) => {
      this.inputErrors[key as keyof typeof this.inputErrors] = false;
    });
  }
  
  
  
}
