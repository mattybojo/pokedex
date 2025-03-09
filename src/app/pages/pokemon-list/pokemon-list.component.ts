import { Component, effect, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { FloatLabel } from 'primeng/floatlabel';
import { ImageModule } from 'primeng/image';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { PokemonInfo } from '../../app.beans';
import { PokeApiService } from '../../shared/poke-api.service';
import { PokemonListEntryComponent } from './pokemon-list-entry/pokemon-list-entry.component';
import { CommonModule } from '@angular/common';
import { isEmpty, isEqual, isEqualWith } from 'lodash-es';

@Component({
  selector: 'app-pokemon-list',
  imports: [SelectModule, CardModule, ChipModule, FloatLabel, InputTextModule, SelectModule, ImageModule, FormsModule, CommonModule, PokemonListEntryComponent],
  templateUrl: './pokemon-list.component.html',
  styleUrl: './pokemon-list.component.scss',
  standalone: true
})
export class PokemonListComponent {

  filteredPokemonList: PokemonInfo[] = [];

  nameFilterValue: string = '';
  typeFilterValue: [string | null, string | null] = [null, null];

  imageSize: string = '25';

  // DI
  public pokeApi = inject(PokeApiService);

  constructor() {
    effect(() => {
      if (this.pokeApi.pokemonList().length > 0) {
        this.filteredPokemonList = this.pokeApi.pokemonList();
        this.nameFilterValue = '';
      }
    });
  }

  onFilterPokemon(): void {
    let filterTypes: string[] = [];
    // Make sure to set type 2 as null if type 1 is removed
    if (!this.typeFilterValue[0]) {
      this.typeFilterValue[1] = null;
    }
    // Create the types array that will be used for comparison
    this.typeFilterValue.forEach(x => x && x.length > 0 ? filterTypes.push(x) : null);
    this.filteredPokemonList = this.pokeApi.pokemonList().filter(x => !isEmpty(this.nameFilterValue) ? x.details.name.includes(this.nameFilterValue.toLowerCase()) : true).filter(x => {
      let pokeTypes = x.details.types.map(t => t.type.name);
      // Compare the types arrays while ignoring order of types
      return filterTypes.length === 0 ? true : isEqualWith(pokeTypes, filterTypes, this.pokemonTypesComparator);
    });
  }

  private pokemonTypesComparator(a: string[], b: string[]) {
    return b.length === 1 ? a.includes(b[0]) : isEqual(a, b) || isEqual(a, [b[1], b[0]]);
  }
}
