import { ChangeDetectorRef, Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { APIService } from 'src/app/services/API/api.service';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import SignaturePad from 'signature_pad';

@Component({
  selector: 'app-student-profile',
  templateUrl: './student-profile.component.html',
  styleUrls: ['./student-profile.component.css'],
  animations: [
    trigger('fadeInOut', [
      state(
        'void',
        style({
          opacity: 0,
        })
      ),
      transition('void <=> *', animate(300)),
    ]),
  ],
})
export class StudentProfileComponent implements OnInit {
  showEditPic = false;
  editing = false;
  editingEmail = false;
  editingPassword = false;
  user: any;
  edited!: string;
  selectedFile: File | null = null;
  showModalEmail = false;
  showModalPassword = false;
  teacher: boolean | undefined;
  student: boolean | undefined;
  principal: boolean | undefined;
  admin: boolean | undefined;

  userType: any;


  showSignatureModal = false;
  signPad: any;
  @ViewChild('signPadCanvas', { static: false }) signaturePadElement!: ElementRef;
  imageUrl: string = '';

  constructor(
    private API: APIService,
    private cdf: ChangeDetectorRef,
    private router: Router
  ) {
    this.initializeUserType();
  }

  ngOnInit(): void {
    this.user = this.API.getUserData();
    this.userType = this.API.getUserAccountType();
  }
  ngAfterViewInit() {
    this.signPad = new SignaturePad(this.signaturePadElement.nativeElement);
  }
  openSignatureModal() {
    this.showSignatureModal = true;
    setTimeout(() => {
      this.signPad = new SignaturePad(this.signaturePadElement.nativeElement, {
        minWidth: 1,
        maxWidth: 2,
        penColor: 'black',
        throttle: 0,
      });
    }, 0);
  }

  closeSignatureModal() {
    this.showSignatureModal = false;
  }

  undoSign() {
    const data = this.signPad.toData();
    if (data) {
      data.pop(); // remove the last step
      this.signPad.fromData(data);
    }
  }

  clearSignPad() {
    this.signPad.clear();
  }

  async saveSignPad() {
    if (this.signPad.isEmpty()) {
      console.log('Please provide a signature first.');
    } else {
      const base64ImageData = this.signPad.toDataURL();
      this.imageUrl = base64ImageData;
      console.log(this.imageUrl);
      const filename =  `sign/${this.API.getUserData().id}.png`
      await this.API.uploadBase64Async(this.imageUrl, filename);
      const obs$ =this.API.updateEsign(filename).subscribe(()=>{
        const userInfo = this.API.getUserData();
        userInfo.esign = filename + '?' + new Date().getTime();
        this.API.updateLocalUserData(JSON.stringify(userInfo));
        this.API.successSnackbar('Successfully saved your signature!');
        obs$.unsubscribe();
      })
      // Save signature as PNG file
      // const link = document.createElement('a');
      // link.href = base64ImageData;
      // link.download = 'signature.png';
      // link.click();

      localStorage.setItem('signature', base64ImageData);

      this.closeSignatureModal();
    }
  }



getUserSignature(){
  const ref = this.API.getUserData().esign;
  if(ref){
    return this.getURL(ref);
  }else{
    return ref;
  }
}
  getURL(file: string) {
    if (file.includes('http')) {
      return file;
    } else {
      return this.API.getURL(file);
    }
  }

  initializeUserType() {
    const userType = this.API.getUserType();
    this.student = userType === '0';
    this.teacher = userType === '1';
    this.admin = userType === '2';
    this.principal = userType === '2';
  }

  openModalEmail() {
    this.showModalEmail = true;
  }

  closeModalEmail() {
    this.showModalEmail = false;
  }

  openModalPassword() {
    this.showModalPassword = true;
  }

  closeModalPassword() {
    this.showModalPassword = false;
  }

  toggleEdit() {
    
    this.editing = !this.editing;
    if (!this.editing) {
      this.API.updateLocalUserData(JSON.stringify(this.user));
      const obs1$ = this.API.updateStudentName(
        this.user.id,
        this.user.firstname,
        this.user.lastname
      ).subscribe(() => {
        this.API.successSnackbar("Updated");
        obs1$.unsubscribe();
      });
      const obs2$ = this.API.updateTeacherName(
        this.user.id,
        this.user.firstname,
        this.user.lastname
      ).subscribe(
        () => {
          this.API.successSnackbar("Updated");
          obs2$.unsubscribe();
        },
        (error) => {
          console.error("Error:", error);
          this.API.failedSnackbar("Can't update");
        }
      );
      
    }
    
  }

  toggleEditEmail() {
    this.editingEmail = !this.editingEmail;
    if (!this.editingEmail) {
      this.API.updateLocalUserData(JSON.stringify(this.user));
      const obs$ = this.API.updateStudentEmail(
        this.user.id,
        this.user.email
      ).subscribe(() => {
        obs$.unsubscribe();
      });
      const obs2$ = this.API.updateTeacherEmail(
        this.user.id,
        this.user.email
      ).subscribe(() => {
        obs2$.unsubscribe();
      });
    }
  }

  toggleEditPassword() {
    this.editingPassword = !this.editingPassword;
    if (!this.editingPassword) {
      this.API.updateLocalUserData(JSON.stringify(this.user));
      const obs$ = this.API.updateStudentPassword(
        this.user.id,
        this.user.password
      ).subscribe(() => {
        obs$.unsubscribe();
      });

      const obs2$ = this.API.updateTeacherPassword(
        this.user.id,
        this.user.password
      ).subscribe(() => {
        obs2$.unsubscribe();
      });
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = reader.result as string;
        const fileRef = `profiles/${this.API.createID36()}.png`;
        this.API.justSnackbar('Updating Profile....', 99999999);
       
        const upload$ = this.API.uploadProfilePicture(
          base64String,
          fileRef
        ).subscribe((data) => {
          console.log('Response', data);
          this.user.profile = fileRef;
          this.API.updateLocalUserData(JSON.stringify(this.user));
          const obs$ = this.API.updateProfileImage(
            this.user.id,
            fileRef
          ).subscribe(() => {
            this.API.successSnackbar('Profile updated successfully');
            obs$.unsubscribe();
            upload$.unsubscribe();
          });
        });

        // this.user = this.API.userData;
      };
      reader.readAsDataURL(file);
    }
  }

  // uploadProfileImage() {
  //   if (this.selectedFile) {
  //     const formData = new FormData();
  //     formData.append('profile', this.selectedFile, this.selectedFile.name);

  //     this.API.uploadProfileImage(formData).subscribe({
  //       next: (response) => {
  //         console.log('Image uploaded successfully', response);
  //         // Optionally, update the user profile with the response from the server
  //       },
  //       error: (error) => {
  //         console.error('Error uploading image:', error);
  //       }
  //     });
  //   }
  // }

  // saveName() {
  //   const names = this.edited.split(' ');
  //   this.user.firstname = names[0];
  //   this.user.lastname = names[1];
  //   this.showEditPic = false;
  // }

  noProfile() {
    return this.API.noProfile();
  }

  parseDate(date: string) {
    const dateObject = new Date(date);
    return dateObject.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  toggleEditPic() {
    this.showEditPic = !this.showEditPic;
  }
  viewGrades() {
    this.router.navigate(['teacher/grade-list']);
  }
}
