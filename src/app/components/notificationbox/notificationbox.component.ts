import { Component, Input } from '@angular/core';
import { APIService } from 'src/app/services/API/api.service';
import Swal from 'sweetalert2';
@Component({
  selector: 'app-notificationbox',
  templateUrl: './notificationbox.component.html',
  styleUrls: ['./notificationbox.component.css']
})
export class NotificationboxComponent {
  @Input() notifications:any = [];
  constructor(private API :APIService){}
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

  removeUrgentTag(notif:string){
    return notif.replace('[Urgent]', '').replace('[BROADCAST]','').replace('[ALERT]', '');
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

  openMial(notification:any, index:number){
    if(this.notifications.status !='seen'){
      this.API.inbox -= 1;
    }
    this.notifications[index].status = 'seen';
    this.markAsRead(notification);
    Swal.fire({
      title: this.removeUrgentTag(notification.title),
      html: notification.message,
      icon: 'question', // Default icon, you can remove this line if you don't want the default icon
      iconHtml: '<img  src="assets/Notificationbox/mail_fill.png" alt="Custom Icon" style="width: 40px; height: 40px;">'
    });
}
}
