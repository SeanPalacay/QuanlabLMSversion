import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from './user.service';
import { FileService } from './file.service';
import { Subscription, firstValueFrom, map } from 'rxjs';
import { UtilityService } from './utility.service';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ModuleService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private fileService: FileService,
    private utilityService: UtilityService
  ) {

  }

  getAllLanguages() {
    const postObject = {
      selectors: ['languages.*'],
      tables: 'languages',
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getLanguages() {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: ['languages.*'],
      tables: 'languages,courses',
      conditions: {
        WHERE: {
          'languages.ID': 'courses.LanguageID',
          'courses.TeacherID': id,
        },
        'GROUP BY': 'languages.ID',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  getCoursesByLanguage(languageID: string) {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: ['courses.*'],
      tables: 'languages,courses',
      conditions: {
        WHERE: {
          'courses.LanguageID': 'languages.ID',
          'courses.TeacherID': id,
          'languages.ID': languageID,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  dictionary(word: string) {
    return this.http.get<any>(this.userService.getURL('/' + word), {});
  }

  getWord(word: string) {
    const postObject = {
      selectors: ['*'],
      tables: 'word_searches',
      conditions: {
        WHERE: {
          Search: word,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  saveDictionary(word: string, dictionary?: string) {
    var fileObject = {};
    if (dictionary != undefined) {
      const file = 'dictionary/' + word + '.json';
      this.fileService.uploadJson(dictionary, file);
      fileObject = { File: file };
    }
    const postObject = {
      tables: 'word_searches',
      values: Object.assign(
        {
          Search: word,
        },
        fileObject
      ),
    };
    const observable$: Subscription = this.utilityService.post('create_entry', {
        data: JSON.stringify(postObject),
      })
      .subscribe(() => observable$.unsubscribe());
  }

  getCurrentLevel(language: string, mode: string) {
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: ['student_practices.*'],
      tables: 'student_practices',
      conditions: {
        WHERE: {
          StudentID: id,
          LanguageID: language,
        },
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  createLevelEntry(language: string, mode: string) {
    const id = this.userService.getUserData().id;
    const postObject = {
      tables: 'student_practices',
      values: {
        StudentID: id,
        LanguageID: language,
      },
    };

    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateLevel(practiceID: string, level: number, mode: string) {
    var toUpdate: any = {
      Read: level + 1,
    };
    switch (mode) {
      case 'listening':
        toUpdate = {
          Listen: level + 1,
        };
        break;
      case 'writing':
        toUpdate = {
          Write: level + 1,
        };
        break;
      case 'speaking':
        toUpdate = {
          Speak: level + 1,
        };
        break;
    }
    const postObject = {
      tables: 'student_practices',
      values: toUpdate,
      conditions: {
        WHERE: {
          ID: practiceID,
        },
      },
    };
    this.utilityService.post('update_entry', {
        data: JSON.stringify(postObject),
      })
      .subscribe();
  }

  createSpeechModule(name: string, practice: boolean = false) {
    const id = this.utilityService.createID32();
    const postObject = {
      tables: practice ? 'speech_practices' : 'speech_modules',
      values: {
        Name: name,
        ID: id,
      },
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  editSpeechModule(id: string, name: string, practice: boolean = false) {
    const postObject = {
      tables: practice ? 'speech_practices' : 'speech_modules',
      values: {
        Name: name,
      },
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  deleteSpeechModule(id: string, practice: boolean = false) {
    const postObject = {
      tables: practice ? 'speech_practices' : 'speech_modules',
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  async createSpeechLesson(
    moduleID: string,
    name: string,
    description: string,
    lessonType: string,
    lessonFile?: File,
    jsonQuiz?: File,
    practice: boolean = false
  ) {
    var lessonDrillObj = {};
    var quizAudioObj = {};
    if (lessonFile) {
      const lessonFileExt = lessonFile.name.split('.').pop();
      const videoFileExtensions = [
        '.mp4',
        '.mov',
        '.avi',
        '.mkv',
        '.wmv',
        '.flv',
        '.webm',
        '.mpg',
        '.mpeg',
        '.3gp',
        '.m4v',
        '.ogv',
        '.ts',
        '.vob',
        '.swf',
        '.rm',
        '.rmvb',
        '.m2ts',
        '.asf',
        '.divx',
        '.m2v',
        '.mpg2',
        '.mpg4',
        '.mxf',
        '.f4v',
        '.h264',
        '.h265',
      ];

      if (
        lessonFileExt != 'pdf' &&
        !videoFileExtensions.includes(`.${lessonFileExt}`)
      ) {
        this.userService.failedSnackbar(`Invalid ${practice ? 'Drill' : 'Lesson'} File!`);
        return;
      }

      const lessonDir = `modules/${this.utilityService.createID36()}.${lessonFileExt}`;
      await this.fileService.uploadFileAsync(lessonFile, lessonDir);

      lessonDrillObj = practice
        ? { DrillFile: `${lessonDir}>${lessonFile.name}` }
        : { LessonFile: `${lessonDir}>${lessonFile.name}` };
    }

    if (jsonQuiz) {
      const quizFileExt = jsonQuiz.name.split('.').pop();
      if (practice ? quizFileExt != 'mp3' : quizFileExt != 'json') {
        this.userService.failedSnackbar(`Invalid ${practice ? 'Audio' : 'JSON'} File!`);
        return;
      }
      const quizDir = `modules/${this.utilityService.createID36()}.${quizFileExt}`;

      await this.fileService.uploadFileAsync(jsonQuiz, quizDir);

      quizAudioObj = practice
        ? { AudioFile: `${quizDir}>${jsonQuiz.name}` }
        : { QuizFile: `${quizDir}>${jsonQuiz.name}` };
    }

    const id = this.utilityService.createID32();
    const postObject = {
      tables: practice ? 'speech_drills' : 'speech_lessons',
      values: Object.assign(
        {
          ID: id,
          Description: description,
        },
        lessonDrillObj,
        quizAudioObj,
        practice
          ? {
              PracticeID: moduleID,
            }
          : {
              ModuleID: moduleID,
              LessonType: lessonType,
            }
      ),
    };
    return this.utilityService.post('create_entry', {
        data: JSON.stringify(postObject),
    });
  }

  async updateSpeechLesson(
    lessonID: string,
    moduleID: string,
    name: string,
    description: string,
    lessonType: string,
    lessonFile?: File,
    jsonQuiz?: File,
    practice: boolean = false
  ) {
    var lessonDrillObj = {};
    var quizAudioObj = {};
    if (lessonFile) {
      const lessonFileExt = lessonFile.name.split('.').pop();
      const videoFileExtensions = [
        '.mp4',
        '.mov',
        '.avi',
        '.mkv',
        '.wmv',
        '.flv',
        '.webm',
        '.mpg',
        '.mpeg',
        '.3gp',
        '.m4v',
        '.ogv',
        '.ts',
        '.vob',
        '.swf',
        '.rm',
        '.rmvb',
        '.m2ts',
        '.asf',
        '.divx',
        '.m2v',
        '.mpg2',
        '.mpg4',
        '.mxf',
        '.f4v',
        '.h264',
        '.h265',
      ];

      if (
        lessonFileExt != 'pdf' &&
        !videoFileExtensions.includes(`.${lessonFileExt}`)
      ) {
        this.userService.failedSnackbar(`Invalid ${practice ? 'Drill' : 'Lesson'} File!`);
        return;
      }

      const lessonDir = `modules/${this.utilityService.createID36()}.${lessonFileExt}`;
      await this.fileService.uploadFileAsync(lessonFile, lessonDir);

      lessonDrillObj = practice
        ? { DrillFile: `${lessonDir}>${lessonFile.name}` }
        : { LessonFile: `${lessonDir}>${lessonFile.name}` };
    }

    if (jsonQuiz) {
      const quizFileExt = jsonQuiz.name.split('.').pop();
      if (practice ? quizFileExt != 'mp3' : quizFileExt != 'json') {
        this.userService.failedSnackbar(`Invalid ${practice ? 'Audio' : 'JSON'} File!`);
        return;
      }
      const quizDir = `modules/${this.utilityService.createID36()}.${quizFileExt}`;

      await this.fileService.uploadFileAsync(jsonQuiz, quizDir);

      quizAudioObj = practice
        ? { AudioFile: `${quizDir}>${jsonQuiz.name}` }
        : { QuizFile: `${quizDir}>${jsonQuiz.name}` };
    }

    const postObject = {
      tables: practice ? 'speech_drills' : 'speech_lessons',
      values: Object.assign(
        {
          description: description,
        },
        lessonDrillObj,
        quizAudioObj,
        practice
          ? {
              PracticeID: moduleID,
            }
          : {
              ModuleID: moduleID,
              LessonType: lessonType,
            }
      ),
      conditions: {
        WHERE: {
          ID: lessonID,
        },
      },
    };
    console.log(postObject);
    return this.utilityService.post('update_entry', {
        data: JSON.stringify(postObject),
    });
  }

  deleteSpeechLesson(id: string, practice: boolean = false) {
    const postObject = {
      tables: practice ? 'speech_drills' : 'speech_lessons',
      conditions: {
        WHERE: {
          ID: id,
        },
      },
    };
    return this.utilityService.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }

  loadSpeechLabs() {
    const postObject = {
      selectors: ['*'],
      tables: 'speech_labs',
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  loadSpeechAllModules(practice: boolean = false) {
    const postObject = {
      selectors: practice ? ['speech_practices.*'] : ['speech_modules.*'],
      tables: practice ? 'speech_practices' : 'speech_modules',
      conditions: {
        'ORDER BY': practice
          ? 'speech_practices.timestamp'
          : 'speech_modules.timestamp',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  loadSpeechLessons(moduleID: string, practice: boolean = false) {
    const postObject = {
      selectors: practice
        ? ['speech_drills.*, speech_practices.name as practice']
        : ['speech_lessons.*, speech_modules.name as module'],
      tables: practice
        ? 'speech_drills, speech_practices'
        : 'speech_lessons, speech_modules',
      conditions: {
        WHERE: practice
          ? {
              'speech_drills.PracticeID': moduleID,
              'speech_practices.ID': 'speech_drills.PracticeID',
            }
          : {
              'speech_lessons.ModuleID': moduleID,
              'speech_modules.ID': 'speech_lessons.ModuleID',
            },
        'ORDER BY': practice
          ? 'speech_drills.timestamp'
          : 'speech_lessons.timestamp',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  loadSpeechAllLessons(practice: boolean = false) {
    const postObject = {
      selectors: practice
        ? ['speech_drills.*, speech_practices.name as practice']
        : ['speech_lessons.*, speech_modules.name as module'],
      tables: practice
        ? 'speech_drills, speech_practices'
        : 'speech_lessons, speech_modules',
      conditions: {
        WHERE: practice
          ? {
              'speech_practices.ID': 'speech_drills.PracticeID',
            }
          : {
              'speech_modules.ID': 'speech_lessons.ModuleID',
            },
        'ORDER BY': practice
          ? 'speech_drills.timestamp'
          : 'speech_lessons.timestamp',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  checkIfOffline(lessonID: string) {
    const postObject = {
      selectors: ['*'],
      tables: 'modules',
      conditions: {
        WHERE: {
          ID: lessonID,
        },
      },
    };
    return this.userService
      .localPost('get_entries', {
        data: JSON.stringify(postObject),
      })
      .pipe(
        map((response: any) => {
          return response.output.length > 0;
        })
      );
  }

  downloadCourses() {
    if (this.userService.getUserType() != '0') return;
    const id = this.userService.getUserData().id;
    const postObject = {
      selectors: [
        'teachers.FirstName',
        'teachers.LastName',
        'courses.Course',
        'lessons.*',
      ],
      tables: 'teachers,courses,classes, student_classes,lessons',
      conditions: {
        WHERE: {
          'student_classes.StudentID': id,
          'classes.ID': 'student_classes.ClassID',
          'courses.ID': 'classes.CourseID',
          'courses.TeacherID': 'teachers.ID',
          'lessons.CourseID': 'courses.ID',
        },
      },
    };
    const download$ = this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    }).subscribe(async (data) => {
      let i = 1;
      for (let module of data.output) {
        if (await this.checkIfOffline(module.id)) {
          this.userService.downloadProgress$.next((i / data.output.length) * 100);
          i += 1;
          continue;
        }
        if (module.attachments) {
          const link = module.attachments.split('>')[0];
          const file = await firstValueFrom(
            this.http.get(this.userService.getURL(link), { responseType: 'blob' })
          );
          const base = await firstValueFrom(this.fileService.getBaseAsync(file));
          await firstValueFrom(
            this.http.post(`${environment.localServer}:3000` + '/filehandler', {
              key: environment.socketKey,
              method: 'create_url',
              file_content: base,
              search_key: link,
            })
          );
        }

        const postObject2 = {
          tables: 'modules',
          values: {
            StudentID: id,
            CourseID: module.courseid,
            Course: module.course,
            Title: module.title,
            Details: module.details,
            Attachments: module.attachments,
            Difficulty: Number(module.difficulty),
            Time: module.time,
            ID: Number(module.id),
          },
        };
        await firstValueFrom(
          this.utilityService.localPost('create_entry', {
            data: JSON.stringify(postObject2),
          })
        );

        this.userService.downloadProgress$.next((i / data.output.length) * 100);
        i += 1;
      }
      download$.unsubscribe();
    });
  }

  loadOffline() {
    const id = this.userService.getUserData().id;
    var user = {};
    if (id) {
      user = {
        StudentID: id,
      };
    }
    const postObject = {
      selectors: ['modules.*'],
      tables: 'modules',
      conditions: {
        WHERE: Object.assign(
          {
            '1': '1',
          },
          user
        ),
      },
    };
    return this.userService.localPost('get_entries', {
      data: JSON.stringify(postObject),
    });
  }
}