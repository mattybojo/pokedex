import { DecimalPipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ChipModule } from 'primeng/chip';
import { PokemonInfo } from '../../../app.beans';
import { getCurrentGenerationPokemonType } from '../../../app.helpers';
import { PokeApiService } from '../../../shared/poke-api.service';

@Component({
  selector: 'pokemon-list-entry',
  imports: [CardModule, ChipModule, DecimalPipe],
  templateUrl: './pokemon-list-entry.component.html',
  styleUrl: './pokemon-list-entry.component.scss',
  standalone: true
})
export class PokemonListEntryComponent implements OnInit {

  @Input() pokemon!: PokemonInfo;

  pokemonId?: number;

  pokemonTypes: string[] = [];

  // DI
  private pokeApi = inject(PokeApiService);
  private router = inject(Router);

  constructor() { }

  ngOnInit(): void {
    let pokedexName = this.pokeApi.pokedexList()[0].name;
    this.pokemonId = this.pokemon.species.pokedex_numbers.find(x => x.pokedex.name === pokedexName)?.entry_number;
    this.pokemonTypes = getCurrentGenerationPokemonType(this.pokemon, this.pokeApi.selectedVersionGroup()!.generation.name);
  }

  loadPokemonDetail(pokemon: PokemonInfo): void {
    this.pokeApi.selectedPokemon.set(pokemon);
    this.router.navigate(['pokemon', this.pokemonId]);
  }
}
