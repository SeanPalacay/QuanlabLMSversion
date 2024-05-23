import { Component, Input } from '@angular/core';
import { APIService } from 'src/app/services/API/api.service';
import Swal from 'sweetalert2';
import { SurveyCertComponent } from '../student/modals/survey-cert/survey-cert.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { firstValueFrom } from 'rxjs';
import * as jspdf from 'jspdf';
import html2canvas from 'html2canvas';
@Component({
  selector: 'app-notificationbox',
  templateUrl: './notificationbox.component.html',
  styleUrls: ['./notificationbox.component.css']
})
export class NotificationboxComponent {
  @Input() notifications:any = [];
  constructor(private API :APIService, private modalService: NgbModal,){}
  originalText: string = "MAGBAYAD KANA UTANG !! Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua";

  shortenedText!: string;

  ngOnInit() {
    // Set the maximum length you want for the text
    const maxLength = 20;
    
    // Shorten the text
    this.shortenedText = this.originalText.length > maxLength
      ? this.originalText.substring(0, maxLength) + '...'
      : this.originalText;

    this.markAllasInbox();
  }


  getNotifications(){
    return this.API.notifications;
  }
  isUrgent(notif:string){
    return (notif.includes('[Urgent]'))
  }

  removeTag(notif:string){
    return notif.replace('[Urgent]', '').replace('[BROADCAST]','').replace('[ALERT]', '').replace('[CERT]', '');
  }

  removeBodyTags(notif:string){
    return notif.split('[COURSEID]')[0]
  }

  markAllAsRead(){
    this.API.markAllAsRead();
    for(let notification of this.notifications){
      if(notification.status != 'seen') notification.status = 'seen';
    }
    if(this.API.inbox <= 0){
      this.API.justSnackbar('You have no new notifications to be marked as read');
      return;
    }
    this.API.inbox =0 ;
    this.API.successSnackbar('All notifications have been marked as read');
  }

  markAllasInbox(){
    this.API.markAllAsInbox();
  }

  markAsRead(notification:any){
    this.API.markAsRead(notification.id);
  }

  parseDate(date:string){
    // return this.API.parseDateTime(date)
    return this.API.parseDateFromNow(date);
  }

  certInfo:any

  async openMial(notification:any, index:number){
    if(this.notifications.status !='seen'){
      this.API.inbox -= 1;
    }
    this.notifications[index].status = 'seen';
    this.markAsRead(notification);
    if(notification.title.includes('[CERT]')){
      var courseID = notification.message.split("[COURSEID]")[1];
      var survey = await this.API.getAnsweredSurveyStudent(courseID);
      this.certInfo =  await this.API.getSurveyEntryStudent(courseID);
      Swal.fire({
        title: this.removeTag(notification.title),
        html: this.removeBodyTags(notification.message),
        icon: 'question', // Default icon, you can remove this line if you don't want the default icon
        iconHtml: '<img  src="assets/Notificationbox/mail_fill.png" alt="Custom Icon" style="width: 40px; height: 40px;">',
        confirmButtonText:  survey.length > 0 ? 'Claim Certificate' : 'Complete Survey',
        cancelButtonText: 'Close',
        showCancelButton: true,
      }).then( async (result)=>{
        if(result.isConfirmed){
            const modalOptions: NgbModalOptions = {
              centered: false,
              // You can add other options here if needed
            };
        
            if(survey.length <= 0 ){
              const modalRef = this.modalService.open(
                SurveyCertComponent,
                modalOptions
              );
              modalRef.componentInstance.certInfo  = this.certInfo
            }else{
              await this.showCertificateModal(this.certInfo)
            }
          }
      });
    }else{
      Swal.fire({
        title: this.removeTag(notification.title),
        html: this.removeBodyTags(notification.message),
        icon: 'question', // Default icon, you can remove this line if you don't want the default icon
        iconHtml: '<img  src="assets/Notificationbox/mail_fill.png" alt="Custom Icon" style="width: 40px; height: 40px;">'
      });
    }
    
}

async showCertificateModal(course: any) {
  console.log(course);
  const imageUrl = 'assets/cert/cnsc-cert.jpg';
  const teacherSign = course.esign;
  console.log(teacherSign);
  const response = await firstValueFrom(this.API.getCNSCPresident());
  if (response.output.length <= 0) {
    this.API.failedSnackbar('Unable to retrieve certificate information');
  }
  const president = response?.output?.[0];
  if (!teacherSign) {
    this.API.failedSnackbar('Please sign the certificate on your profile.');
  }
  if (!president?.esign) {
    this.API.failedSnackbar('President have not signed the certificate yet.');
  }

  let certificateImageElement: HTMLImageElement;

  await Swal.fire({
    title: 'Certificate Preview',
    html: `
      <div style="width: 740px; height:500px;" class='select-none overflow-hidden relative flex justify-center'>
        <div id='printable-certificate' class='relative w-full h-full'>
          <div class='absolute top-[50%] left-6 w-full flex justify-center z-10 font-semibold text-3xl text-black'>
            ${this.API.getFullName()}
          </div>
          <div class='absolute top-[63.6%] left-6 w-full flex justify-center z-10 font-bold text-xs text-black'>
            ${course.course.toUpperCase()}
          </div>
          <div class='absolute bottom-[10.2%] left-[19%] w-full flex justify-center z-20'>
            <img src='${teacherSign ? this.API.getURL(teacherSign) : ''}' class='h-24 w-32 object-contain ${teacherSign ? '' : 'hidden'}'>
          </div>
          <div class='absolute bottom-[14%] left-[19%] w-full flex justify-center z-10 font-bold text-xs text-black'>
            ${course.firstname} ${course.lastname}
          </div>
          <div class='absolute bottom-[10.2%] right-[10%] w-full flex justify-center z-20'>
            <img src='${president?.esign ? this.API.getURL(president?.esign) : ''}' class='h-24 w-32 object-contain ${president?.esign ? '' : 'hidden'}'>
          </div>
          <div class='absolute bottom-[14%] right-[10%] w-full flex justify-center z-10 font-bold text-xs text-black'>
            ${president ? president.firstname.toUpperCase() + ' ' + president.lastname.toUpperCase() : ''}
          </div>
          <img src="${imageUrl}" alt="Certificate" id="certificateImage" style="position: absolute; z-index: 0; height: 100%; width: 100%; object-fit: cover; top: 50%; left: 50%; transform: translate(-50%, -50%);">
        </div>
      </div>
    `,
    showConfirmButton: false,
    showCancelButton: true,
    cancelButtonText: 'Close',
    cancelButtonColor: '#7F7F7F',
    customClass: {
      popup: 'wide-popup',
    },
    width: '800px',
    didOpen: () => {
      const element = document.getElementById('printable-certificate')!;
      certificateImageElement = element.querySelector('#certificateImage') as HTMLImageElement;
      console.log(element.offsetWidth, element.offsetHeight);
      html2canvas(element!, {
        scale: 3,
        useCORS: true,
      }).then((canvas) => {
        const contentDataURL = canvas.toDataURL('image/png');
        const aspectRatio = canvas.width / canvas.height;
        const pdfWidth = canvas.width;
        const pdfHeight = pdfWidth / aspectRatio;
        const pdf = new jspdf.jsPDF({ orientation: 'landscape', unit: 'px', format: [pdfWidth, pdfHeight] });
        pdf.addImage(contentDataURL, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${this.API.getUserData().lastname.toUpperCase().replaceAll(" ", "_")}_${this.API.getUserData().firstname.toUpperCase().replaceAll(" ", "_")}-Certificate.pdf`);

        // Update the certificate image dimensions to 100%
        certificateImageElement.style.height = '92%';
        certificateImageElement.style.width = '92%';
      });
    },
    willClose: () => {
      // Reset the certificate image dimensions to 92%
      certificateImageElement.style.height = '100%';
      certificateImageElement.style.width = '100%';
    },
  });
}}
