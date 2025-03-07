import { DecimalPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { PokemonInfo } from '../../../app.beans';
import { PokeApiService } from '../../../shared/poke-api.service';

@Component({
  selector: 'pokemon-list-entry',
  imports: [CardModule, ChipModule, DecimalPipe],
  templateUrl: './pokemon-list-entry.component.html',
  styleUrl: './pokemon-list-entry.component.scss',
  standalone: true
})
export class PokemonListEntryComponent {

  @Input() pokemon!: PokemonInfo;

  // DI
  private pokeApi = inject(PokeApiService);
  private router = inject(Router);

  constructor() { }

  loadPokemonDetail(pokemon: PokemonInfo): void {
    this.pokeApi.selectedPokemon.set(pokemon);
    this.router.navigate(['pokemon', this.pokemon.species.pokedex_numbers[0].entry_number]);
  }
}
