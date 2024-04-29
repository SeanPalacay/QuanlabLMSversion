import { Component } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ModalsComponent } from 'src/app/speechlab/components/modals/modals.component';
@Component({
  selector: 'app-lab-laptop-teacher',
  templateUrl: './lab-laptop-teacher.component.html',
  styleUrls: ['./lab-laptop-teacher.component.css']
})
export class LabLaptopTeacherComponent {

  constructor(private modalService: NgbModal) {

  }
  openModal() {
    const modalOptions: NgbModalOptions = {
      centered: false
      // You can add other options here if needed
    };

    const modalRef = this.modalService.open(ModalsComponent, modalOptions);
    modalRef.componentInstance.myCustomClass = 'custom-modal'; // Pass the custom class name

}
}