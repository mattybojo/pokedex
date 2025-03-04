import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PokemonListEntryComponent } from './pokemon-list-entry.component';

describe('PokemonListEntryComponent', () => {
  let component: PokemonListEntryComponent;
  let fixture: ComponentFixture<PokemonListEntryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PokemonListEntryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PokemonListEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
