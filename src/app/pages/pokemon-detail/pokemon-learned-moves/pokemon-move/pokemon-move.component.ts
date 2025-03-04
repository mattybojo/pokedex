import { UpperCasePipe } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { MoveFlavorTextEntry, VersionGroup } from 'pokeapi-js-wrapper';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MoveDetail } from '../../../../app.beans';
import { getGenerationNumber, getIdFromUrl, getNameFromObject, pastValuesComparator, romanToInt } from '../../../../app.helpers';
import { PokeApiService } from '../../../../shared/poke-api.service';

@Component({
  selector: 'pokemon-move',
  imports: [CardModule, TooltipModule, UpperCasePipe],
  templateUrl: './pokemon-move.component.html',
  styleUrl: './pokemon-move.component.scss',
  standalone: true
})
export class PokemonMoveComponent implements OnInit {
  @Input() move!: MoveDetail;

  moveName: string = '';
  flavorText: MoveFlavorTextEntry[] | undefined;
  learnedLevel: number | undefined;

  movePower?: number;
  moveAccuracy?: number;
  movePp?: number;
  moveType?: string;

  // DI
  private pokeApi = inject(PokeApiService);

  async ngOnInit(): Promise<void> {
    this.flavorText = this.move.move.flavor_text_entries.filter(x => x.version_group.name === this.pokeApi.selectedVersionGroup()!.name && x.language.name === 'en');
    if (!this.flavorText) {
      this.move.move.flavor_text_entries.filter(x => x.language.name === 'en');
    }
    this.moveName = getNameFromObject(this.move.move.names);

    this.pokeApi.selectedPokemon()?.details.moves[0].version_group_details

    if (this.move.detail && this.move.detail.length > 0) {
      this.learnedLevel = this.move.detail.find(x => x.version_group.name === this.pokeApi.selectedVersionGroup()!.name)?.level_learned_at;
    }

    this.movePower = this.move.move.power ? this.move.move.power : undefined;
    this.moveAccuracy = this.move.move.accuracy ? this.move.move.accuracy : undefined;
    this.movePp = this.move.move.pp ? this.move.move.pp : undefined;
    this.moveType = this.move.move.type.name ? this.move.move.type.name : undefined;

    // Sort past values array by generation using comparator
    this.move.move.past_values.sort(pastValuesComparator);
    const pastValuesArr = this.move.move.past_values;
    // Convert roman numeral of generation to number for future comparison
    const currentGenNum: number = romanToInt(getGenerationNumber(this.pokeApi.selectedVersionGroup()!.generation.name));
    let newVersionGroup: VersionGroup
    for (let i = 0; i < pastValuesArr.length; i++) {
      // Get the version group of this past value
      newVersionGroup = await this.pokeApi.getVersionGroupDetails(getIdFromUrl(pastValuesArr[i].version_group.url)!);
      // Check if the currently selected generation is before the pastValues generation
      // If the currently selected version groups' generation is before the pastValues generation, use those values to update the move's details
      if (currentGenNum < romanToInt(getGenerationNumber(newVersionGroup.generation.name))) {
        this.movePower = pastValuesArr[i].power != null ? pastValuesArr[i].power! : this.movePower;
        this.moveAccuracy = pastValuesArr[i].accuracy != null ? pastValuesArr[i].accuracy! : this.moveAccuracy;
        this.movePp = pastValuesArr[i].pp != null ? pastValuesArr[i].pp! : this.movePp;
        this.moveType = pastValuesArr[i].type?.name != null ? pastValuesArr[i].type!.name! : this.moveType;
      } else {
        break;
      }
    }
  }
}
