import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { SelectModule } from 'primeng/select';
import { PokeApiService } from '../../shared/poke-api.service';
import { PokemonListEntryComponent } from './pokemon-list-entry/pokemon-list-entry.component';

@Component({
  selector: 'app-pokemon-list',
  imports: [SelectModule, CardModule, ChipModule, FormsModule, PokemonListEntryComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
  standalone: true
})
export class PokemonListComponent {

  // DI
  public pokeApi = inject(PokeApiService);

  constructor() { }
}
