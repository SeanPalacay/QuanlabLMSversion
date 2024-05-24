import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { UserService } from './user.service';
import { FileService } from './file.service';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root',
})
export class DictionaryService {
  constructor(
    private http: HttpClient,
    private userService: UserService,
    private fileService: FileService,
    private utilityService: UtilityService
  ) {}

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
    const observable$: Subscription = this.utilityService
      .post('create_entry', {
        data: JSON.stringify(postObject),
      })
      .subscribe(() => observable$.unsubscribe());
  }

  loadWordSearches() {
    const postObject = {
      selectors: ['*'],
      tables: 'word_searches',
      conditions: {
        'WHERE FILE': 'IS NOT NULL',
      },
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  fetchDictionaryAPI(word: string) {
    const headers = new HttpHeaders({
      'X-RapidAPI-Key': environment.lexicalakey,
      'X-RapidAPI-Host': environment.lexicalahost,
    });
    return this.http.get<any>(
      'https://' + environment.lexicalahost + '/search-entries',
      {
        headers: headers,
        params: { text: word },
      }
    );
  }
}
