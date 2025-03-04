import { AfterViewInit, Component, effect, ElementRef, inject, ViewChild } from '@angular/core';
import { capitalize } from 'lodash-es';
import mermaid from 'mermaid';
import { ChainEvolvesTo, EvolvesToEvolvesTo, FluffyEvolutionDetail, Item, PurpleEvolutionDetail } from 'pokeapi-js-wrapper';
import { PanelModule } from 'primeng/panel';
import { PokemonInfo } from '../../../app.beans';
import { getIdFromUrl, getNameFromObject } from '../../../app.helpers';
import { PokeApiService } from '../../../shared/poke-api.service';

@Component({
  selector: 'pokemon-evolution',
  imports: [PanelModule],
  templateUrl: './pokemon-evolution.component.html',
  styleUrl: './pokemon-evolution.component.scss',
  standalone: true
})
export class PokemonEvolutionComponent implements AfterViewInit {

  @ViewChild('mermaidDiv') mermaidDiv!: ElementRef;

  mermaidDiagram: string[] = [];
  isMermaidReady: boolean = false;

  // DI
  public pokeApi = inject(PokeApiService);

  constructor() {
    mermaid.initialize({
      startOnLoad: true,
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'cardinal',
      },
      securityLevel: 'loose',
    });

    effect(() => {
      if (this.pokeApi.evolutionChain() && this.pokeApi.pokemonList().length > 0) {
        // Init mermaid diagram
        this.mermaidDiagram = [];

        // Start graph then process evolutions to add to graph
        this.mermaidDiagram.push(`graph LR`);

        // Create the mermaid diagram to show the evolutionary tree
        this.processEvolutions(this.pokeApi.evolutionChain()!.chain.evolves_to, this.pokeApi.evolutionChain()!.chain.species.name).then(() => {
          if (this.isMermaidReady) {
            this.renderMermaidDiagram();
          } else {
            this.isMermaidReady = true;
          }
        });
      }
    });
  }

  async ngAfterViewInit(): Promise<void> {
    const element: any = this.mermaidDiv.nativeElement;
    element.style.opacity = 0;
    if (this.isMermaidReady) {
      this.renderMermaidDiagram();
    } else {
      this.isMermaidReady = true;
    }
  }

  async processEvolutions(chain: ChainEvolvesTo[] | EvolvesToEvolvesTo[], currentPoke: string): Promise<void> {
    // Get the pokemon info for each pokemon
    const currentPokeInfo = this.pokeApi.pokemonList().find(x => x.details.name === currentPoke);
    let evoPokeInfo;

    if (currentPokeInfo) {
      this.mermaidDiagram.push(this.createNodeText(currentPokeInfo));
    }

    // Process each evolution at this level
    for (const evolution of chain) {
      // Get the next evolution stage of this pokemon
      evoPokeInfo = this.pokeApi.pokemonList().find(x => x.details.name === evolution.species.name);

      // if valid, create a link between the current and evolution pokemon and go to the next level
      if (evoPokeInfo) {
        if (evolution.evolution_details.length > 1) {
          console.error(`Missing evolution details for ${evolution.species.name}`);
        }
        if (currentPokeInfo) {
          this.mermaidDiagram.push(await this.createEvolutionLink(currentPokeInfo, evoPokeInfo, evolution.evolution_details[0]));
        }
        await this.processEvolutions(evolution.evolves_to, evolution.species.name);
      }
    }
  }

  private async renderMermaidDiagram() {
    const element: any = this.mermaidDiv.nativeElement;
    element.innerHTML = '';

    this.pruneEvolutionDiagram();

    const { svg, bindFunctions } = await mermaid.render('mermaidDiv', this.mermaidDiagram.join(''));
    element.innerHTML = svg;
    element.style.opacity = 100;
    bindFunctions?.(element);
  }

  private pruneEvolutionDiagram(): void {
    // Check for links -- if no links, remove the other pokemon
    if (!this.mermaidDiagram.some(x => x.includes('---'))) {
      const pokemon = capitalize(this.pokeApi.selectedPokemon()!.details.name);
      this.mermaidDiagram = this.mermaidDiagram.filter(x => x.includes('graph LR') || x.includes(pokemon));
    }
  }

  private createNodeText(pokemon: PokemonInfo): string {
    let nodeLabel: string = getNameFromObject(pokemon!.species.names);
    return `\n${nodeLabel}@{ img: "${pokemon!.details.sprites.other['official-artwork'].front_default}", label: "${nodeLabel}", pos: "t", w: 75, h: 75, constraint: "on" }\nstyle ${nodeLabel} fill:transparent,stroke:transparent`;
  }

  private async createEvolutionLink(pokemon: PokemonInfo, nextEvo: PokemonInfo, evoDetails: PurpleEvolutionDetail | FluffyEvolutionDetail): Promise<string> {
    let linkText: string = '';
    switch (evoDetails.trigger.name) {
      case 'level-up':
        linkText = `Level ${evoDetails.min_level}`;
        break;
      case 'use-item':
        let item: Item = await this.pokeApi.getEvolutionItem(getIdFromUrl(evoDetails.item!.url)!);
        linkText = getNameFromObject(item.names);
        break;
      case 'trade':
        linkText = 'Trade';
        break
      default:
        console.error(`Unknown evolution trigger: ${evoDetails.trigger.name}`);
    }
    return `\n${getNameFromObject(pokemon.species.names)}-- ${linkText} ---${getNameFromObject(nextEvo.species.names)}`;
  }
}
