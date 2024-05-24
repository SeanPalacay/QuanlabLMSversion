import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { FileService } from './file.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root',
})
export class LessonService {
  constructor(
    private utilityService: UtilityService
  ) {}

  createLesson(
    courseID: string,
    title: string,
    description: string,
    complexity: number,
    attachments?: string,
    image?: string
  ) {
    var attach = {};
    if (attachments != undefined) {
      attach = { Attachments: attachments };
    }
    var bg = {};
    if (image != undefined) {
      bg = { Background: image };
    }
    const postObject = {
      tables: 'lessons',
      values: Object.assign(
        {},
        {
          CourseID: courseID,
          Title: title,
          Details: description,
          Difficulty: complexity,
        },
        attach,
        bg
      ),
    };
    return this.utilityService.post('create_entry', {
      data: JSON.stringify(postObject),
    });
  }

  updateLesson(
    courseID: string,
    lessonID: string,
    title: string,
    description: string,
    complexity: number,
    attachments?: string,
    image?: string
  ) {
    var attach = {};
    if (attachments != undefined) {
      attach = { Attachments: attachments };
    }
    var bg = {};
    if (image != undefined) {
      bg = { Background: image };
    }
    const postObject = {
      tables: 'lessons',
      values: Object.assign(
        {
          Title: title,
          Details: description,
          Difficulty: complexity,
        },
        attach,
        bg
      ),
      conditions: {
        WHERE: {
          CourseID: courseID,
          ID: lessonID,
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  deleteLesson(lessonID: string) {
    const postObject = {
      tables: 'lessons',
      conditions: {
        WHERE: {
          ID: lessonID,
        },
      },
    };
    return this.utilityService.post('delete_entry', {
      data: JSON.stringify(postObject),
    });
  }
}
