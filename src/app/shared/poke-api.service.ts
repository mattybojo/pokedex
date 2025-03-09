import { effect, inject, Injectable, signal } from '@angular/core';
import { map, startCase } from 'lodash-es';
import { EvolutionChain, Item, Location, LocationArea, LocationAreaName, LocationAreaPokemonEncounter, Move, MoveElement, MoveFlavorTextEntry, NamedAPIResourceList, PastDamageRelation, PastType, PastTypeType, PastValue, Pokedex, PokedexNumber, PokedexObject, PokemonEncounter, PokemonGameIndex, PokemonSpecies, PokemonSpeciesFlavorTextEntry, PokemonType, Region, Type, TypeDamageRelations, Version, VersionGroup, VersionGroupDetail } from 'pokeapi-js-wrapper';
import { environment } from '../../environments/environment';
import { MoveDetail, PokemonInfo, PokemonTypeListItem } from '../app.beans';
import { getGenerationNumber, getIdFromUrl, romanToInt } from './../app.helpers';
import { AppService } from '../app.service';

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
  public pokemonTypesList = signal<PokemonTypeListItem[]>([]);

  // Selected Pokemon information
  public selectedPokemon = signal<PokemonInfo | null>(null);
  public evolutionChain = signal<EvolutionChain | null>(null);
  public encounterLocations = signal<PokemonEncounter[]>([]);
  public learnedMoves = signal<MoveDetail[]>([]);

  // Location area information
  public selectedRegions = signal<Region[]>([]);
  public locationList = signal<Location[]>([]);
  public locationAreaList = signal<LocationArea[]>([]);

  // DI
  public appService = inject(AppService);

  constructor() {
    this.PokeApi = new Pokedex({
      cache: true,
      // cacheImages: true
    });

    // Get the version group
    effect(() => {
      if (this.selectedVersion()) {
        this.appService.isLoading.set(true);
        this.getVersionGroup(getIdFromUrl(this.selectedVersion()!.version_group.url)!);
      }
    });

    // Get the pokedex
    effect(() => {
      if (this.selectedVersionGroup()) {
        this.getTypesList();
        this.getRegions(this.selectedVersionGroup()!.regions.map(x => getIdFromUrl(x.url)!));
      }
    });

    // Get the details of each pokemon in the pokedex
    effect(() => {
      if (this.pokedexList().length > 0) {
        // TODO: Does not support multiple pokedexes yet (see Ultra Moon)
        this.getPokemonInfo(this.pokedexList()[0].pokemon_entries.map(x => getIdFromUrl(x.pokemon_species.url)!))
      }
    });

    // Get the details of the selected pokemon
    effect(() => {
      if (this.selectedPokemon()) {
        this.getEvolutionChain(getIdFromUrl(this.selectedPokemon()!.species.evolution_chain.url)!);
        this.getEncounterLocations(getIdFromUrl(this.selectedPokemon()!.details.location_area_encounters)!);
        this.getLearnedMoves();
      }
    });

    // Get the locations based on the regions in the selected version of the game
    effect(() => {
      if (this.selectedRegions().length > 0) {
        // Get pokedex
        const pokedexNums: number[] = [];
        this.selectedRegions().forEach(r => r.pokedexes.forEach(p => pokedexNums.push(getIdFromUrl(p.url)!)))
        this.getPokedexes(pokedexNums);

        // Get locations
        let locationIds: number[] = [];
        for (const region of this.selectedRegions()) {
          locationIds.push(...region.locations.map(x => getIdFromUrl(x.url)!));
        }
        this.getLocations(locationIds);
      }
    });

    // Get all locations in this game, filter by ones with Pokemon encounters
    effect(() => {
      if (this.locationList().length > 0) {
        let locationAreaIds: number[] = [];
        for (const location of this.locationList()) {
          location.areas.forEach(a => locationAreaIds.push(getIdFromUrl(a.url)!))
        }
        this.getLocationAreas(locationAreaIds);
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

  getVersionGroup(name: string | number): void {
    this.PokeApi.getVersionGroupByName(name).then(vg => this.selectedVersionGroup.set(vg));
  }

  getPokedexes(name: string[] | number[]): void {
    this.PokeApi.getPokedexByName(name).then(x => this.pokedexList.set(this.pokedexFilter(x, this.selectedVersionGroup()!.name).map(p => this.pokedexMapper(p))));
  }

  getPokemonInfo(name: string[] | number[]): void {
    const promises: Promise<any>[] = [this.PokeApi.getPokemonSpeciesByName(name), this.PokeApi.getPokemonByName(name)];
    Promise.all(promises).then((resp) => {
      this.pokemonList.set(resp[0].map((ps: PokemonSpecies, i: number) => this.pokemonInfoMapper({ details: resp[1][i], species: ps })));
    });
  }

  getEvolutionChain(name: number): void {
    this.PokeApi.getEvolutionChainById(name).then(ec => this.evolutionChain.set(ec));
  }

  getEncounterLocations(name: string | number): void {
    this.PokeApi.getPokemonEncounterAreasByName(name).then(pe => {
      this.encounterLocations.set(this.pokemonEncounterAreaFilter(pe, this.selectedVersion()!.name));
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
      .then(async m => {
        let modifiedMoves: Promise<MoveDetail>[] = m.map(async (x, i) => {
          const currentGenNumber: number = romanToInt(getGenerationNumber(this.selectedVersionGroup()!.generation.name));
          return {
            move: await this.pokemonMoveMapper(x, currentGenNumber),
            detail: vgdResult[i]
          } as MoveDetail
        });
        Promise.all(modifiedMoves).then(x => this.learnedMoves.set(x));
      });

  }

  getRegions(name: string[] | number[]): void {
    this.PokeApi.getRegionByName(name).then(r => {
      this.selectedRegions.set(r.map(x => {
        return { ...x, names: this.englishLanguageFilter(x.names) } as Region;
      }));
    });
  }

  // TODO: Check if filter/map functions needed
  getLocations(name: string[] | number[]): void {
    this.PokeApi.getLocationByName(name).then(l => this.locationList.set(l));
  }

  getLocationAreas(name: string[] | number[]): void {
    this.PokeApi.getLocationAreaByName(name).then(la => {
      this.locationAreaList.set(la.map(x => {
        return {
          ...x,
          names: this.englishLanguageFilter(x.names, x.name),
          pokemon_encounters: this.pokemonEncountersFilter(x.pokemon_encounters, this.selectedVersion()!.name)
        };
      }).filter(x => x.pokemon_encounters.length > 0).sort(this.locationAreaComparator));
    });
  }

  // TODO: Check if filter/map functions needed
  getEncounterLocationArea(name: string | number): Promise<LocationArea> {
    return this.PokeApi.getLocationAreaByName(name);
  }

  // TODO: Check if filter/map functions needed
  async getEvolutionSpecies(name: string | number): Promise<PokemonSpecies> {
    return this.PokeApi.getPokemonSpeciesByName(name);
  }

  // TODO: Check if filter/map functions needed
  async getEvolutionItem(name: string | number): Promise<Item> {
    return this.PokeApi.getItemByName(name);
  }

  // TODO: Check if filter/map functions needed
  async getMachineDetails(name: number) {
    return this.PokeApi.getMachineById(name);
  }

  // TODO: Check if filter/map functions needed
  async getVersionGroupDetails(name: string | number): Promise<VersionGroup> {
    return this.PokeApi.getVersionGroupByName(name);
  }

  // TODO: Check if filter/map functions needed
  getPokemonTypeDetails(types: PokemonType[]): Promise<Type[]> {
    return this.PokeApi.getTypeByName(types.map(x => x.type.name)).then(t => {
      const currentGenNumber = romanToInt(getGenerationNumber(this.selectedVersionGroup()!.generation.name));
      return t.map(x => {
        return {
          ...x,
          names: this.englishLanguageFilter(x.names),
          damage_relations: this.pokemonTypeDamageRelationsMapper(x.damage_relations, x.past_damage_relations, currentGenNumber)
        }
      });
    });
  }

  getTypesList(): void {
    this.PokeApi.getTypesList().then(t => {
      this.PokeApi.getTypeByName(t.results.map(x => getIdFromUrl(x.url)!)).then(x => {
        this.pokemonTypesList.set(this.pokemonTypesListFilter(x, romanToInt(getGenerationNumber(this.selectedVersionGroup()!.generation.name))));
      });
    });
  }

  // Service helpers

  private pokemonTypesListFilter(arr: Type[], currentGenNumber: number): PokemonTypeListItem[] {
    return arr.filter(x => currentGenNumber >= romanToInt(getGenerationNumber(x.generation.name)) && x.pokemon.length > 0).map(x => {
      return {
        type: x.names.find(n => n.language.name === 'en')!.name,
        lowercaseType: x.name
      }
    });
  }

  private pokedexFilter(arr: PokedexObject[], versionGroup: string): PokedexObject[] {
    return arr.filter(x => x.version_groups.some(vg => vg.name === versionGroup));
  }

  private pokedexMapper(po: PokedexObject): PokedexObject {
    return {
      ...po,
      names: this.englishLanguageFilter(po.names)
    };
  }

  private pokemonInfoMapper(p: PokemonInfo): PokemonInfo {
    return {
      details: {
        ...p.details,
        game_indices: this.pokemonIndexFilter(p.details.game_indices, this.selectedVersion()!.name),
        types: this.pokemonTypesMapper(p.details.types, p.details.past_types, romanToInt(getGenerationNumber(this.selectedVersionGroup()!.generation.name))),
        moves: this.pokemonMovesFilter(p.details.moves, this.selectedVersionGroup()!.name)
      },
      species: {
        ...p.species,
        flavor_text_entries: this.pokemonFlavorTextFilter(p.species.flavor_text_entries, this.selectedVersion()!.name),
        names: this.englishLanguageFilter(p.species.names),
        pokedex_numbers: this.pokemonPokedexNumberFilter(p.species.pokedex_numbers, this.pokedexList().map(x => x.name)),
      }
    };
  }

  private pokemonPokedexNumberFilter(arr: PokedexNumber[], region: string[]): PokedexNumber[] {
    return arr.filter(x => region.includes(x.pokedex.name));
  };

  private pokemonFlavorTextFilter(arr: PokemonSpeciesFlavorTextEntry[], version: string): PokemonSpeciesFlavorTextEntry[] {
    return arr.filter(x => x.language.name === 'en' && x.version.name === version);
  };

  private pokemonMoveFlavorTextFilter(arr: MoveFlavorTextEntry[], versionGroup: string): MoveFlavorTextEntry[] {
    // Filter by language and version
    let newArr = arr.filter(x => x.language.name === 'en' && x.version_group.name === versionGroup);

    // If no language and version match, get the first english language option instead
    if (newArr.length === 0) {
      newArr = [arr.filter(x => x.language.name === 'en')[0]];
    }
    return newArr;
  };

  private pokemonMovesFilter(arr: MoveElement[], versionGroupDetails: string): MoveElement[] {
    return arr.map(x => {
      return {
        ...x,
        version_group_details: x.version_group_details.filter(x => x.version_group.name === versionGroupDetails)
      }
    }).filter(x => x.version_group_details.length > 0);
  };

  private pokemonTypesMapper(types: PokemonType[], pastTypes: PastType[], currentGenNumber: number): PokemonType[] {
    let currentGenTypes: PokemonType[] | PastTypeType[] = types;
    pastTypes.sort(this.pastTypesComparator);
    for (let i = 0; i < pastTypes.length; i++) {
      if (currentGenNumber <= romanToInt(getGenerationNumber(pastTypes[i].generation.name))) {
        currentGenTypes = pastTypes[i].types;
        break;
      } else {
        break;
      }
    }
    return currentGenTypes;
  };

  private pokemonIndexFilter(arr: PokemonGameIndex[], version: string): PokemonGameIndex[] {
    return arr.filter(x => x.version.name === version);
  }

  private pokemonEncountersFilter(arr: LocationAreaPokemonEncounter[], version: string): LocationAreaPokemonEncounter[] {
    return arr.map(x => {
      return { ...x, version_details: x.version_details.filter(vd => vd.version.name === version) } as LocationAreaPokemonEncounter;
    }).filter(x => x.version_details.length > 0);
  }

  private englishLanguageFilter(arr: LocationAreaName[], locationAreaName?: string): LocationAreaName[] {
    let newArr = arr.filter(x => x.language.name === 'en')!;
    // If there is no english language name, use the name property to create an entry
    if (newArr.length === 0) {
      newArr = [{ language: { name: 'en', url: '' }, name: startCase(locationAreaName?.replaceAll('-', ' ')) }];
    }
    return newArr;
  };

  private pastTypesComparator = (a: PastType, b: PastType): number => {
    return romanToInt(a.generation.name) - romanToInt(b.generation.name);
  }

  private locationAreaComparator = (a: LocationArea, b: LocationArea): number => {
    return a.names[0].name.localeCompare(b.names[0].name);
  }

  private pokemonEncounterAreaFilter(arr: PokemonEncounter[], version: string): PokemonEncounter[] {
    return arr.map(x => {
      return {
        ...x,
        version_details: x.version_details.filter(vd => vd.version.name === version)
      };
    }).filter(x => x.version_details.length > 0)
  }

  private pastValuesComparator = (a: PastValue, b: PastValue): number => {
    return getIdFromUrl(a.version_group.url)! - getIdFromUrl(b.version_group.url)!;
  }

  private async movePastValuesMapper(move: Move, currentGenNumber: number): Promise<Move> {
    let newMove = { ...move };
    // Sort past values array by generation using comparator
    move.past_values.sort(this.pastValuesComparator);
    const pastValuesArr = move.past_values;
    // Convert roman numeral of generation to number for future comparison
    for (let i = 0; i < pastValuesArr.length; i++) {
      // Get the version group of this past value
      // Check if the currently selected generation is before the pastValues generation
      // If the currently selected version groups' generation is before the pastValues generation, use those values to update the move's details
      if (currentGenNumber <= romanToInt(getGenerationNumber((await this.getVersionGroupDetails(getIdFromUrl(pastValuesArr[i].version_group.url)!)).generation.name))) {
        newMove.power = pastValuesArr[i].power != null ? pastValuesArr[i].power! : newMove.power;
        newMove.accuracy = pastValuesArr[i].accuracy != null ? pastValuesArr[i].accuracy! : newMove.accuracy;
        newMove.pp = pastValuesArr[i].pp != null ? pastValuesArr[i].pp! : newMove.pp;
        newMove.type = pastValuesArr[i].type != null ? pastValuesArr[i].type! : newMove.type;
        newMove.effect_chance = pastValuesArr[i].effect_chance != null ? pastValuesArr[i].effect_chance : newMove.effect_chance;
        newMove.effect_entries = pastValuesArr[i].effect_entries.length > 0 ? pastValuesArr[i].effect_entries : newMove.effect_entries;
        break;
      } else {
        break;
      }
    }

    return { ...newMove }
  }

  private async pokemonMoveMapper(move: Move, currentGenNumber: number): Promise<Move> {
    let modifiedMove = await this.movePastValuesMapper(move, currentGenNumber);
    return {
      ...modifiedMove, // also provides default values for move object
      flavor_text_entries: this.pokemonMoveFlavorTextFilter(move.flavor_text_entries, this.selectedVersionGroup()!.name),
      names: this.englishLanguageFilter(move.names)
    }
  }

  private pokemonTypeDamageRelationsMapper(dmgRel: TypeDamageRelations, pastDmgRel: PastDamageRelation[], currentGenNumber: number): TypeDamageRelations {
    let newDmgRel: TypeDamageRelations = { ...dmgRel };

    for (let i = 0; i < pastDmgRel.length; i++) {
      if (currentGenNumber <= romanToInt(getGenerationNumber(pastDmgRel[i].generation.name))) {
        newDmgRel = pastDmgRel[i].damage_relations;
        break;
      }
    }

    return newDmgRel;
  }
}
