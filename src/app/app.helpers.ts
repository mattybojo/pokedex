import { FluffyEncounterDetail, LanguageName, MoveFlavorTextEntry, PurpleEncounterDetail } from 'pokeapi-js-wrapper';

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

export const flavorTextComparator = (a: MoveFlavorTextEntry, b: MoveFlavorTextEntry): number => {
  return getIdFromUrl(a.version_group.name)! - getIdFromUrl(b.version_group.name)!;
}

export const getEncounterLevel = (encounter: FluffyEncounterDetail | PurpleEncounterDetail): string => {
  if (encounter.min_level === encounter.max_level) {
    return `Level ${encounter.min_level}`
  } else {
    return `Level ${encounter.min_level} - ${encounter.max_level}`
  }
}
