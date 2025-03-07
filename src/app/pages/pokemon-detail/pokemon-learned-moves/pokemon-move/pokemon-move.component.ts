import { UpperCasePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TooltipModule } from 'primeng/tooltip';
import { MoveDetail } from '../../../../app.beans';

@Component({
  selector: 'pokemon-move',
  imports: [CardModule, TooltipModule, UpperCasePipe],
  templateUrl: './pokemon-move.component.html',
  styleUrl: './pokemon-move.component.scss',
  standalone: true
})
export class PokemonMoveComponent {
  @Input() move!: MoveDetail;
}
