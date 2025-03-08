import { TitleCasePipe } from '@angular/common';
import { Component, effect, inject } from '@angular/core';
import { capitalize } from 'lodash-es';
import { LocationArea, LocationAreaPokemonEncounter, PokemonEncounterVersionDetail, PurpleEncounterDetail, Region } from 'pokeapi-js-wrapper';
import { AccordionModule } from 'primeng/accordion';
import { CardModule } from 'primeng/card';
import { FloatLabel } from 'primeng/floatlabel';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { PokemonEncounterDetails, PokemonLocationArea, PokemonRegionalLocations } from '../../app.beans';
import { getEncounterLevel, getNameFromObject } from '../../app.helpers';
import { PokeApiService } from '../../shared/poke-api.service';

@Component({
  selector: 'app-location-area',
  imports: [AccordionModule, TableModule, CardModule, InputTextModule, FloatLabel, TitleCasePipe],
  templateUrl: './location-area.component.html',
  styleUrl: './location-area.component.scss',
  standalone: true
})
export class LocationAreaComponent {

  regionalLocations: PokemonRegionalLocations[] = [];
  filteredLocations: PokemonRegionalLocations[] = [];

  // DI
  private pokeApi = inject(PokeApiService);

  constructor() {
    effect(() => {
      if (this.pokeApi.locationAreaList().length > 0) {
        let encounterInfo: PokemonEncounterDetails[] = [];
        let pokemonLocationArea: PokemonLocationArea[] = [];
        this.regionalLocations = [];
        this.pokeApi.selectedRegions().forEach((region: Region) => {
          // Region
          this.pokeApi.locationAreaList().filter((area: LocationArea) => {
            area.pokemon_encounters.forEach((encounter: LocationAreaPokemonEncounter) => {
              encounter.version_details.forEach((v: PokemonEncounterVersionDetail) => {
                v.encounter_details.forEach((ed: PurpleEncounterDetail) => {
                  encounterInfo.push({
                    locationName: getNameFromObject(area.names)!,
                    levelString: getEncounterLevel(ed),
                    level: ed.min_level,
                    method: `${capitalize(ed.method.name.replaceAll('-', ' '))}`,
                    pctChance: `${ed.chance}%`,
                    conditionValues: ed.condition_values,
                    pokemonName: encounter.pokemon.name
                  });
                });
              });
            });
            pokemonLocationArea.push({ name: area.names[0].name, encounters: encounterInfo });
            encounterInfo = [];
          });
          this.regionalLocations.push({ region: region.names[0].name, location: pokemonLocationArea });
          pokemonLocationArea = [];
        });
        console.log(this.regionalLocations);
        this.filteredLocations = this.regionalLocations;
      }
    });
  }

  onFilterPokemon(filterValue: string): void {
    this.filteredLocations = this.regionalLocations.map(x => {
      return {
        ...x,
        location: x.location.map(l => {
          return {
            ...l,
            encounters: l.encounters.filter(e => e.pokemonName?.includes(filterValue))
          };
        }).filter(l => l.encounters.length > 0)
      }
    });
  }
}
