import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom } from 'rxjs';
import { APIService } from 'src/app/services/API/api.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-survey-cert',
  templateUrl: './survey-cert.component.html',
  styleUrls: ['./survey-cert.component.css']
})
export class SurveyCertComponent implements OnInit {
  formData: any = {};
  courseid: string = '';
  certInfo: any;
  
  satisfaction: string = '';
  difficulties: string = '';
  recommendation: string = '';
  importance: string = '';
  influence: number = 0;
  comments: string = '';



  satisfactionOptions = [
    { id: 'very-satisfied', value: 'Very satisfied', label: 'Very satisfied' },
    { id: 'satisfied', value: 'Satisfied', label: 'Satisfied' },
    { id: 'neutral', value: 'Neutral', label: 'Neutral' },
    { id: 'dissatisfied', value: 'Dissatisfied', label: 'Dissatisfied' },
    { id: 'very-dissatisfied', value: 'Very dissatisfied', label: 'Very dissatisfied' }
  ];

  recommendationOptions = [
    { id: 'definitely-recommend', value: 'Definitely recommend', label: 'Definitely recommend' },
    { id: 'likely-recommend', value: 'Likely recommend', label: 'Likely recommend' },
    { id: 'neutral', value: 'Neutral', label: 'Neutral' },
    { id: 'unlikely-recommend', value: 'Unlikely recommend', label: 'Unlikely recommend' },
    { id: 'definitely-not-recommend', value: 'Definitely not recommend', label: 'Definitely not recommend' }
  ];

  importanceOptions = [
    { id: 'very-important', value: 'Very important', label: 'Very important' },
    { id: 'somewhat-important', value: 'Somewhat important', label: 'Somewhat important' },
    { id: 'not-very-important', value: 'Not very important', label: 'Not very important' },
    { id: 'not-important-at-all', value: 'Not important at all', label: 'Not important at all' }
  ];
  influenceRatings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  survey:any = [
    {
      "question": "How satisfied are you with the process of claiming your course certificate?",
      "options": this.satisfactionOptions,
      "type": "radio",
      "required": true,
      "answer" : null
    },
    {
      "question": "Did you encounter any challenges or difficulties while claiming your certificate? If yes, please specify.",
      "options": null,
      "required": false,
      "type": "text",
      "answer" : null
    },
    {
      "question": "Would you recommend this course to others based on your experience with claiming the certificate?",
      "options": this.recommendationOptions,
      "type": "radio",
      "required": true,
      "answer" : null
    },
    {
      "question": "On a scale of 1 to 10, how much did the availability of a course certificate influence your decision to enroll in this course?",
      "options": this.influenceRatings,
      "type": "radio",
      "required": true,
      "answer" : null
    },
    {
      "question": "Any comments or suggestions you would like to share?",
      "options": null,
      "required": false,
      "type": "text",
      "answer" : null
    },
  ]

  constructor (private API:APIService,  private modalService: NgbModal){}

  isNumber(val:any): boolean { return typeof val === 'number'; }
  
  async ngOnInit(){
      
  }
  
  async submitForm() {
    // Handle form submission logic here
    console.log('Form submitted:', this.formData);

    console.log(this.survey)
    // show certificate
    for (let surveyItem of this.survey){
      if(!this.API.checkInputs([surveyItem.answer]) && surveyItem.required ){
        this.API.failedSnackbar("Please answer all required fields.")
        return;
      }
    }

    // upload survey
    await this.API.uploadSurveyStudent(this.certInfo.id, this.survey);
    await this.showCertificateModal(this.certInfo);
    this.modalService.dismissAll();
    // You can add further logic such as sending data to a server or displaying a success message
  }

  handleFileInput(event: any) {
    const file: File = event.target.files[0];
    // Handle file input logic here
    console.log('File uploaded:', file);
    // You can add further logic such as validating the file type or displaying the file name
  }
  

  async showCertificateModal(course: any) {
    console.log(course)
    const imageUrl = 'assets/cert/cnsc-cert.jpg'; // Replace with the actual URL or path to the certificate image
    const teacherSign = course.esign;
    console.log(teacherSign)
    const response =  await firstValueFrom(this.API.getCNSCPresident());
    if(response.output.length <= 0){
      this.API.failedSnackbar('Unable to retrieve certificate information');
    }
    const president = response?.output?.[0];
    if(!teacherSign){
      this.API.failedSnackbar('Please sign the certificate on your profile.');
    }
    if(!president?.esign){
      this.API.failedSnackbar('President have not signed the certificate yet.');
    }
    await Swal.fire({
      title: 'Certificate Preview',
      html: `
        <div style="width: 740px;" class='select-none overflow-hidden'>
          <div class='relative w-full h-[500px]'>
            <div class='absolute top-[54%] left-6 w-full flex justify-center z-10 font-semibold text-3xl text-black'>
              ${this.API.getFullName()}
            </div>

            <div class='absolute top-[64.8%] left-6 w-full flex justify-center z-10 font-bold text-xs text-black'>
              ${course.course.toUpperCase()}
            </div>
            
            
            <div class='absolute bottom-[9.2%] left-[19%] w-full  flex justify-center z-20'>
              <img src ='${ teacherSign ?  this.API.getURL(teacherSign) : ''}' class=' h-24 w-32  object-contain ${teacherSign? '':'hidden'}'>
            </div>
            <div class='absolute bottom-[13%] left-[19%] w-full flex justify-center z-10 font-bold text-xs text-black'>
              ${course.firstname} ${course.lastname}
            </div>
            <div class='absolute bottom-[9.2%] right-[10%] w-full  flex justify-center z-20'>
              <img src ='${ president?.esign ?  this.API.getURL(president?.esign) : ''}' class=' h-24 w-32  object-contain ${president?.esign ? '':'hidden'}'>
            </div>
            <div class='absolute bottom-[13%] right-[10%] w-full flex justify-center z-10 font-bold text-xs text-black'>
              ${president? president.firstname.toUpperCase() + ' ' + president.lastname.toUpperCase() : ''}
            </div>
            
            <img src="${imageUrl}" alt="Certificate" class='absolute' style="height: 100%; width:100%; object-fit: contain;">
          </div>
        </div>
      `,
      showConfirmButton: false,
      showCancelButton: true,
      cancelButtonText: 'Close',
      customClass: {
        popup: 'wide-popup',
      },
      width: '800px',
    });
  
  }
}
