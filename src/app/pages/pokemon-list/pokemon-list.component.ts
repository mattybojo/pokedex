import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PokemonInfo } from '../../app.beans';
import { PokeApiService } from '../../shared/poke-api.service';
import { PokemonListEntryComponent } from './pokemon-list-entry/pokemon-list-entry.component';

@Component({
  selector: 'app-pokemon-list',
  imports: [SelectModule, CardModule, ChipModule, FloatLabel, InputTextModule, FormsModule, PokemonListEntryComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
  standalone: true
})
export class PokemonListComponent {

  filteredPokemonList: PokemonInfo[] = [];

  filterValue: string = '';

  // DI
  public pokeApi = inject(PokeApiService);

  constructor() {
    effect(() => {
      if (this.pokeApi.pokemonList().length > 0) {
        this.filteredPokemonList = this.pokeApi.pokemonList();
        this.filterValue = '';
      }
    });
  }

  onFilterPokemon(): void {
    this.filteredPokemonList = this.pokeApi.pokemonList().filter(x => x.details.name.includes(this.filterValue.toLowerCase()) || x.details.types.filter(t => t.type.name.includes(this.filterValue)).length > 0);
  }
}
