import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleMinus, faCirclePlus, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { isEmpty, orderBy } from 'lodash-es';
import { NamedAPIResource, PokemonType, TypeDamageRelations } from 'pokeapi-js-wrapper';
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { ImageModule } from 'primeng/image';
import { PanelModule } from 'primeng/panel';
import { TooltipModule } from 'primeng/tooltip';
import { DamageMultiplier, DamageTypeMultiplier } from '../../../app.beans';
import { getGenerationNumber, romanToInt } from '../../../app.helpers';
import { PokeApiService } from '../../../shared/poke-api.service';

@Component({
  selector: 'pokemon-type',
  imports: [PanelModule, ButtonModule, ImageModule, BadgeModule, TooltipModule, FontAwesomeModule, CommonModule],
  templateUrl: './pokemon-type.component.html',
  styleUrl: './pokemon-type.component.scss',
  standalone: true
})
export class PokemonTypeComponent implements OnInit {
  @Input() pokemonTypes: PokemonType[] = [];

  weaknesses: DamageTypeMultiplier[] = [];
  resistances: DamageTypeMultiplier[] = [];
  immunities: DamageTypeMultiplier[] = [];

  imageSize: string = '30';

  // DI
  private pokeApi = inject(PokeApiService);

  // Icons
  faCircleMinus = faCircleMinus;
  faCirclePlus = faCirclePlus;
  faCircleXmark = faCircleXmark;

  constructor() { }

  ngOnInit(): void {
    let dmgRelations: TypeDamageRelations;
    let typeMatchups: DamageTypeMultiplier[] = [];
    this.pokeApi.getPokemonTypeDetails(this.pokemonTypes).then(types => {
      dmgRelations = types[0].damage_relations;

      if (types.length > 1 && !isEmpty(types[1])) {
        Object.keys(dmgRelations).forEach(key => dmgRelations![key].push(...types[1].damage_relations[key]));
      }

      typeMatchups = this.calculateTypeMatchup(dmgRelations.double_damage_from, 2, typeMatchups);
      typeMatchups = this.calculateTypeMatchup(dmgRelations.half_damage_from, 0.5, typeMatchups);
      typeMatchups = this.calculateTypeMatchup(dmgRelations.no_damage_from, 0, typeMatchups);

      this.weaknesses = orderBy(typeMatchups.filter(t => [2, 4].includes(t.multiplier)), 'multiplier', 'desc');
      this.resistances = orderBy(typeMatchups.filter(t => [0.5, 0.25].includes(t.multiplier)), 'multiplier', 'asc');
      this.immunities = typeMatchups.filter(t => t.multiplier === 0);
    });
  }

  private calculateTypeMatchup(types: NamedAPIResource[], multiplier: DamageMultiplier, typeMatchups: DamageTypeMultiplier[]): DamageTypeMultiplier[] {
    let foundIndex: number;
    let newTypeMatchups: DamageTypeMultiplier[] = [...typeMatchups];
    types.forEach(type => {
      foundIndex = newTypeMatchups.findIndex(x => x.type === type.name);
      if (foundIndex > -1) {
        newTypeMatchups[foundIndex] = { ...newTypeMatchups[foundIndex], multiplier: newTypeMatchups[foundIndex].multiplier * multiplier as DamageMultiplier }
      } else {
        newTypeMatchups.push({ type: type.name, multiplier: multiplier });
      }
    });

    return newTypeMatchups;
  }
}
