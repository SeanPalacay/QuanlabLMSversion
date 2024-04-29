import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-survey-cert',
  templateUrl: './survey-cert.component.html',
  styleUrls: ['./survey-cert.component.css']
})
export class SurveyCertComponent {
  formData: any = {};
  @Input() myCustomClass: string = '';
  submitForm() {
    // Handle form submission logic here
    console.log('Form submitted:', this.formData);
    // You can add further logic such as sending data to a server or displaying a success message
  }

  handleFileInput(event: any) {
    const file: File = event.target.files[0];
    // Handle file input logic here
    console.log('File uploaded:', file);
    // You can add further logic such as validating the file type or displaying the file name
  }
  
}
