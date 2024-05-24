import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { UserService } from './user.service';
import { FileService } from './file.service';
import {
  AssemblyAI,
  TranscribeParams,
  TranscriptLanguageCode,
} from 'assemblyai';
import { Observable, Subject } from 'rxjs';
import { UtilityService } from './utility.service';

const client = new AssemblyAI({
  apiKey: environment.assemblyAIToken,
});

@Injectable({
  providedIn: 'root',
})
export class MediaService {
  public speechComparison$: Subject<any> = new Subject<any>();

  constructor(
    private http: HttpClient,
    private userService: UserService,
    private utilityService: UtilityService
  ) {}

  speechToText(audioData: any, check: string, language: string) {
    const blob = new Blob([audioData], { type: 'audio/wav' });
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      const uniqID = this.utilityService.createID36() + '.wav';
      this.http
        .post(environment.nodeserver + '/filehandler', {
          key: environment.socketKey,
          method: 'create_url',
          file_content: base64String,
          search_key: 'temp/' + uniqID,
        })
        .subscribe((data: any) => {
          const url = environment.server + '/temp/' + uniqID;
          const params: TranscribeParams = {
            audio: url,
            language_code: language as TranscriptLanguageCode,
          };
          const stamp = Date.now();
          client.transcripts
            .transcribe(params, {
              pollingInterval: 100,
            })
            .then((transcript) => {
              if (transcript.text != null) {
                this.speechComparison$.next({
                  spoken: transcript.text,
                  accuracy: this.similarity(
                    transcript.text.toLowerCase(),
                    check!.toLowerCase()
                  ),
                });
              } else {
                this.userService.failedSnackbar('Transcription failed');
              }
            });
        });
    };

    reader.readAsDataURL(blob);
  }

  pronounce(word: string) {
    const salt = new Date().getTime();
    return this.http.get<any>(
      environment.server + '/audio/' + word + '.json?' + salt,
      {
        headers: {},
      }
    );
  }

  fetchSRAPI(url: string, language: string) {
    var lang = 'en-US';
    switch (language) {
      case 'ja':
        lang = 'ja-JP';
        break;
    }
    const encodedParams = new URLSearchParams();
    encodedParams.set('audio_url', url);
    encodedParams.set('language_code', lang);

    const headers = new HttpHeaders({
      'X-RapidAPI-Key': environment.srKey,
      'X-RapidAPI-Host': environment.srHost,
      'content-type': 'application/x-www-form-urlencoded',
    });
    return this.http.post<any>(
      'https://' + environment.srHost + '/recognize',
      encodedParams,
      { headers }
    );
  }

  tts(text: string, lang: string) {
    const params = new HttpParams()
      .set('msg', text)
      .set('lang', 'Salli')
      .set('source', 'ttsmp3');
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
      'X-RapidAPI-Key': 'c29ff39618mshcedc0e4b8d12b69p18ec51jsnd5550cdbf497',
      'X-RapidAPI-Host': 'text-to-speech-for-28-languages.p.rapidapi.com',
    });
    return this.http.post(
      'https://text-to-speech-for-28-languages.p.rapidapi.com/',
      {
        data: params,
      },
      {
        headers,
      }
    );
  }

  savePronunciation(word: string, soundURL: string) {
    return this.utilityService
      .post('save_pronunciation', {
        search_key: word,
        sound_url: soundURL,
      })
      .subscribe((data) => {});
  }

  similarity(s1: string, s2: string) {
    var longer = s1;
    var shorter = s2;
    if (s1.length < s2.length) {
      longer = s2;
      shorter = s1;
    }
    var longerLength = longer.length;
    if (longerLength == 0) {
      return 1.0;
    }
    return (
      (longerLength - this.editDistance(longer, shorter)) /
      parseFloat(longerLength.toString())
    );
  }

  editDistance(s1: string, s2: string) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();

    var costs = new Array();
    for (var i = 0; i <= s1.length; i++) {
      var lastValue = i;
      for (var j = 0; j <= s2.length; j++) {
        if (i == 0) costs[j] = j;
        else {
          if (j > 0) {
            var newValue = costs[j - 1];
            if (s1.charAt(i - 1) != s2.charAt(j - 1))
              newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
            costs[j - 1] = lastValue;
            lastValue = newValue;
          }
        }
      }
      if (i > 0) costs[s2.length] = lastValue;
    }
    return costs[s2.length];
  }

  textToSpeech(phrase: string, language: string): Observable<any> {
    var speaker = {
      voice: 'Joanna',
      language: 'en-US',
      engine: 'neutral',
    };
    switch (language) {
      case 'en':
        speaker = {
          voice: 'Joanna',
          language: 'en-US',
          engine: 'neural',
        };
        break;
      case 'fr':
        speaker = {
          voice: 'Celine',
          language: 'fr-FR',
          engine: 'standard',
        };
        break;
      case 'ja':
        speaker = {
          voice: 'Kazuha',
          language: 'ja-JP',
          engine: 'neural',
        };
        break;
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': environment.ttskey,
      'X-RapidAPI-Host': environment.ttshost,
    });

    return this.http.post<any>(
      'https://' + environment.ttshost + '/synthesize-speech',
      JSON.stringify({
        sentence: phrase,
        language: speaker.language,
        voice: speaker.voice,
        engine: speaker.engine,
        withSpeechMarks: false,
      }),
      {
        headers: headers,
      }
    );
  }
}
