import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageModule } from 'primeng/image';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { PokeApiService } from '../../shared/poke-api.service';
import { PokemonEvolutionComponent } from './pokemon-evolution/pokemon-evolution.component';
import { PokemonLearnedMovesComponent } from "./pokemon-learned-moves/pokemon-learned-moves.component";
import { PokemonLocationComponent } from "./pokemon-location/pokemon-location.component";
import { PokemonTypeComponent } from './pokemon-type/pokemon-type.component';
import { PokemonInfo } from '../../app.beans';

@Component({
  selector: 'app-pokemon-detail',
  imports: [PanelModule, ImageModule, TooltipModule, CommonModule, PokemonEvolutionComponent, PokemonLocationComponent, PokemonLearnedMovesComponent, PokemonTypeComponent],
  templateUrl: './pokemon-detail.component.html',
  styleUrl: './pokemon-detail.component.scss',
  standalone: true
})
export class PokemonDetailComponent implements OnDestroy {

  imageSize: string = '50';
  pokemonId: number;
  pokemon!: PokemonInfo;

  // DI
  public pokeApi = inject(PokeApiService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.pokemonId = this.route.snapshot.params['id'];
    effect(() => {
      if (this.pokeApi.pokemonList().length > 0 && !this.pokeApi.selectedPokemon()) {
        this.pokeApi.selectedPokemon.set(this.pokeApi.pokemonList()[this.pokemonId - 1]);
      }
    });

    effect(() => {
      if (this.pokeApi.selectedPokemon()) {
        this.pokemon = this.pokeApi.selectedPokemon()!;
        console.log(this.pokemon);
      }
    });
  }

  ngOnDestroy(): void {
    // Reset all signals when leaving this page
    this.pokeApi.selectedPokemon.set(null);
    this.pokeApi.evolutionChain.set(null);
    this.pokeApi.encounterLocations.set([]);
    this.pokeApi.learnedMoves.set([]);
  }
}
