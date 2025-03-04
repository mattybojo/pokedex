import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImageModule } from 'primeng/image';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { getCurrentGenerationPokemonType } from '../../app.helpers';
import { PokeApiService } from '../../shared/poke-api.service';
import { PokemonEvolutionComponent } from './pokemon-evolution/pokemon-evolution.component';
import { PokemonLearnedMovesComponent } from "./pokemon-learned-moves/pokemon-learned-moves.component";
import { PokemonLocationComponent } from "./pokemon-location/pokemon-location.component";
import { PokemonTypeComponent } from './pokemon-type/pokemon-type.component';

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

  pokemonTypes: string[] = [];

  // DI
  public pokeApi = inject(PokeApiService);
  private route = inject(ActivatedRoute);

  constructor() {
    this.pokemonId = this.route.snapshot.params['id'];
    effect(() => {
      if (this.pokeApi.pokemonList().length > 0 && !this.pokeApi.selectedPokemon()) {
        this.pokeApi.selectedPokemon.set(this.pokeApi.pokemonList()[this.pokemonId - 1]);
        console.log(this.pokeApi.selectedPokemon());
      }
    });

    effect(() => {
      if (this.pokeApi.selectedPokemon()) {
        this.pokemonTypes = getCurrentGenerationPokemonType(this.pokeApi.selectedPokemon()!, this.pokeApi.selectedVersionGroup()!.generation.name);
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
