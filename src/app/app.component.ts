import { Component, HostListener, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { APIService } from './services/API/api.service';

import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {


  constructor(private API: APIService, private renderer: Renderer2, private router:Router) {}


  ngOnInit(): void {
      // this.checkNetworkStatus();
  }

  ngOnDestroy(): void {
      // this.networkStatus$.unsubscribe();
  }

  title = 'quanlab';

  logout() {
    this.renderer.removeClass(document.body, 'min-[768px]:ml-64');
    this.API.logout(); 
  }

  // @HostListener('document:contextmenu', ['$event'])
  // onContextMenu(event: MouseEvent): void {
  //   event.preventDefault();
  // }

  
  
  private disableContextMenu(): void {
    this.disableCtrlShiftKeys();
    this.renderer.listen('document', 'contextmenu', (event) => {
      event.preventDefault();
      this.API.failedSnackbar('Right Click is Disabled!');

    });
  }

  private disableCtrlShiftKeys(): void {
    this.renderer.listen('document', 'keydown', (event) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && (event.key === 'I' || event.key === 'C')) {
        event.preventDefault();
        this.API.failedSnackbar('Ctrl+Shift+' + event.key + ' is Disabled!');
      }
    });
  }
}
