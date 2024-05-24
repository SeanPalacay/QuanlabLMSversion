import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import { UtilityService } from './utility.service';

@Injectable({
  providedIn: 'root',
})
export class ComputerService {
  constructor(
    private userService: UserService,
    private utilityService: UtilityService
  ) {}

  changeLocalAddress(ip_addr: string) {
    const postObject = {
      tables: 'admin_options',
      values: {
        Value: ip_addr,
      },
      conditions: {
        WHERE: {
          Type: 'local_server',
        },
      },
    };
    return this.utilityService.post('update_entry', {
      data: JSON.stringify(postObject),
    });
  }

  async changePCAddress(speechLabId: string, pc: any) {
    if (pc.id != null) {
      const postObject = {
        tables: 'speech_lab_computers',
        values: {
          Address: pc.ip,
        },
        conditions: {
          WHERE: {
            ID: pc.id,
          },
        },
      };
      console.log(postObject);
      const obs$ = this.utilityService
        .post('update_entry', {
          data: JSON.stringify(postObject),
        })
        .subscribe(() => {
          obs$.unsubscribe();
        });
    } else {
      const postObject = {
        tables: 'speech_lab_computers',
        values: {
          Address: pc.ip,
          LabID: speechLabId,
          Name: pc.label,
          ID: this.utilityService.createID32(),
        },
      };
      console.log(postObject);
      const obs$ = this.utilityService
        .post('create_entry', {
          data: JSON.stringify(postObject),
        })
        .subscribe(() => {
          obs$.unsubscribe();
        });
    }
  }

  loadComputerAddresses() {
    const postObject = {
      selectors: ['*'],
      tables: 'speech_lab_computers',
    };
    return this.utilityService.post('get_entries', {
      data: JSON.stringify(postObject),
    });
  }

  async loadComputers() {
    var row1: any[] = [];
    var row2: any[] = [];
    var row3: any[] = [];
    let pcIndex = 1;
    for (let i = 0; i < 8; i++) {
      row3.push({
        id: null,
        label: `PC-${pcIndex}`,
        ip: '',
        icon: 'assets/monitor.png',
      });
      pcIndex += 1;
    }
    for (let i = 0; i < 9; i++) {
      row2.push({
        id: null,
        label: `PC-${pcIndex}`,
        ip: '',
        icon: 'assets/monitor.png',
      });
      pcIndex += 1;
    }
    for (let i = 0; i < 8; i++) {
      row1.push({
        id: null,
        label: `PC-${pcIndex}`,
        ip: '',
        icon: 'assets/monitor.png',
      });
      pcIndex += 1;
    }
    return [row1, row2, row3];
  }
}
