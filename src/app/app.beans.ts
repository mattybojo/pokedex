import { Move, NamedAPIResource, Pokemon, PokemonSpecies, VersionGroupDetail } from 'pokeapi-js-wrapper';

export interface VersionLookup {
  key: string;
  value: string;
}

export interface PokemonInfo {
  details: Pokemon;
  species: PokemonSpecies;
}

export interface PokemonEncounterDetails {
  locationName: string;
  method: string;
  pctChance: string;
  levelString: string;
  level: number;
  conditionValues: NamedAPIResource[];
  pokemonName?: string;
}

export interface MoveDetail {
  move: Move;
  detail: VersionGroupDetail[];
  machineNumber?: string;
}

export interface EvolutionChain {
  pokemon: string;
  evolution: EvolutionChain[];
}

export interface DamageTypeMultiplier {
  type: string;
  multiplier: DamageMultiplier;
}

export type DamageMultiplier = 4 | 2 | 0 | 0.5 | 0.25;

export interface PokemonRegionalLocations {
  region: string;
  location: PokemonLocationArea[];
}

export interface PokemonLocationArea {
  name: string;
  encounters: PokemonEncounterDetails[];
}
