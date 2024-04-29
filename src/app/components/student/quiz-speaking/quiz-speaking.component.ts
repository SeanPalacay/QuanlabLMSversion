import { Component, OnInit, OnDestroy } from '@angular/core';
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
  selector: 'app-quiz-speaking',
  templateUrl: './quiz-speaking.component.html',
  styleUrls: ['./quiz-speaking.component.css'],
})
export class QuizSpeakingComponent implements OnInit, OnDestroy {
  // Your existing component properties...
  isRecording = false;
  mockAnswer = ''; // This will hold the mock answer to display

  level?: number;
  userAnswer: string;

  questions: Array<QuizItem> = [];

  currentQuestionIndex = 0;
  correctAnswersCount = 0;
  timeRemaining = 60;
  showResult = false;
  timelimit = 60;
  timer: any;
  backtracking = true;
  review = true;
  randomize = true;

  isPractice = false;
  inputEnabled = true;
  mode='speaking';
  audio:HTMLAudioElement;

  title: string = 'Welcome to the QLAB Language Proficiency Quiz!';
  description: string =
    'Test your skills and see how well you know the language. Choose the correct answers for each question. Good luck!';

  practiceID?: string;
  constructor(
    private API: APIService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {
    this.userAnswer = '';
    this.audio = new Audio();
    this.audio.src = '../../../assets/sounds/notif.mp3'
    this.audio.load();
  }

  lang:string = '';

  ngOnInit() {
    const taskID = this.API.quizID;
    this.API.quizID = null;
    this.route.snapshot.paramMap.get('taskID');

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
        for (let item of japanese.speakingQuiz[this.level!].items) {
          const newitem: QuizItem = {
            question: item.question,
            suggestedAnswer: item.answer,
            userAnswer: '',
          };
          this.questions.push(newitem);
        }
      }
      if (sessionObject.lang == 'english') {
        for (let item of english.speakingQuiz[this.level!].items) {
          const newitem: QuizItem = {
            question: item.question,
            suggestedAnswer: item.answer,
            userAnswer: '',
          };
          this.questions.push(newitem);
        }
      }
      if (sessionObject.lang == 'french') {
        for (let item of french.speakingQuiz[this.level!].items) {
          const newitem: QuizItem = {
            question: item.question,
            suggestedAnswer: item.answer,
            userAnswer: '',
          };
          this.questions.push(newitem);
        }
      }
    


  

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

      this.shuffle();

    // this.startTimer();
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  toggleRecording(): void {
    if(!this.recording && this.analysing) return;
    this.isRecording = !this.isRecording;
    // Set a mock answer when recording starts
    if (this.isRecording) {
      this.startSpeechtoText();
      this.mockAnswer = 'Recording, Speak your voice!';
    } else {
      this.mockAnswer = ''; // Clear the mock answer when recording stops
    }
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
      }
    }, 1500);
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
  }

  shuffle() {
    if (!this.randomize) return;
    this.questions.sort(() => Math.random() - 0.5);
  }

  nextQuestion() {
    this.nextLevel = false;
    this.questions[this.currentQuestionIndex].userAnswer = this.userAnswer;
    this.currentQuestionIndex++;
    if (this.currentQuestionIndex === this.questions.length) {
      this.stopTimer();
      this.showResult = true;
      this.checkAnswers();
    }
    this.userAnswer = '';
  }

  prevQuestion() {
    if (!this.backtracking) return;
    if (this.currentQuestionIndex > 0) {
      this.currentQuestionIndex--;
    }
  }

  checkAnswers() {
    this.questions.forEach((question) => {
      if (this.compareAnswers(question.userAnswer, question.suggestedAnswer)) {
        this.correctAnswersCount++;
      }
    });
    if (this.isPractice) {
      this.correctAnswersCount = this.questions.length;
      this.API.recordAssessment(
        this.practiceID!,
        this.level! + 1,
        this.correctAnswersCount,
        this.questions.length,
        this.mode
      );
      if (this.correctAnswersCount >= this.questions.length) {
        this.API.updateLevel(this.practiceID!, this.level! + 1,this.mode);
      }
    } else {
      // record quiz results as needed
    }
  }

  mediaRecorder:any;
  recording = false;
  analysing = false;
  nextLevel = false;
  startSpeechtoText(){
    navigator.mediaDevices.getUserMedia({ audio: true })
      .then(stream => {
        this.recording = true;
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.start();
        this.mediaRecorder.ondataavailable = (event:any)=>{
          if(event.data.size > 0 ){
            // this.audio = new Audio();
            // this.audio.src = URL.createObjectURL(event.data);
            // this.audio.load();
            // this.loadVisuallizer(this.audio);
            this.API.speechToText(event.data, this.clean(this.questions[this.currentQuestionIndex].question) , this.lang);
            this.API.speechComparison$.subscribe(comparison=>{
              if(comparison.accuracy> 0.6){
                this.audio.play();
                this.nextLevel = true;
              }else{
                this.API.failedSnackbar(comparison.accuracy);
              }
              this.analysing =false;
            })
          }
        }
      });
      setTimeout(()=>{
        this.endSpeechToText();
      },2000)
    
  }
  clean(phrase:string){
    return phrase.split('(')[0].trim();
  }

  endSpeechToText(){
    this.analysing = true;
    if(this.mediaRecorder == undefined){
      return
    }
    this.toggleRecording();
    this.recording = false;
    this.mediaRecorder.stop();
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
}
