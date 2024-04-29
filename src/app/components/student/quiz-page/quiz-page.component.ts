import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  Renderer2,
  ElementRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { iif } from 'rxjs';
import { APIService } from 'src/app/services/API/api.service';
import { Japanese, English, French } from 'src/app/shared/model/models';
import { Location } from '@angular/common';

const japanese = new Japanese();
const english = new English();
const french = new French();

interface QuizOption {
  id: number;
  text: string;
}
interface QuizItem {
  type: number;
  question: string;
  choices: Array<QuizOption>;
  correctAnswers: Array<any>;
  selectedAnswers: Array<any>;
}

@Component({
  selector: 'app-quiz-page',
  templateUrl: './quiz-page.component.html',
  styleUrls: ['./quiz-page.component.css'],
})
export class QuizPageComponent implements OnInit, OnDestroy {
  level?: number;

  questions: Array<QuizItem> = [];

  currentQuestionIndex = 0;
  correctAnswers = 0;
  timeRemaining = 180;
  showResult = false;
  timelimit = 180;
  timer: any;
  backtracking = true;
  review = true;
  randomize = true;
  teacherid = '';
  isButtonDisabled: boolean = false;
  private examInProgress: boolean = true;
  quizID: string = '';
  isPractice = false;
  mode = 'reading';
  lang = '';
  isUserAnswerCorrect(question: any, selectedChoiceIndex: number): boolean {
    const correctAnswersSet: Set<number> = new Set(question.correctAnswers);
    const selectedAnswersSet: Set<number> = new Set(question.selectedAnswers);

    return (
      selectedChoiceIndex == question.selectedAnswers[0] ||
      this.matchText(question.correctAnswers[0], question.selectedAnswers[0])
    );
  }

  title: string = 'Welcome to the QLAB Language Proficiency Quiz!';
  description: string =
    'Test your skills and see how well you know the language. Choose the correct answers for each question. Good luck!';

  practiceID?: string;
  constructor(
    private API: APIService,
    private route: ActivatedRoute,
    private location: Location,
    private router: Router,
    private renderer: Renderer2,
    private el: ElementRef
  ) {}

  ngOnInit() {
    this.correctAnswers = 0;
    const taskID = this.API.quizID;

    this.API.quizID = null;
    // this.route.snapshot.paramMap.get('taskID');
    if (taskID == null) {
      this.API.showLoader();
      this.isPractice = true;
      const sessionObject = this.API.currentPractice;
      // set level
      this.level = sessionObject.id;
      this.mode = this.API.currentPractice.mode;
      this.practiceID = sessionObject.practiceID;
      if (sessionObject.title != null) {
        this.title = sessionObject.title;
      }
      if (sessionObject.description != null) {
        this.description = sessionObject.description;
      }
      this.API.currentPractice = null;
      // get content of level level
      if (sessionObject.lang == 'japanese') {
        for (let item of japanese.quizzes[this.level!].items) {
          const itemOptions: Array<QuizOption> = [];
          var i = 0;
          for (let option of item.options) {
            const newOption: QuizOption = {
              id: i,
              text: String.fromCharCode(65 + i) + '. ' + option,
            };
            itemOptions.push(newOption);
            i += 1;
          }
          const newitem: QuizItem = {
            type: 0,
            question: item.question,
            choices: itemOptions,
            correctAnswers: [item.options.indexOf(item.answer)],
            selectedAnswers: [],
          };
          this.questions.push(newitem);
        }
      }
      if (sessionObject.lang == 'english') {
        for (let item of english.quizzes[this.level!].items) {
          const itemOptions: Array<QuizOption> = [];
          var i = 0;
          for (let option of item.choices) {
            const newOption: QuizOption = {
              id: i,
              text: String.fromCharCode(65 + i) + '. ' + option,
            };
            itemOptions.push(newOption);
            i += 1;
          }
          const newitem: QuizItem = {
            type: 0,
            question: item.question,
            choices: itemOptions,
            correctAnswers: [item.choices.indexOf(item.answer)],
            selectedAnswers: [],
          };
          this.questions.push(newitem);
        }
      }
      if (sessionObject.lang == 'french') {
        for (let item of french.quizzes[this.level!].items) {
          const itemOptions: Array<QuizOption> = [];
          var i = 0;
          for (let option of item.choices) {
            const newOption: QuizOption = {
              id: i,
              text: String.fromCharCode(65 + i) + '. ' + option,
            };
            itemOptions.push(newOption);
            i += 1;
          }
          const newitem: QuizItem = {
            type: 0,
            question: item.question,
            choices: itemOptions,
            correctAnswers: [item.choices.indexOf(item.answer)],
            selectedAnswers: [],
          };
          this.questions.push(newitem);
        }
      }
      this.toggleFullscreen();

      switch(sessionObject.lang){
        case 'english':
          this.lang = 'en';
          break;
        case 'japanese':
          this.lang = 'ja';
          break;
        case 'french':
          this.lang = 'fr'
          break;
        }
      this.questions = this.shuffle();
      this.textToSpeech();
      this.API.hideLoader();
    } else {
      this.quizID = taskID!;
      this.API.showLoader();
      this.API.studentGetQuiz(taskID).subscribe((data) => {
        if (data.success) {
          this.title = data.output[0].title;
          this.teacherid = data.output[0].teacherid;
          this.description = data.output[0].details;
          this.timelimit = data.output[0].timelimit * 60;
          this.timeRemaining = this.timelimit;
          this.backtracking = false;
          this.randomize = false;
          this.review = false;
          if (data.output[0].settings) {
            this.backtracking =
              data.output[0].settings.includes('allow_backtrack');
            this.randomize =
              data.output[0].settings.includes('random_question');
            this.review = data.output[0].settings.includes('allow_review');
          }
          for (let item of data.output) {
            const itemOptions: Array<QuizOption> = [];
            var i = 0;
            var correctAnswers: any[] = [];

            if (item.type == '0') {
              for (let option of item.options.split('\\n\\n')) {
                if (option.trim() == '') continue;
                const newOption: QuizOption = {
                  id: i,
                  text: String.fromCharCode(65 + i) + '. ' + option,
                };
                itemOptions.push(newOption);
                i += 1;
              }
              for (let answer of item.answer.split(' ')) {
                correctAnswers.push(Number(answer));
              }
            } else if (item.type == '1') {
              const tru: QuizOption = {
                id: 0,
                text: 'TRUE',
              };
              itemOptions.push(tru);
              const fals: QuizOption = {
                id: 1,
                text: 'False',
              };
              itemOptions.push(fals);

              if (item.answer == 'T') {
                correctAnswers.push(0);
              } else {
                correctAnswers.push(1);
              }
            } else {
              const asnwer: QuizOption = {
                id: 0,
                text: `${item.answer}`,
              };
              itemOptions.push(asnwer);
              correctAnswers.push(item.answer);
            }

            const selectedAnswers = [];
            if (Number(item.type) > 1) {
              selectedAnswers.push('');
            }
            const newitem: QuizItem = {
              type: Number(item.type),
              question: item.question,
              choices: itemOptions,
              correctAnswers: correctAnswers,
              selectedAnswers: selectedAnswers,
            };
            this.questions.push(newitem);
          }
          this.questions = this.shuffle();
          // console.log(this.questions);
          // student quiz is recorded when started to avoid re attempt on reload
          this.API.recordQuiz(
            this.quizID,
            this.correctAnswers,
            this.questions.length
          );
        } else {
          this.router.navigate(['/']);
          // this.API.failedSnackbar('Error loading quiz..');
        }
        this.questions = this.shuffle();
        this.toggleFullscreen();
        this.API.hideLoader();
      });
    }

    this.startTimer();
  }

generating = false;

textToSpeech(){
    if(this.generating) return;
    this.generating = true;
    if(this.mode !='listening') return;
    const talk$ = this.API.textToSpeech(this.questions[this.currentQuestionIndex].question, this.lang ).subscribe(data=>{
      this.generating = false;
      const audio = new Audio();
      audio.src = data.fileDownloadUrl ;
      audio.load();
      // this.loadVisuallizer(this.audio);
      audio!.play();
      talk$.unsubscribe();
    })
  }

  matchText(target: any, src: any) {
    if (typeof target == 'string' && typeof src == 'string') {
      return target.toLowerCase() == src.toLowerCase();
    } else {
      return false;
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  letterFromIndex(index: number) {
    return String.fromCharCode(65 + index);
  }

  startTimer() {
   if(this.mode!='listening'){
    this.timer = setInterval(() => {
      if (this.timeRemaining > 0) {
        this.timeRemaining--;
      } else {
        this.exitFullscreen();
        this.stopTimer();
        this.showResult = true;
        // this.checkAnswers();
        this.isButtonDisabled = true;
      }
    }, 1000);
   }
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

  selectAnswer(choiceId: number) {
    const question = this.questions[this.currentQuestionIndex];
    const selectedIndex = question.selectedAnswers.indexOf(choiceId);

    // For single-choice questions, reset and select the new answer
    if (question.type <= 1) {
      question.selectedAnswers = [choiceId];
    } else if (selectedIndex === -1) {
      // For multi-select, add the choice if not already selected
      question.selectedAnswers.push(choiceId);
    } else {
      // For multi-select, remove the choice if already selected
      question.selectedAnswers.splice(selectedIndex, 1);
    }
  }
  trackByFn(index: any, item: any) {
    return index; // or item.id
  }
  isAnswerCorrect(question: QuizItem, choiceId: number): boolean {
    return question.correctAnswers.includes(choiceId);
  }
  isAnswerIncorrect(question: QuizItem, choiceId: number): boolean {
    return (
      !this.isAnswerCorrect(question, choiceId) &&
      question.selectedAnswers.includes(choiceId)
    );
  }
  isQuestionUnanswered(question: QuizItem): boolean {
    return question.selectedAnswers.length === 0;
  }
  isUserSelectedAnswer(question: QuizItem, choiceId: number): boolean {
    return question.selectedAnswers.includes(choiceId);
  }

  shuffle() {
    if (!this.randomize) return this.questions;
    return this.questions.sort(() => Math.random() - 0.5);
  }

  nextQuestion() {
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex === this.questions.length) {
      // this.stopTimer();
      // this.showResult = true;
      // this.checkAnswers();
      this.exitFullscreen();
    }else{
      this.textToSpeech();
    }
  }

  prevQuestion() {
    if (!this.backtracking) return;
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  
  checkAnswers() {
    this.questions.forEach((question) => {
      const correctAnswersSet = new Set(question.correctAnswers);
      const selectedAnswersSet = new Set(question.selectedAnswers);

      if (
        this.setsAreEqual(correctAnswersSet, selectedAnswersSet) ||
        this.matchText(question.selectedAnswers[0], question.correctAnswers[0])
      ) {
        this.correctAnswers++;
      }
    });
    if (this.isPractice) {
      this.API.recordAssessment(
        this.practiceID!,
        this.level! + 1,
        this.correctAnswers,
        this.questions.length,
        this.mode
      );
      if (this.correctAnswers >= this.questions.length) {
        this.API.updateLevel(this.practiceID!, this.level! + 1, this.mode);
      }
    } else {
      // record quiz
      this.API.updateQuizScore(this.quizID, this.correctAnswers);
      this.API.pushNotifications(
        `${this.API.getFullName()} finished a quiz`,
        `${this.API.getFullName()} finished a quiz titled <b>'${
          this.title
        }'</b>. Their score has been successfuly  recorded.`,
        this.teacherid
      );
    }
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
    // Reset selected answers
    // this.questions.forEach((question) => {
    //   question.selectedAnswers = [];
    // });

    // this.currentQuestionIndex = 0;
    // this.correctAnswers = 0;
    // this.timeRemaining = this.timelimit;
    // this.showResult = false;
    // this.startTimer();
  }

  logout() {
    this.renderer.removeClass(document.body, 'min-[768px]:ml-64');
    this.API.logout();
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
              if(this.currentQuestionIndex < this.questions.length)
              {
                this.API.failedSnackbar(
                  'Quiz Interupted due to exiting fullscreen'
                );
              }
              document.removeEventListener('keydown', keydownListener);
              this.stopTimer();
              this.showResult = true;
              this.isButtonDisabled = true;
            
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
      this.checkAnswers();
      
      document.exitFullscreen();
      
    }
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    this.detectF11KeyPress(event);
  }

  detectF11KeyPress(event: KeyboardEvent): void {
    // if (
    //   (event.key === 'F11' && this.timeRemaining > 0) ||
    //   (event.key === 'Escape' && this.timeRemaining )
    // ) {
    //   this.exitFullscreen();
    //   // this.stopTimer();
    //   // this.showResult = true;
    //   // this.checkAnswers();
    //   // this.isButtonDisabled = true;
    //   this.API.failedSnackbar(
    //     'Quiz Interupted due to exiting fullscreen'
    //   );
    // }
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
