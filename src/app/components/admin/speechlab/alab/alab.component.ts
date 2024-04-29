import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Subscription } from 'rxjs';
import { APIService } from 'src/app/services/API/api.service';

@Component({
  selector: 'app-alab',
  templateUrl: './alab.component.html',
  styleUrls: ['./alab.component.css']
})
export class AlabComponent implements OnInit {
  constructor(private API:APIService){}
  row1:any[] = []
  row2:any[] = []
  row3:any[] = [];
  students:any[]= [];
  speechLabs:any[] = []
  speechLabSelected:number = 0;

  

  async ngOnInit() {
    [this.row1,this.row2, this.row3]= await this.API.loadComputers();
    this.loadStudents();
    this.loadLabs();
  }
  loadStudents(){
    const obs$ = this.API.getStudents().subscribe((data) => {
      if (data.success) {
        this.students = data.output;
      } else {
        this.API.failedSnackbar('Unable to load student data');
      }
      obs$.unsubscribe();
    });
  }

  loadLabs(){
    this.API.showLoader();
    const obs$ = this.API.loadSpeechLabs().subscribe(data=>{
      if(data.success){
        this.speechLabs = data.output;
      }
      this.loadAssignedAddresses();
      obs$.unsubscribe();
    })  
  }

  selectLab(index:number){
    this.speechLabSelected = index;
    this.loadAssignedAddresses();
  }

  loadedAddresses:Map<string,any>= new Map();

  loadAssignedAddresses(){
    if(this.speechLabs.length > 0){
      const obs$ = this.API.loadComputerAddresses().subscribe(data=>{
        if(data.success){
          const assignMap = new Map<string,any>( data.output.filter((e:any)=>e.labid == this.speechLabs[this.speechLabSelected].id).map((entry:any)=> [entry.name, entry]))
          this.loadedAddresses = new Map<string,any>( data.output.map((entry:any)=> [entry.address, entry]))

          for(let pc of [...this.row1, ...this.row2, ...this.row3]){
            pc.ip = assignMap.get(pc.label)?.address ?? '';
            pc.id = assignMap.get(pc.label)?.id ?? null;
          }
        }
        this.API.hideLoader();
        obs$.unsubscribe();
      })  
    }else{
      this.API.showLoader();
      this.API.failedSnackbar('Failed loading speechlabs')
    }
   
  }


  @Output() valueChanged = new EventEmitter<boolean>();
  value: boolean = false;

  checkIfAssigned(student:any){
    const pcs = [...this.row1, ...this.row2, ...this.row3];
    const found = pcs.find((pc)=> pc.ip == student.visibleid);
    return found;
  }

  checkIfAssignedOnOtherLab(student:string){
    const address = this.loadedAddresses.get(student);
    if(address && this.speechLabs.length){
      if(address.labid != this.speechLabs[this.speechLabSelected].id){
        return address;
      }
    }else{
      return false;
    }
  }

  getAssignedName(pc:any){
    const student = this.students.find((student)=> student.visibleid == pc.ip);
    if(student){
      return `${student.firstname} ${student.lastname}`;
    }else{
      return 'None'
    }
  }

  getLabFromID(id:string){
    return this.speechLabs.find((lab)=>lab.id == id)
  }

  toggleValue() {
    this.value = !this.value;
    this.valueChanged.emit(this.value);
  }

  checkDuplicate(studentId:string, pcLabel:any){
    const pcs = [...this.row1, ...this.row2, ...this.row3];
    const found = pcs.find((pc)=> pc.ip == studentId && pc.label != pcLabel);
    return found;
  }

  inputEvent(event:any,pc:any){
    if(event.target.value.trim() == ''){
      return;
    }
    if(this.checkDuplicate(event.target.value.trim().replaceAll('\t','').replaceAll('\n',''), pc.label)){
      this.API.failedSnackbar('Duplicate Assignment!')
      pc.ip='';
      return;
    }
    if(this.checkIfAssignedOnOtherLab(event.target.value.trim().replaceAll('\t','').replaceAll('\n',''))){
      this.API.failedSnackbar(('This student is assigned to another lab!'))
      pc.ip='';
      return;
    }
    pc.ip =  event.target.value.trim().replaceAll('\t','').replaceAll('\n','');
  }

  async save(){
    // check all input is valid
    for(let pc of [...this.row1, ...this.row2, ...this.row3]){
      if(pc.ip.trim() != '' && this.getAssignedName(pc) == 'None' ){
        this.API.failedSnackbar(`${pc.label} contains invalid ID!`);
        return;
      }
    }
  if(this.speechLabs.length>0){
    this.API.justSnackbar('Updating Addresses...', 999999)
     for(let pc of  [...this.row1, ...this.row2, ...this.row3]){
      // if(){
        await this.API.changePCAddress(this.speechLabs[this.speechLabSelected].id, pc )
      // }
     }
     this.API.successSnackbar('Successfully updated addresses!')
     this.loadLabs();
    }else{
      this.API.failedSnackbar('There was an error loading speech labs');
    }
    
  }

  
}
