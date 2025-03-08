import { Routes } from '@angular/router';
import { LocationAreaComponent } from './pages/location-area/location-area.component';
import { PokemonDetailComponent } from './pages/pokemon-detail/pokemon-detail.component';
import { PokemonListComponent } from './pages/pokemon-list/pokemon-list.component';

export const routes: Routes = [{
  path: '',
  component: PokemonListComponent
}, {
  path: 'pokemon/:id',
  component: PokemonDetailComponent
}, {
  path: 'locations',
  component: LocationAreaComponent
}];
