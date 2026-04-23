'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { PokemonGrid } from './PokemonGrid';
import { SelectedPanel } from './SelectedPanel';
import { FileUpload } from './FileUpload';
import { createPokemonList } from './actions';
import type { Pokemon, SelectedPokemon } from './types';

const BASE_URL = process.env.NEXT_PUBLIC_POKEMON_API_URL;

export const PokemonList = () => {
  const [selected, setSelected] = useState<SelectedPokemon[]>([]);
  const [loadingNames, setLoadingNames] = useState<Set<string>>(new Set());
  const [listName, setListName] = useState('');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const toggleSelect = async (pokemon: Pokemon) => {
    if (selected.some(p => p.name === pokemon.name)) {
      setSelected(prev => prev.filter(p => p.name !== pokemon.name));
      return;
    }

    const id = pokemon.url.split('/').filter(Boolean).pop()!;
    const pokemonApiId = parseInt(id, 10);
    setLoadingNames(prev => new Set(prev).add(pokemon.name));

    try {
      const detail = await fetch(`${BASE_URL}/${id}`).then(r => r.json());
      setSelected(prev => [...prev, { ...pokemon, pokemonApiId, weight: detail.weight }]);
    } catch {
      setSaveError(`Failed to load ${pokemon.name}. Please try again.`);
    } finally {
      setLoadingNames(prev => {
        const next = new Set(prev);
        next.delete(pokemon.name);
        return next;
      });
    }
  };

  const handleSave = () => {
    setSaveError(null);
    startTransition(async () => {
      try {
        await createPokemonList(listName.trim(), selected);
        router.push('/');
      } catch {
        setSaveError('Failed to save list. Please try again.');
      }
    });
  };

  const handleFileLoad = (name: string, pokemon: SelectedPokemon[]) => {
    const seen = new Set<string>();
    const deduped = pokemon.filter(p => {
      if (seen.has(p.name)) return false;
      seen.add(p.name);
      return true;
    });
    setListName(name);
    setSelected(deduped);
    setSaveError(null);
  };

  return (
    <div className="max-w-206 mx-auto">
      <div className="flex justify-end mb-4">
        <FileUpload
          onLoad={handleFileLoad}
          onError={msg => setSaveError(msg)}
        />
      </div>
      <PokemonGrid
        selected={selected}
        loadingNames={loadingNames}
        onToggle={toggleSelect}
      />
      <h2 className="text-2xl font-bold text-center mt-8 mb-4">Selected Pokémon</h2>
      <SelectedPanel
        selected={selected}
        listName={listName}
        saveError={saveError}
        isPending={isPending}
        onToggle={toggleSelect}
        onListNameChange={setListName}
        onSave={handleSave}
      />
    </div>
  );
};
