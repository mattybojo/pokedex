import { Component, effect, inject } from '@angular/core';
import { Machine } from 'pokeapi-js-wrapper';
import { PanelModule } from 'primeng/panel';
import { MoveDetail } from '../../../app.beans';
import { getIdFromUrl } from '../../../app.helpers';
import { PokeApiService } from '../../../shared/poke-api.service';
import { PokemonMoveComponent } from './pokemon-move/pokemon-move.component';

@Component({
  selector: 'pokemon-learned-moves',
  imports: [PanelModule, PokemonMoveComponent],
  templateUrl: './pokemon-learned-moves.component.html',
  styleUrl: './pokemon-learned-moves.component.scss',
  standalone: true
})
export class PokemonLearnedMovesComponent {
  tms: MoveDetail[] = [];
  hms: MoveDetail[] = [];
  levelupMoves: MoveDetail[] = [];
  tutorMoves: MoveDetail[] = [];
  eggMoves: MoveDetail[] = [];
  miscMoves: MoveDetail[] = [];

  // DI
  private pokeApi = inject(PokeApiService);

  constructor() {
    effect(async () => {
      if (this.pokeApi.learnedMoves().length > 0 && this.pokeApi.selectedVersionGroup()) {
        let machine: Machine;

        this.tms = [];
        this.hms = [];
        this.levelupMoves = [];
        this.tutorMoves = [];
        this.eggMoves = [];
        this.miscMoves = [];

        for (const move of this.pokeApi.learnedMoves()) {
          for (const detail of move.detail) {
            switch (detail.move_learn_method.name) {
              case 'level-up':
                this.levelupMoves.push({ move: move.move, detail: [detail] });
                break;
              case 'egg':
                this.eggMoves.push({ move: move.move, detail: [detail] });
                break;
              case 'tutor':
                this.tutorMoves.push({ move: move.move, detail: [detail] });
                break;
              case 'machine':
                // Check if TM or HM and assign accordingly
                machine = await this.pokeApi.getMachineDetails(getIdFromUrl(move.move.machines.find(x => x.version_group.name === this.pokeApi.selectedVersionGroup()!.name)!.machine.url)!);
                if (machine.item.name.includes('tm')) {
                  this.tms.push({ move: move.move, detail: [detail], machineNumber: machine.item.name.toUpperCase() });
                } else {
                  this.hms.push({ move: move.move, detail: [detail], machineNumber: machine.item.name.toUpperCase() });
                }
                break;
              case 'stadium-surfing-pikachu':
              case 'light-ball-egg':
              case 'colosseum-purification':
              case 'xd-purification':
              case 'xd-shadow':
              case 'form-change':
              case 'zygarde-cube':
                this.miscMoves.push({ move: move.move, detail: [detail] });
                break;
              default:
                console.log('Unknown move learn method.');
            }
          };
        };

        this.tms.sort(this.machineComparator);
        this.hms.sort(this.machineComparator);
        this.levelupMoves.sort(this.levelupComparator);
      }
    });
  }

  private machineComparator(a: MoveDetail, b: MoveDetail): number {
    return a.machineNumber!.localeCompare(b.machineNumber!);
  }

  private levelupComparator(a: MoveDetail, b: MoveDetail): number {
    return a.detail[0].level_learned_at - b.detail[0].level_learned_at;
  }
}
