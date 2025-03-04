import { LanguageName, PastType, PastValue } from 'pokeapi-js-wrapper';
import { PokemonInfo } from './app.beans';

export const getIdFromUrl = (str: string): number | null => {
  let results: RegExpMatchArray | null = str.match(/\d+/g);
  return results && results.length > 0 ? +results[results.length - 1] : null;
}

export const getNameFromObject = (languageArray: LanguageName[]): string => {
  return languageArray.find(x => x.language.name === 'en')!.name;
}

export const sleep = (ms: number) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export const pastValuesComparator = (a: PastValue, b: PastValue): number => {
  return getIdFromUrl(a.version_group.url)! - getIdFromUrl(b.version_group.url)!;
}

export const getGenerationNumber = (genStr: string): string => {
  return genStr.substring(genStr.indexOf('-') + 1).toUpperCase();
}

export const romanToInt = (str: string): number => {
  const roman = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  let num: number = 0;
  for (let i = 0; i < str.length; i++) {
    const curr = roman[str[i] as keyof typeof roman];
    const next = roman[str[i + 1] as keyof typeof roman];
    (curr < next) ? (num -= curr) : (num += curr);
  }
  return num;
};

export const pastTypesComparator = (a: PastType, b: PastType): number => {
  return romanToInt(a.generation.name) - romanToInt(b.generation.name);
}

export const getCurrentGenerationPokemonType = (pokemon: PokemonInfo, currentGeneration: string): string[] => {
  let pokeTypes: string[] = pokemon.details.types.map(x => x.type.name);
  // Sort past values array by generation using comparator
  pokemon.details.past_types.sort(pastTypesComparator);
  // Convert roman numeral of generation to number for future comparison
  const currentGenNum: number = romanToInt(getGenerationNumber(currentGeneration));

  for (const pastType of pokemon.details.past_types) {
    // Check if the currently selected generation is before the pastValues generation
    // If the currently selected version groups' generation is before the pastValues generation, use those values to update the move's details
    if (currentGenNum < romanToInt(getGenerationNumber(pastType.generation.name))) {
      pokeTypes = pastType.types.map(x => x.type.name);
    } else {
      break;
    }
  }

  return pokeTypes;
}
