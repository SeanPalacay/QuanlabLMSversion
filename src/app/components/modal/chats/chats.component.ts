import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbModal,NgbActiveModal  } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-chats',
  templateUrl: './chats.component.html',
  styleUrls: ['./chats.component.css']
})
export class ChatsComponent {
  @Input() data: any; // If you plan to pass data to the modal

  constructor(private modalService: NgbModal, public activeModal: NgbActiveModal){
    
  }
  closeModal() {
    this.activeModal.close('Close click');
    // You can pass any data you want back to the calling component here
  }

}
