import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, firstValueFrom, from } from 'rxjs';
import { ViewerComponent } from 'src/app/components/viewer/viewer.component';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';

@Injectable({
  providedIn: 'root',
})
export class FileService {
  public usedStorage = localStorage;

  constructor(private http: HttpClient, private modalService: NgbModal) {}

  async getServerFileAsBase64(link: string) {
    const file = await firstValueFrom(
      this.http.get(this.getURL(link), { responseType: 'blob' })
    );
    const base = await firstValueFrom(this.getBaseAsync(file));
    return base;
  }

  async getServerFile(link: string) {
    const url = this.getURL(link);
    const file = await this.http.get(url, { responseType: 'blob' }).toPromise();
    return file;
  }

  uploadFile(file: File, filename: string) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      this.http
        .post(environment.nodeserver + '/filehandler', {
          key: environment.socketKey,
          method: 'create_url',
          file_content: base64String,
          search_key: 'files/' + filename,
        })
        .subscribe();
    };
    reader.readAsDataURL(file);
  }

  deleteFile(file: string) {
    const obs = this.http
      .post(environment.nodeserver + '/filehandler', {
        key: environment.socketKey,
        method: 'delete_url',
        search_key: file,
      })
      .subscribe((data) => {
        obs.unsubscribe();
      });
  }

  uploadImage(image: File, filename: string) {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      const obs$ = this.http
        .post(environment.nodeserver + '/filehandler', {
          key: environment.socketKey,
          method: 'create_url',
          file_content: base64String,
          search_key: 'image_upload/' + filename,
        })
        .subscribe(() => {
          obs$.unsubscribe();
        });
    };
    reader.readAsDataURL(image);
  }

  uploadBase64(file: string, name: string) {
    const base64String = (file as string).split(',')[1];
    this.http
      .post(environment.nodeserver + '/filehandler', {
        key: environment.socketKey,
        method: 'create_url',
        file_content: base64String,
        search_key: name,
      })
      .subscribe();
  }

  async uploadBase64Async(file: string, name: string) {
    const base64String = (file as string).split(',')[1];
    await this.http
      .post(environment.nodeserver + '/filehandler', {
        key: environment.socketKey,
        method: 'create_url',
        file_content: base64String,
        search_key: name,
      })
      .toPromise();
  }

  async uploadFileAsync(file: File, location: string) {
    const base = await firstValueFrom(this.getBaseAsync(file));
    await firstValueFrom(
      this.http.post(environment.nodeserver + '/filehandler', {
        key: environment.socketKey,
        method: 'create_url',
        file_content: base,
        search_key: location,
      })
    );
  }

  uploadJson(json: string, name: string) {
    const base64String = btoa(unescape(encodeURIComponent(json)));
    this.http
      .post(environment.nodeserver + '/filehandler', {
        key: environment.socketKey,
        method: 'create_url',
        file_content: base64String,
        search_key: name,
      })
      .subscribe();
  }

  uploadProfilePicture(file: string, name: string) {
    const base64String = (file as string).split(',')[1];
    return this.http.post(environment.nodeserver + '/filehandler', {
      key: environment.socketKey,
      method: 'create_url',
      file_content: base64String,
      search_key: `${name}`,
    });
  }

  getBaseAsync(file: Blob): Observable<string> {
    return new Observable((obs) => {
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = (reader.result as string).split(',')[1];
        obs.next(base64String);
        obs.complete();
      };
      reader.readAsDataURL(file);
    });
  }

  getURL(file: string) {
    if (file) {
      if (file.includes('http')) return file;
      return `${environment.server}/${file}?${new Date().getTime()}`;
    }
    return file;
  }

  openFile(file: string) {
    const modalOptions: NgbModalOptions = {
      centered: false,
      size: 'lg',
      windowClass: 'viewer-window',
    };

    const modalRef = this.modalService.open(ViewerComponent, modalOptions);
    modalRef.componentInstance.link = environment.server + '/' + file;
  }

  openLocalFile(file: string) {
    const modalOptions: NgbModalOptions = {
      centered: false,
      size: 'lg',
      windowClass: 'viewer-window',
    };

    const modalRef = this.modalService.open(ViewerComponent, modalOptions);
    modalRef.componentInstance.link = `${environment.localServer}/${file}`;
  }
}
