import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbModal,NgbActiveModal  } from '@ng-bootstrap/ng-bootstrap';
import { APIService } from 'src/app/services/API/api.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-problemreport',
  templateUrl: './problemreport.component.html',
  styleUrls: ['./problemreport.component.css']
})
export class ProblemreportComponent {
  @Input() data: any; // If you plan to pass data to the modal

  option:string = ''
  constructor(private modalService: NgbModal, private API:APIService,public activeModal: NgbActiveModal){
    
  }
  closeModal() {
    this.activeModal.close('Close click');
    
  }
  
  title:string = '';
  description:string = '';

  selectOption(event:any){
    this.option = event.target.value;
  }

  submit() {
   if(this.title == '' || this.option == '' || this.description ==''){
    this.API.failedSnackbar('Fill out all the fields!')
    return;
   }

   this.API.pushNotifications(
    `Issue reported related to <b>'${this.option}'</b>`,
    `<b>${this.API.getFullName()}</b>  reported an issue related to system <b>${this.option}</b>. <br> Title: <b>'${this.title}'</b> <br>Description: <b>${this.description}</b>`,
    '[--administrator--]'
   )
    Swal.fire({
      title: 'Reported Successfully',
      text: 'Your Bug Report has been submitted successfully!',
      icon: 'success',
      confirmButtonColor: 'rgb(116, 254, 189)',
    });
    this.activeModal.close();
  }


  error() {
    Swal.fire({
      title: 'Failed',
      text: 'Sorry, it seems your request failed.',
      icon: 'error',
      confirmButtonText: 'TRY AGAIN',
      confirmButtonColor: 'rgb(116, 254, 189)',
    });
  }
}
