import { Component, HostListener, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ChatsComponent } from '../../modal/chats/chats.component';
import { ActivatedRoute, Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';
import { Japanese, English, French } from 'src/app/shared/model/models';

const japanese = new Japanese();
const english = new English();
const french = new French();

@Component({
  selector: 'app-practice',
  templateUrl: './practice.component.html',
  styleUrls: ['./practice.component.css'],
})
export class PracticeComponent implements OnInit {
  lang?: string;
  languageId?: string;
  mode?: string;
  levels: any = [];
  studentLevel:any= {
    reading:0,
    writing:0,
    listening:0,
    speaking:0
  };
  practiceID?: number;
  isWindowWidthAbove500: boolean = true;
  constructor(
    private modalService: NgbModal,
    private route: ActivatedRoute,
    private router: Router,
    private API: APIService
  ) {
  }

  openModal() {
    const modalRef = this.modalService.open(ChatsComponent);
    // You might pass data or perform any other operations here.
  }

  getLevel(){
    return Number(this.studentLevel[this.mode!]);
  }

  ngOnInit(): void {
    this.API.showLoader();
    this.lang =
      this.route.snapshot.paramMap.get('lang')?.toLowerCase() ?? undefined;
    this.mode =
      this.route.snapshot.paramMap.get('mode')?.toLowerCase() ?? undefined;
    this.API.getAllLanguages().subscribe((data) => {
      if (data.success && data.output.length > 0) {
        var i = 0;
        for (let language of data.output) {
          if (language.language.toLowerCase() == this.lang) {
            this.languageId = language.id;
            break;
          }
          i += 1;
        }

        if (i >= data.output.length) {
          this.router.navigate(['student/selfstudylab']);
        } else {
          this.mode = this.route.snapshot.paramMap.get('mode') ?? undefined;
          const modeTypes = ['listening', 'speaking', 'writing', 'reading'];
          if (this.mode == undefined || !modeTypes.includes(this.mode)) {
            this.router.navigate([
              'student/practice',
              { lang: this.lang, mode: 'listening' },
            ]);
          }

          this.route.params.subscribe((params) => {
            // load content
            this.mode = params['mode'];
            // get studentLevel
            this.API.getCurrentLevel(this.languageId!, this.mode!).subscribe(
              (data) => {
                if (data.success) {
                  if (data.output.length <= 0) {
                    this.API.createLevelEntry(
                      this.languageId!,
                      this.mode!
                    ).subscribe(() => {
                      this.API.getCurrentLevel(
                        this.languageId!,
                        this.mode!
                      ).subscribe((reget) => {
                        this.studentLevel = {
                          listening: reget.output[0].listen,
                          writing: reget.output[0].write,
                          speaking : reget.output[0].speak,
                          reading: reget.output[0].read,
                        }

                        this.practiceID = reget.output[0].id;
                        this.levels = [];
                        if (this.lang == 'japanese') {
                          if (this.mode == 'writing') {
                            this.levels = japanese.writingQuiz;
                          } else if (this.mode == 'speaking') {
                            // for (let quiz of japanese.speakingQuiz) {
                            //   this.levels.push(quiz);
                            // }
                            this.levels = japanese.speakingQuiz;
                          } else {
                            // for (let quiz of japanese.quizzes) {
                            //   this.levels.push(quiz);
                            // }
                            this.levels = japanese.quizzes;
                          }
                        }
                        if (this.lang == 'english') {
                          if (this.mode == 'writing') {
                            for (let quiz of english.writingQuiz) {
                              this.levels.push(quiz);
                            }
                          } else if (this.mode == 'speaking') {
                            for (let quiz of english.speakingQuiz) {
                              this.levels.push(quiz);
                            }
                          } else {
                            for (let quiz of english.quizzes) {
                              this.levels.push(quiz);
                            }
                          }
                        }
                        if (this.lang == 'french') {
                          if (this.mode == 'writing') {
                            for (let quiz of french.writingQuiz) {
                              this.levels.push(quiz);
                            }
                          } else if (this.mode == 'speaking') {
                            for (let quiz of french.speakingQuiz) {
                              this.levels.push(quiz);
                            }
                          } else {
                            for (let quiz of french.quizzes) {
                              this.levels.push(quiz);
                            }
                          }
                        }
                        this.API.hideLoader();
                      });
                    });
                  } else {
                    this.studentLevel = {
                      listening: data.output[0].listen,
                      writing: data.output[0].write,
                      speaking : data.output[0].speak,
                      reading: data.output[0].read,
                    }
                    this.practiceID = data.output[0].id;
                    this.levels = [];
                    if (this.lang == 'japanese') {
                      if (this.mode == 'writing') {
                        for (let quiz of japanese.writingQuiz) {
                          this.levels.push(quiz);
                        }
                      } else if (this.mode == 'speaking') {
                        for (let quiz of japanese.speakingQuiz) {
                          this.levels.push(quiz);
                        }
                      } else {
                        for (let quiz of japanese.quizzes) {
                          this.levels.push(quiz);
                        }
                      }
                    }
                    if (this.lang == 'english') {
                      if (this.mode == 'writing') {
                        for (let quiz of english.writingQuiz) {
                          this.levels.push(quiz);
                        }
                      } else if (this.mode == 'speaking') {
                        for (let quiz of english.speakingQuiz) {
                          this.levels.push(quiz);
                        }
                      } else {
                        for (let quiz of english.quizzes) {
                          this.levels.push(quiz);
                        }
                      }
                    }
                    if (this.lang == 'french') {
                      if (this.mode == 'writing') {
                        for (let quiz of french.writingQuiz) {
                          this.levels.push(quiz);
                        }
                      } else if (this.mode == 'speaking') {
                        for (let quiz of french.speakingQuiz) {
                          this.levels.push(quiz);
                        }
                      } else {
                        for (let quiz of french.quizzes) {
                          this.levels.push(quiz);
                        }
                      }
                    }
                  }
                } else {
                  this.API.failedSnackbar('Error loading data.');
                }
                this.API.hideLoader();
              }
            );
          });
        }
      } else {
        this.router.navigate(['student/selfstudylab']);
      }
    });
  }

  // Add HostListener to update isWindowWidthAbove500 on window resize
  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.isWindowWidthAbove500 = window.innerWidth >= 500;
  }

  changeMode(mode: string) {
    if(mode==this.mode) return;
    this.levels = [];
    this.API.showLoader();
    this.router.navigateByUrl(this.router.url.replace(this.mode!, mode));
  }

  openQuiz(index: number) {
    if (Number(this.studentLevel[this.mode!]) < index + 1) {
      this.API.failedSnackbar(
        'You must complete the previous levels to take the quiz.'
      );
      return;
    }
    this.API.currentPractice = {
      practiceID: this.practiceID,
      id: index,
      lang: this.lang,
      title: this.levels[index].title,
      mode: this.mode,
      description: this.levels[index].description,
    };

    // Navigate to different routes based on the mode
    if (this.mode === 'writing') {
      this.router.navigate(['student/quiz-writing']);
    } else if (this.mode === 'speaking') {
      this.router.navigate(['student/quiz-speaking']);
    } else {
      this.router.navigate(['student/quiz-page']);
    }
  }

  truncateDescription(description: string, limit: number): string {
    const words = description.split(' ');
    if (words.length > limit) {
      return words.slice(0, limit).join(' ') + '...';
    }
    return description;
  }

  goBack(): void {
    // Implement the logic to navigate back
    this.router.navigate(['student/selfstudylab']);
  }
}
