import { effect, Injectable, signal } from '@angular/core';
import { flatten, isArray, map } from 'lodash-es';
import { EvolutionChain, Item, LocationArea, Machine, Move, NamedAPIResourceList, Pokedex, PokedexObject, PokemonEncounter, PokemonEncounterVersionDetailObject, PokemonSpecies, Type, Version, VersionGroup, VersionGroupDetail } from 'pokeapi-js-wrapper';
import { environment } from '../../environments/environment';
import { MoveDetail, PokemonInfo } from '../app.beans';
import { getIdFromUrl, sleep } from './../app.helpers';

@Injectable({
  providedIn: 'root'
})
export class PokeApiService {

  private PokeApi: Pokedex;

  public versionList = signal<Version[]>([]);
  public selectedVersion = signal<Version | null>(null)
  public selectedVersionGroup = signal<VersionGroup | null>(null);
  public pokedexList = signal<PokedexObject[]>([]);
  public pokemonList = signal<PokemonInfo[]>([]);

  // Selected Pokemon information
  public selectedPokemon = signal<PokemonInfo | null>(null);
  public evolutionChain = signal<EvolutionChain | null>(null);
  public encounterLocations = signal<PokemonEncounter[]>([]);
  public learnedMoves = signal<MoveDetail[]>([]);

  constructor() {
    this.PokeApi = new Pokedex({
      cache: true,
      // cacheImages: true
    });

    // Get the version group
    effect(() => {
      if (this.selectedVersion()) {
        this.getVersionGroup(getIdFromUrl(this.selectedVersion()!.version_group.url)!);
      }
    });

    // Get the pokedex
    effect(() => {
      if (this.selectedVersionGroup()) {
        this.getPokedex(map(this.selectedVersionGroup()?.pokedexes, 'url').map(url => getIdFromUrl(url)!));
      }
    });

    // Get the details of each pokemon in the pokedex
    effect(() => {
      if (this.pokedexList().length > 0) {
        // TODO: Does not support multiple pokedexes yet (see Ultra Moon)
        this.getPokemonInfo(this.pokedexList()[0].pokemon_entries.map(x => getIdFromUrl(x.pokemon_species.url)!))
      }
    });

    effect(() => {
      if (this.selectedPokemon()) {
        this.getEvolutionChain(getIdFromUrl(this.selectedPokemon()!.species.evolution_chain.url)!);
        this.getEncounterLocations(getIdFromUrl(this.selectedPokemon()!.details.location_area_encounters)!);
        this.getLearnedMoves();
      }
    });
  }

  getVersionList(): void {
    this.PokeApi.getVersionsList().then((versions: NamedAPIResourceList) => {
      // Get version details
      this.PokeApi.getVersionByName(versions.results.map(v => getIdFromUrl(v.url)!)).then(vd => {
        this.versionList.set(vd);
        if (!environment.production) {
          this.selectedVersion.set(vd[0]);
        }
      });
    });
  }

  getVersionDetails(name: string[] | number[]): void {
    this.PokeApi.getVersionByName(name)
  }

  getVersionGroup(name: string | number): void {
    this.PokeApi.getVersionGroupByName(name).then(vg => this.selectedVersionGroup.set(vg));
  }

  getPokedex(name: string | number | string[] | number[]): void {
    if (isArray(name) && name.length > 1) {
      const promises: Promise<PokedexObject>[] = name.map(x => this.PokeApi.getPokedexByName(x));
      Promise.all(promises).then((pd: PokedexObject[]) => {
        this.pokedexList.set(pd);
      });
    } else {
      this.PokeApi.getPokedexByName(isArray(name) ? name[0] : name).then(pd => this.pokedexList.set([pd]));
    }
  }

  getPokemonInfo(name: string[] | number[]): void {
    const promises: Promise<any>[] = [];
    promises.push(this.PokeApi.getPokemonSpeciesByName(name));
    promises.push(this.PokeApi.getPokemonByName(name));
    Promise.all(promises).then((resp) => {
      this.pokemonList.set(resp[0].map((ps: PokemonSpecies, i: number) => {
        return { details: resp[1][i], species: ps };
      }));
    });
  }

  getEvolutionChain(name: number): void {
    this.PokeApi.getEvolutionChainById(name).then(ec => this.evolutionChain.set(ec));
  }

  getEncounterLocations(name: string | number): void {
    this.PokeApi.getPokemonEncounterAreasByName(name).then(pe => {
      let versionName: string = this.selectedVersion()!.name;
      let filteredDetails: PokemonEncounterVersionDetailObject[];
      this.encounterLocations.set(
        pe.filter((x, i) => {
          filteredDetails = x.version_details.filter(vd => vd.version.name === versionName);
          if (filteredDetails.length > 0) {
            pe[i].version_details = filteredDetails;
            return true;
          } else {
            return false;
          }
        }));
    });
  }

  getLearnedMoves(): void {
    let vgdResult: VersionGroupDetail[][] = [];
    let vgd: VersionGroupDetail[] = [];
    this.PokeApi.getMoveByName(this.selectedPokemon()!.details.moves.filter(x => {
      vgd = x.version_group_details.filter(vgd => vgd.version_group.name === this.selectedVersionGroup()!.name);
      if (vgd.length > 0) {
        vgdResult.push(vgd);
      }
      return vgd.length > 0
    }).map(x => {
      return getIdFromUrl(x.move.url)!;
    }))
      .then(m => this.learnedMoves.set(m.map((x, i) => ({ move: x, detail: vgdResult[i] }))));
  }

  getEncounterLocationArea(name: string | number): Promise<LocationArea> {
    return this.PokeApi.getLocationAreaByName(name);
  }

  async getEvolutionSpecies(name: string | number): Promise<PokemonSpecies> {
    return this.PokeApi.getPokemonSpeciesByName(name);
  }

  async getEvolutionItem(name: string | number): Promise<Item> {
    return this.PokeApi.getItemByName(name);
  }

  async getMachineDetails(name: number) {
    return this.PokeApi.getMachineById(name);
  }

  async getVersionGroupDetails(name: string | number): Promise<VersionGroup> {
    return this.PokeApi.getVersionGroupByName(name);
  }

  getPokemonTypeDetails(name: string[] | number[]): Promise<Type[]> {
    return this.PokeApi.getTypeByName(name);
  }
}
