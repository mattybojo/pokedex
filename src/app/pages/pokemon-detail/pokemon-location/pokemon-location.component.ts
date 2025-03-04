import { capitalize } from 'lodash-es';
import { Component, effect, inject } from '@angular/core';
import { FluffyEncounterDetail, LocationArea } from 'pokeapi-js-wrapper';
import { PanelModule } from 'primeng/panel';
import { TableModule } from 'primeng/table';
import { PokemonEncounterLocation } from '../../../app.beans';
import { getIdFromUrl, getNameFromObject } from '../../../app.helpers';
import { PokeApiService } from '../../../shared/poke-api.service';

@Component({
  selector: 'pokemon-location',
  imports: [PanelModule, TableModule],
  templateUrl: './pokemon-location.component.html',
  styleUrl: './pokemon-location.component.scss',
  standalone: true
})
export class PokemonLocationComponent {

  encounterInfo: PokemonEncounterLocation[] = [];

  // DI
  private pokeApi = inject(PokeApiService);

  constructor() {
    effect(() => {
      if (this.pokeApi.encounterLocations().length > 0) {
        // Get location area information
        for (const encounter of this.pokeApi.encounterLocations()) {
          this.encounterInfo = [];
          this.pokeApi.getEncounterLocationArea(getIdFromUrl(encounter.location_area.url)!).then((area: LocationArea) => {
            encounter.version_details.forEach(v => {
              v.encounter_details.forEach(ed => {
                this.encounterInfo.push({
                  locationName: getNameFromObject(area.names)!,
                  levelString: this.getEncounterLevel(ed),
                  level: ed.min_level,
                  method: `${capitalize(ed.method.name.replaceAll('-', ' '))}`,
                  pctChance: `${ed.chance}%`,
                  conditionValues: ed.condition_values
                });
              });
            });
          });
        };
      }
    });
  }

  private getEncounterLevel(encounter: FluffyEncounterDetail): string {
    if (encounter.min_level === encounter.max_level) {
      return `Level ${encounter.min_level}`
    } else {
      return `Level ${encounter.min_level} - ${encounter.max_level}`
    }
  }
}
