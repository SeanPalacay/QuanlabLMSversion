import { DOCUMENT } from '@angular/common';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { error } from 'jquery';
import { EMPTY, catchError } from 'rxjs';
import { APIService } from 'src/app/services/API/api.service';


@Component({
  selector: 'app-dictionary',
  templateUrl: './dictionary.component.html',
  styleUrls: ['./dictionary.component.css']
})
export class DictionaryComponent {

  @ViewChild('word') wordInput?: ElementRef;
  
  word:string = '';
  definitions:Array<any> = [

  ];
  constructor(private API: APIService){}

  texthandler(event: any){
    this.word = event.target.value;
  }
  getDefinition(){
    this.API.justSnackbar('Searching definition....',9999999);
    this.definitions = [];
    this.API.getWord(this.word.trim().toLowerCase()
    ).subscribe(data=>{
      if(data.output.length <= 0){
        this.API.fetchDictionaryAPI(this.word.trim().toLowerCase()).pipe(
          catchError(()=>{
            this.API.failedSnackbar("Can't fetch the word from dictionary right now.");
            return EMPTY;
          })
        ).subscribe(data=>{
          if(data.results.length <= 0){
            this.API.saveDictionary(this.word.trim().toLowerCase())
            this.API.failedSnackbar('Word not found!');
            this.definitions = [];
            return;
          }
          for(let result of data.results) {
            if( result.language != 'en' && result.language != 'fr' && result.language != 'ja'){
              continue;
            }
            var defEntry:any = {};
            defEntry.word = result.headword.text;
            if(result.headword.pronunciation!= null){
              defEntry.say = result.headword.pronunciation.value;
            }
            defEntry.pos = result.headword.pos;
            defEntry.language = result.language;
            if(result.headword.alternative_scripts!=null){
              defEntry.alts = result.headword.alternative_scripts;
            }
            defEntry.senses = [];
            for(let sense of result.senses){
              var sensEntry:any={};
              sensEntry.definition = sense.definition;
              if(sense.translations!= null){
                if(sense.translations.fr != null){
                  sensEntry.fr = sense.translations.fr.text;
                }
                if(sense.translations.en != null){
                  sensEntry.en = sense.translations.en.text;
                }
                if(sense.translations.ja != null){
                  if(sense.translations.ja.text != null){
                    sensEntry.ja = sense.translations.ja.text;
                  }else{
                    sensEntry.ja = sense.translations.ja.alternative_scripts[0].text
                  }
                  if(sense.translations.ja.alternative_scripts != null){
                    sensEntry.ja_alt = sense.translations.ja.alternative_scripts
                  }
                }
              }
              sensEntry.examples = [];
              if(sense.examples!=null){
                for(let example of sense.examples){
                  var senseSample:any={};
                  senseSample.sentence = example.text;
                  if(example.alternative_scripts != null){
                    senseSample.sentence_alt = example.alternative_scripts;
                  }
                  if(example.translations != null){
                    if(example.translations.fr != null){
                      senseSample.fr = example.translations.fr.text;
                    }
                    if(example.translations.en != null){
                      senseSample.en = example.translations.en.text;
                    }
                    if(example.translations.ja != null){
                      senseSample.ja = example.translations.ja.text;
                      if(example.translations.ja.alternative_scripts != null){
                        senseSample.ja_alt = example.translations.ja.alternative_scripts
                      }
                    }
                  }
                
                  sensEntry.examples.push(senseSample);
                }
              }
              defEntry.senses.push(sensEntry);
            }
            this.definitions.push(defEntry);
            
          }
          if(this.definitions.length <= 0){
            this.API.saveDictionary(this.word.trim().toLowerCase())
            this.API.failedSnackbar('Word not found!');
            return;
          }
          this.API.saveDictionary(this.word.trim().toLowerCase(), JSON.stringify(this.definitions));
          this.API.successSnackbar('Done!');
        });
        return;
      }
      if(data.output[0].file != null){
        this.API.dictionary(data.output[0].file).subscribe(dictionary=>{
          this.definitions = dictionary;
        });
        this.API.successSnackbar('Done!');
      }else{
        this.API.failedSnackbar('Word not found!');
      }
    },
    );
  }


  speak(word:string, language:string){

    this.API.justSnackbar('Getting pronunciation....', 99999999)
    this.API.textToSpeech(word, language).pipe(
      catchError((err2)=>{
        this.API.failedSnackbar('Problem in playing pronunciation.');
        return EMPTY;
      })
    ).subscribe(data=>{
      this.API.successSnackbar('Done!');
        var audio = new Audio();
        audio.src = data.fileDownloadUrl;
        audio.load();
        audio.play();
        // this.API.savePronunciation(word+'-'+language, data.fileDownloadUrl);
    });        
    // this.API.savePronunciation(word, "https://m22-tts-out.s3.amazonaws.com/10b765d7-0d99-41ca-8fdf-517a249a035c.mp3?X-Amz-Security-Token=IQoJb3JpZ2luX2VjEN3%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FwEaCXVzLWVhc3QtMSJGMEQCIGqKGCc5O%2FPSASKcdUqKQuhmtFD1U25S%2B9z%2FrtKBJA8NAiBL5HoiYArFzefdcAzLRDUQT2%2BEvvkxY3CF75skA8Wi0Sr2Agh2EAEaDDkzMjQ4MDA3OTUxMiIMDvhn9lQvNkG%2Fp4q%2BKtMCIO8dj6IJmdtZHFc7QQ9AxcU%2Fc8mOObB%2BDICEJruv3rbgf%2BIp4cL4hDtVpND7NbWamUuuIEx%2FIB%2BLm3UDN1rnVycg09TWKLVoWVQgx618z1tWZm%2B9IXYnFu3D3mIPppsWK6bVIDKvJroo%2BynklDDaveWMbvYHlPxlQXKHUJY0NMyOk435BJBw1vMrbpIwQ3DdNF9D%2B%2BX37fikZmGZaHUnFdY%2FDQj%2FieR%2BNbyruck0rTLYUwHSetNgf4JVkA5OXEkiAzeFC3j5ql5RoFV6xDZ3XCzp7quqHdqKA%2FQljgHHm%2F8gAfJ7Nm4qIyqw8Qy%2B%2BVsJFCYCRsTwep%2B4TiJOZlKLEma4I5bU0G8TwA3bBV807Nymy3Jcr4yGvHQdH115rIMQKOJSBUB1e%2FUHJliIXWTvjH6misPZ0nAePGa3fI73pYYb9sVlKRwGholMo%2FFMagdV1S4QMN3R2qwGOp8BDaU0dJLG%2Fg2%2F1ONt8x5jVfARNAWAVq5xUglz6zvnEJkspmkK4CvZBKFilMXtyv713lXeYgDBe5gvo9eH5I1PJ3jDH8aa8YPW%2BoLPjpf8D7M%2Biq1eEIZMLae6Fn4LSyro8akpKGAWVuHMmvEuFeWiTr3NpngyI8igB9NBRQW4KxNvDFgaezPkrIosxo%2BscuiU3evfptjAcKQQ%2BdBxD3IU&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20240104T124727Z&X-Amz-SignedHeaders=host&X-Amz-Expires=3600&X-Amz-Credential=ASIA5SHBE22MIAR3F7UN%2F20240104%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=6c96374f6c0021d0fb56554e794474d48a60b0ef56be0c9e78ec39609c820aaf");
    // this.API.pronounce(word+'-'+language).subscribe(sound=>{
    //   //play sound
    //   const audio = new Audio();
    //   audio.src = sound.soundurl;
    //   audio.addEventListener('error',(e)=>{
    //     this.API.textToSpeech(word, language).pipe(
    //       catchError((err2)=>{
    //         this.API.failedSnackbar('Problem in playing pronunciation.');
    //         return EMPTY;
    //       })
    //     ).subscribe(data=>{
    //         var audio = new Audio();
    //         audio.src = data.fileDownloadUrl;
    //         audio.load();
    //         audio.play();
    //         // this.API.savePronunciation(word+'-'+language, data.fileDownloadUrl);
    //     });        
    //   })
    //   audio.load();
    //   audio.play();

    // },error=>{
    //   this.API.textToSpeech(word, language).pipe(
    //     catchError((err2)=>{
    //       this.API.failedSnackbar('Problem in playing pronunciation.');
    //       return EMPTY;
    //     })
    //   ).subscribe(data=>{
    //       var audio = new Audio();
    //       audio.src = data.fileDownloadUrl;
    //       audio.load();
    //       audio.play();
    //       // this.API.savePronunciation(word+'-'+language, data.fileDownloadUrl);
    //   });
    // }
    
    // );
  }

  reset(){
    this.definitions = [];
    this.wordInput!.nativeElement.value = '';
    this.word = '';
  }

  highlighWord(hightlight:string, string:string){
    try{
      const regEx = new RegExp(hightlight.split(" ")[0], "ig");
      return string.replaceAll(regEx, '<b class="dictionary-highlight-word">'+hightlight.split(" ")[0]+'</b>');
    }catch(e){
      return string;
    }
  }
}
