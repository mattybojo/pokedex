import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleMinus, faCirclePlus, faCircleXmark } from '@fortawesome/free-solid-svg-icons';
import { orderBy } from 'lodash-es';
import { NamedAPIResource, TypeDamageRelations } from 'pokeapi-js-wrapper';
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
  @Input() pokemonTypes: string[] = [];

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
    let typeDmgRelations: TypeDamageRelations;
    let dmgRelations: TypeDamageRelations;
    let typeMatchups: DamageTypeMultiplier[] = [];
    this.pokeApi.getPokemonTypeDetails(this.pokemonTypes).then(types => {
      const currentGenNum: number = romanToInt(getGenerationNumber(this.pokeApi.selectedVersionGroup()!.generation.name));
      types.forEach(type => {
        // Check for past types here
        typeDmgRelations = type.damage_relations;
        for (let i = 0; i < type.past_damage_relations.length; i++) {
          if (currentGenNum <= romanToInt(getGenerationNumber(type.past_damage_relations[i].generation.name))) {
            typeDmgRelations = type.past_damage_relations[i].damage_relations;
            break;
          }
        }

        if (!dmgRelations) {
          dmgRelations = typeDmgRelations;
        } else {
          Object.keys(typeDmgRelations).forEach(key => dmgRelations![key].push(...typeDmgRelations[key]));
        }
      });

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
