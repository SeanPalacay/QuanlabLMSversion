import {
  Component,
  OnInit,
  OnDestroy,
  Renderer2,
  ElementRef,
  HostListener,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { iif } from 'rxjs';
import { APIService } from 'src/app/services/API/api.service';
import { Japanese, English, French } from 'src/app/shared/model/models';
import { Location } from '@angular/common';

const japanese = new Japanese();
const english = new English();
const french = new French();

interface QuizItem {
  question: string;
  suggestedAnswer: string;
  userAnswer?: string;
}
@Component({
  selector: 'app-quiz-writing',
  templateUrl: './quiz-writing.component.html',
  styleUrls: ['./quiz-writing.component.css'],
})
export class QuizWritingComponent implements OnInit, OnDestroy {
  level?: number;
  userAnswer: string;

  questions: Array<QuizItem> = [];

  currentQuestionIndex = 0;
  correctAnswersCount = 0;
  timeRemaining = 180;
  showResult = false;
  timelimit = 180;
  timer: any;
  backtracking = true;
  review = true;
  randomize = true;

  isPractice = false;
  inputEnabled = true;

  title: string = 'Welcome to the QLAB Language Proficiency Quiz!';
  description: string =
    'Test your skills and see how well you know the language. Choose the correct answers for each question. Good luck!';

  practiceID?: string;
  isButtonDisabled: boolean = false;
  constructor(
    private API: APIService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private renderer: Renderer2,
    private el: ElementRef
  ) {
    this.userAnswer = '';
  }

  ngOnInit() {
    const taskID = this.API.quizID;
    this.API.quizID = null;
    this.route.snapshot.paramMap.get('taskID');
    if (taskID == null) {
      this.isPractice = true;
      const sessionObject = this.API.currentPractice;
      // set level
      this.level = sessionObject.id;
      this.practiceID = sessionObject.practiceID;
      if (sessionObject.title != null) {
        this.title = sessionObject.title;
      }
      if (sessionObject.description != null) {
        this.description = sessionObject.description;
      }
      this.API.currentPractice = null;
      if (sessionObject.lang == 'japanese') {
        for (let item of japanese.writingQuiz[this.level!].items) {
          const newitem: QuizItem = {
            question: item.question,
            suggestedAnswer: item.suggestedAnswer,
            userAnswer: '',
          };
          this.questions.push(newitem);
        }
      }
      if (sessionObject.lang == 'english') {
        for (let item of english.writingQuiz[this.level!].items) {
          const newitem: QuizItem = {
            question: item.question,
            suggestedAnswer: item.suggestedAnswer,
            userAnswer: '',
          };
          this.questions.push(newitem);
        }
      }
      if (sessionObject.lang == 'french') {
        for (let item of french.writingQuiz[this.level!].items) {
          const newitem: QuizItem = {
            question: item.question,
            suggestedAnswer: item.suggestedAnswer,
            userAnswer: '',
          };
          this.questions.push(newitem);
        }
      }
    } else {
      this.API.studentGetQuiz(taskID).subscribe((data) => {
        if (data.success) {
          this.title = data.output[0].title;
          this.description = data.output[0].details;
          this.timelimit = data.output[0].timelimit * 60;
          this.timeRemaining = this.timelimit;
          this.backtracking =
            data.output[0].settings.includes('allow_backtrack');
          this.randomize = data.output[0].settings.includes('random_question');
          this.review = data.output[0].settings.includes('allow_review');
          for (let item of data.output) {
            if (item.type == '2') continue;
            let suggestedAnswer: string = '';

            if (item.type == '0') {
              suggestedAnswer = item.suggestedAnswer;
            } else if (item.type == '1') {
              suggestedAnswer = item.suggestedAnswer;
            }

            const newitem: QuizItem = {
              question: item.question,
              suggestedAnswer: suggestedAnswer,
              userAnswer: '',
            };
            this.questions.push(newitem);
          }
        } else {
          this.router.navigate(['/']);
        }
      });
    }
    this.toggleFullscreen();
    this.shuffle();

    this.startTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  startTimer() {
    this.timer = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.stopTimer();
        this.showResult = true;
        this.inputEnabled = false;
        this.checkAnswers();
        this.isButtonDisabled = true;
      }
    }, 1000);
  }

  secondsToMinutes(seconds: number) {
    if (seconds < 60) {
      return seconds;
    }
    return (
      Math.floor(seconds / 60).toString() +
      ':' +
      (seconds % 60).toString().padStart(2, '0')
    );
  }

  stopTimer() {
    clearInterval(this.timer);
    this.removeMarginToClass();
  }

  shuffle() {
    if (!this.randomize) return;
    this.questions.sort(() => Math.random() - 0.5);
  }

  nextQuestion() {
    this.questions[this.currentQuestionIndex].userAnswer = this.userAnswer;
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex === this.questions.length) {
      this.stopTimer();
      this.showResult = true;
      this.checkAnswers();
      this.exitFullscreen(); // Add this line
    }
    this.userAnswer = '';
  }

  prevQuestion() {
    if (!this.backtracking) return;
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }
  mode = 'writing';
  checkAnswers() {
    this.correctAnswersCount = 0;
    this.questions.forEach((question) => {
      if (this.compareAnswers(question.userAnswer, question.suggestedAnswer)) {
        this.correctAnswersCount++;
        this.exitFullscreen(); // Add this line
      }
    });
    if (this.isPractice) {
      this.API.recordAssessment(
        this.practiceID!,
        this.level! + 1,
        this.correctAnswersCount,
        this.questions.length,
        this.mode
      );
      if (this.correctAnswersCount >= this.questions.length) {
        this.API.updateLevel(this.practiceID!, this.level! + 1, this.mode);
      }
    } else {
      // record quiz results as needed
    }
  }

  // Compare two answers irrespective of their case
  compareAnswers(
    userAnswer: string | undefined,
    correctAnswer: string
  ): boolean {
    if (!userAnswer) return false;
    return userAnswer.trim().toLowerCase() === correctAnswer.toLowerCase();
  }

  setsAreEqual(setA: Set<number>, setB: Set<number>): boolean {
    if (setA.size !== setB.size) {
      return false;
    }

    for (const item of setA) {
      if (!setB.has(item)) {
        return false;
      }
    }

    return true;
  }

  resetQuiz() {
    this.location.back();
  }

  toggleFullscreen() {
    const elem = this.el.nativeElement;
    this.checkScreenSize();
    if (!document.fullscreenElement) {
      this.renderer.setProperty(
        elem,
        'requestFullscreen',
        elem.requestFullscreen ||
          elem.mozRequestFullScreen ||
          elem.webkitRequestFullScreen ||
          elem.msRequestFullscreen
      );

      const keydownListener = (e: KeyboardEvent) => {
        if (e.key === 'F11') {
          e.preventDefault();
          console.log('F11 key is disabled in fullscreen');
        }
      };

      // Prevent F11 key globally
      document.addEventListener('keydown', keydownListener);

      elem
        .requestFullscreen()
        .then(() => {
          console.log('Fullscreen');

          // Remove the event listener when exiting fullscreen
          document.addEventListener('fullscreenchange', () => {
            if (!document.fullscreenElement) {
              document.removeEventListener('keydown', keydownListener);
              this.stopTimer();
              this.showResult = true;
              this.checkAnswers();
              this.isButtonDisabled = true;
              if (
                this.timeRemaining > 0 &&
                this.currentQuestionIndex < this.questions.length
              ) {
                this.API.failedSnackbar(
                  'Quiz Interupted due to exiting fullscreen'
                );
              }
            }
          });
        })
        .catch((err: any) => {
          console.error('Error attempting to enable fullscreen:', err);
        });
    }
  }

  exitFullscreen() {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.detectF11KeyPress(event);
  }

  detectF11KeyPress(event: KeyboardEvent): void {
    if (
      (event.key === 'F11' && this.timeRemaining > 0) ||
      (event.key === 'Escape' && this.timeRemaining)
    ) {
      this.exitFullscreen();
      // this.stopTimer();
      // this.showResult = true;
      // this.checkAnswers();
      // this.isButtonDisabled = true;
      this.API.failedSnackbar('Quiz Interupted due to exiting fullscreen');
    }
  }

  disableAltTab() {
    document.addEventListener('keydown', (event) => {
      if (event.altKey && event.key === 'TAB') {
        event.preventDefault();
      }
    });
  }
  disableEscapeKey() {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
      }
    });
  }

  checkScreenSize() {
    const isMobile = window.innerWidth <= 767;
    if (!isMobile) {
      this.addMarginToClass();
    } else {
      this.removeMarginToClass();
    }
  }

  addMarginToClass() {
    const element = this.el.nativeElement.querySelector('.marginthisbox');
    this.renderer.setStyle(element, 'margin', '200px');
  }
  removeMarginToClass() {
    const element = this.el.nativeElement.querySelector('.marginthisbox');
    this.renderer.setStyle(element, 'margin', '0px');
  }
}
