import { environment } from './../../../environments/environment';
import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { VersionLookup } from '../../app.beans';
import { PokeApiService } from '../poke-api.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'header',
  imports: [SelectModule, CommonModule, FormsModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: true
})
export class HeaderComponent implements AfterViewInit {

  versionList: VersionLookup[] = [];
  selectedVersion: VersionLookup | undefined;

  // DI
  private pokeApi = inject(PokeApiService);

  constructor() {
    let foundIndex: number | undefined;
    effect(() => {
      this.versionList = this.pokeApi.versionList().map(v => {
        foundIndex = v.names.findIndex(n => n.language.name === 'en');
        if (foundIndex) {
          return { key: v.name, value: v.names[foundIndex].name };
        } else {
          return { key: v.name, value: v.name };
        }
      });
      console.log(this.versionList);
    });
  }
  ngAfterViewInit(): void {
    if (this.pokeApi.selectedVersion()) {
      this.selectedVersion = this.versionList.find(x => x.key === this.pokeApi.selectedVersion()?.name)!;
    }
  }

  setVersion(e: SelectChangeEvent): void {
    this.pokeApi.selectedVersion.set(this.pokeApi.versionList().find(v => v.name === e.value)!);
  }
}
