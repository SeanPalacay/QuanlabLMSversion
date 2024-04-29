import { Component, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-edit-details',
  templateUrl: './edit-details.component.html',
  styleUrls: ['./edit-details.component.css']
})
export class EditDetailsComponent {
  @Input() selectedUser: any;

  constructor(public activeModal: NgbActiveModal) {}

  closeModal() {
    this.activeModal.close('Close click');
  }

  saveChanges() {
    // abang for changes in the backend
    // BOSS You can call a service to update the user details
    this.closeModal();
  }
}
