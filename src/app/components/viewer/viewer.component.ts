import { AfterContentInit, AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.css']
})
export class ViewerComponent implements AfterContentInit {
  @Input() link: string = '';

  ngAfterContentInit(): void {
    let iframe =  document.querySelector('#iframe') as HTMLIFrameElement;
    let style = document.createElement('style');
    style.innerHTML = `
      .test{
        color:white;
      }
    `
  }

}
