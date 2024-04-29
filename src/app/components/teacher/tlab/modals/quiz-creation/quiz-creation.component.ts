import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { lastValueFrom } from 'rxjs';
import { APIService } from 'src/app/services/API/api.service';

@Component({
  selector: 'app-quiz-creation',
  templateUrl: './quiz-creation.component.html',
  styleUrls: ['./quiz-creation.component.css'],
})
export class QuizCreationComponent implements OnInit {
  @Input() myCustomClass: string = '';
  @Input() courses: any = [];
  course: string = '';
  title: string = '';
  description: string = '';
  timelimit?: number;
  deadline: string = '';
  attachments?: File;
  settings: any = {
    random_question: false,
    allow_backtrack: false,
    allow_review: false,
  };

  types: Array<string> = ['Multiple Choice', 'True/False', 'Identification'];

  questions: any = [
    {
      type: '0',
      question: '',
      options: ['', '', '', ''],
      answer: '',
    },
  ];

  constructor(public activeModal: NgbActiveModal, private API: APIService) {}

  ngOnInit(): void {}

  selectedFileName: string | undefined;
  onFileSelected(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files) {
      this.selectedFileName = inputElement.files[0].name;
      this.attachments = inputElement.files[0];
    }
  }

  setMultipleAnswer(answer: string, question: any) {
    if (!(question.answer as string).includes(answer)) {
      question.answer += ' ' + answer;
      question.answer = question.answer.trim();
    } else {
      question.answer = (question.answer as string)
        .replaceAll(answer, '')
        .trim();
    }
  }

  setTFAnswer(answer: string, question: any) {
    question.answer = answer;
  }

  setType(question: any) {
    question.answer = '';
  }

  addNewItem() {
    this.questions.push({
      type: '0',
      question: '',
      options: ['', '', '', ''],
      answer: '',
    });
  }

  uploading: boolean = false;
  submit() {
    if (this.uploading) return;
    this.uploading = true;
    var settings: any = '';

    for (let [key, active] of Object.entries(this.settings)) {
      if (active) {
        settings += ' ' + key;
        settings = settings.trim();
      }
    }

    if (settings.trim() == '') {
      settings = undefined;
    }
    var attachments = undefined;
    if (this.attachments != undefined) {
      var fileparse = this.attachments.name.split('.');
      var serverLocation =
        this.API.createID36() + '.' + fileparse[fileparse.length - 1];
      this.API.uploadFile(this.attachments, serverLocation);
      var filelocation = 'files/' + serverLocation;
      var filename = this.attachments.name;
      attachments = filelocation + '>' + filename;
    }
    if (
      !this.API.checkInputs([
        this.course,
        this.title,
        this.timelimit,
        this.deadline,
      ])
    ) {
      this.API.failedSnackbar('Please fill out all the header fields!');
      this.uploading = false;
      return;
    }
    for (let item of this.questions) {
      if (!this.API.checkInputs([item.question, item.answer])) {
        this.API.failedSnackbar(
          'Please fill out all the questions and answer fields!'
        );
        this.uploading = false;
        return;
      }
      if (item.type == '0') {
        if (!this.API.checkInputs(item.options)) {
          this.API.failedSnackbar(
            'Please fill out all the question options fields!'
          );
          this.uploading = false;
          return;
        }
      }
    }
    const id = this.API.createID32();
    this.API.justSnackbar('Saving ... ', 999999999);
    this.API.createQuiz(
      this.course,
      id,
      this.title,
      this.description,
      this.timelimit!,
      this.deadline,
      attachments,
      settings
    ).subscribe(async () => {
      for (let item of this.questions) {
        var options: any = undefined;
        if (item.type == '0') {
          // check all options
          options = '';
          for (let option of item.options) {
            options += option + '\\n\\n';
          }
        }
        await lastValueFrom(
          this.API.createQuizItem(
            id,
            item.type,
            item.question,
            item.answer,
            options
          )
        );
      }
      this.API.successSnackbar('Saved quiz!');
      this.API.notifyStudentsInCourse(
        `${this.API.getFullName()} uploaded a new quiz.`,
        `${this.API.getFullName()} uploaded a new quiz titled, <b>'${
          this.title
        }'</b>. Make sure to study before the quiz! The quiz is due on <b>${this.API.parseDate(
          this.deadline
        )}</b>.`,
        this.course
      );
      this.activeModal.close('update');
    });

    if (!this.isTimeLimitValid()) {
      this.API.failedSnackbar('Time limit must be greater than zero!');
      return;
    }
  }
  isTimeLimitValid(): boolean {
    return this.timelimit !== undefined && this.timelimit > 0;
  }

  closeModal() {
    this.activeModal.close();
    // You can pass any data you want back to the calling component here
  }
}
