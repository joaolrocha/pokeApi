export interface ListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: { name: string; url: string }[];
}

export interface Pokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string | null;
    back_default: string | null;
    front_shiny: string | null;
    back_shiny: string | null;
    other: {
      ['official-artwork']: { front_default: string | null };
      dream_world: { front_default: string | null };
    };
  };
  types: { slot: number; type: { name: string } }[];
  abilities: { ability: { name: string } }[];
}

export interface PokemonSpecies {
  color: { name: string };
  flavor_text_entries: { flavor_text: string; language: { name: string } }[];
}
