import { Component } from '@angular/core';

@Component({
  selector: 'app-create-feedback',
  templateUrl: './create-feedback.component.html',
  styleUrls: ['./create-feedback.component.css']
})
export class CreateFeedbackComponent {
  selectedFileName: string | undefined;

  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      this.selectedFileName = inputElement.files[0].name;
    }
  }
}
