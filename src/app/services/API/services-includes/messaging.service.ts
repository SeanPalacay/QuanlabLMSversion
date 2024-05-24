import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { UtilityService } from './utility.service';
import { firstValueFrom } from 'rxjs';
import { MessageObject } from 'src/app/shared/model/models';

@Injectable({
  providedIn: 'root',
})
export class MessagingService {
  public messages: any = [];
  public convos: any = [];
  public labMessages: Array<MessageObject> = [];

  constructor(
    private userService: UserService,
    private utilityService: UtilityService
  ) {}

  sendMessage(message: string, recipientID: string) {
    const id = this.userService.getUserData().id;
    const postObject = {
      tables: 'messages',
      values: {
        SenderID: id,
        RecipientID: recipientID,
        Message: message,
        Status: 'not_seen',
      },
    };

    const obs$ = this.utilityService.post('create_entry', {
        data: JSON.stringify(postObject),
      })
      .subscribe((data: any) => {
        this.utilityService.socketSend({
          app: 'quanlab',
          type: 'messaging',
          sender:
            this.userService.getUserData().firstname +
            ' ' +
            this.userService.getUserData().lastname,
          from: id,
          to: recipientID,
          message: message,
        });
        obs$.unsubscribe();
      });
  }

  getConversations() {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: [
        'students.ID, students.FirstName, students.LastName, students.LastSeen, students.VisibleID, students.Profile',
        'MAX(timestamp) as timestamp',
      ],
      tables: 'students, messages',
      conditions: {
        WHERE: {
          'messages.RecipientID': id,
          'messages.SenderID': 'students.ID',
        },
        OR: `messages.SenderID = '${id}' AND messages.RecipientID = students.ID`,
        'GROUP BY': 'students.ID',
        'UNION ALL': `SELECT teachers.ID, teachers.FirstName, teachers.LastName, teachers.LastSeen, teachers.VisibleID, teachers.Profile
          , MAX(timestamp) as timestamp
           FROM teachers, messages
            WHERE
              messages.RecipientID = '${id}' AND messages.SenderID =teachers.ID 
                OR
              messages.RecipientID = teachers.ID AND messages.SenderID = '${id}'
              GROUP BY teachers.ID
        `,
        'ORDER BY': 'timestamp DESC',
      },
    };
    const obs$ = this.utilityService.post('get_entries', {
        data: JSON.stringify(postObject),
      })
      .subscribe(async (data) => {
        const convos = [];
        for (let convo of data.output) {
          const otherID = convo.id;
          const message = await firstValueFrom(this.getLastMessage(otherID));
          const lastConvo = message.output[0];
          convo.lastmessageref = lastConvo;
          convo.lastmessage =
            lastConvo.senderid == id
              ? 'You: ' + lastConvo.message
              : lastConvo.message;
          convo.lastseen = this.utilityService.parseDateFromNow(convo.lastseen);
          convos.push(convo);
        }
        this.convos = convos;
        obs$.unsubscribe();
      });
  }

  getLastMessage(themID: string) {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: ['*'],
      tables: 'messages',
      conditions: {
        WHERE: {
          'messages.RecipientID': id,
          'messages.SenderID': themID,
        },
        OR: `messages.SenderID = '${id}' AND messages.RecipientID = '${themID}'`,
        'ORDER BY': 'timestamp DESC',
        LIMIT: '1',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  messsagesMarkAllAsRead(otherID: string) {
    const id = this.userService.getUserData().id;
    const postObject = {
      tables: 'messages',
      values: {
        Status: 'seen',
      },
      conditions: {
        WHERE: {
          RecipientID: id,
          SenderID: otherID,
        },
      },
    };
    const obs$ = this.utilityService.post('update_entry', {
        data: JSON.stringify(postObject),
      })
      .subscribe(() => {
        obs$.unsubscribe();
      });
  }

  getMessages(themID: string) {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: ['*'],
      tables: 'messages',
      conditions: {
        WHERE: {
          'messages.RecipientID': id,
          'messages.SenderID': themID,
        },
        OR: `messages.SenderID = '${id}' AND messages.RecipientID = '${themID}'`,
        'ORDER BY': 'timestamp ASC',
      },
    };
    const obs$ = this.utilityService.post('get_entries', {
        data: JSON.stringify(postObject),
      })
      .subscribe((data) => {
        this.messsagesMarkAllAsRead(themID);
        this.messages = data.output;
        obs$.unsubscribe();
      });
  }
}
