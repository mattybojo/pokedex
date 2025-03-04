import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonLearnedMovesComponent } from './pokemon-learned-moves.component';

describe('PokemonLearnedMovesComponent', () => {
  let component: PokemonLearnedMovesComponent;
  let fixture: ComponentFixture<PokemonLearnedMovesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonLearnedMovesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonLearnedMovesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
