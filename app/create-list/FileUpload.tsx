'use client';

import { useRef } from 'react';
import type { SelectedPokemon } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_POKEMON_API_URL;

interface SavedPokemon {
  name: string;
  pokemonApiId: number;
  weight: number;
}

interface SavedList {
  listName: string;
  pokemon: SavedPokemon[];
}

interface Props {
  onLoad: (listName: string, pokemon: SelectedPokemon[]) => void;
  onError: (msg: string) => void;
}

export const FileUpload = ({ onLoad, onError }: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    try {
      const text = await file.text();
      const data: SavedList = JSON.parse(text);

      if (!data.listName || !Array.isArray(data.pokemon) || data.pokemon.length === 0) {
        onError('Invalid file format.');
        return;
      }

      const pokemon: SelectedPokemon[] = await Promise.all(
        data.pokemon.map(async (p) => {
          const res = await fetch(`${BASE_URL}/${p.pokemonApiId}`);
          if (!res.ok) throw new Error(`Failed to fetch ${p.pokemonApiId}`);
          const detail = await res.json();
          return {
            name: detail.name as string,
            url: `${BASE_URL}/${p.pokemonApiId}/`,
            pokemonApiId: p.pokemonApiId,
            weight: detail.weight as number,
          };
        })
      );

      onLoad(data.listName, pokemon);
    } catch {
      onError('Could not read file. Make sure it is a valid Pokémon list JSON.');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <input
        ref={inputRef}
        type="file"
        accept=".json,application/json"
        aria-label="Upload Pokémon list JSON file"
        className="hidden"
        onChange={e => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
          e.target.value = '';
        }}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="px-4 py-2 border border-gray-400 text-gray-300 rounded-lg hover:border-white hover:text-white transition-colors duration-300 cursor-pointer text-sm"
      >
        Upload list from file
      </button>
    </div>
  );
};
