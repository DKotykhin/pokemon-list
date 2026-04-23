export interface Pokemon {
  name: string;
  url: string;
}

export interface SelectedPokemon extends Pokemon {
  pokemonApiId: number;
  weight: number;
}

export interface PokemonResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Pokemon[];
}
