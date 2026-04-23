'use client';

import Image from 'next/image';
import CountUp from 'react-countup';
import type { SelectedPokemon } from './types';

const spriteUrl = (pokemonApiId: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonApiId}.png`;

interface Props {
  selected: SelectedPokemon[];
  listName: string;
  saveError: string | null;
  isPending: boolean;
  onToggle: (pokemon: SelectedPokemon) => void;
  onListNameChange: (name: string) => void;
  onSave: () => void;
}

export const SelectedPanel = ({
  selected,
  listName,
  saveError,
  isPending,
  onToggle,
  onListNameChange,
  onSave,
}: Props) => {
  const totalWeight = selected.reduce((sum, p) => sum + p.weight, 0);
  const isOverWeight = totalWeight > 1300;
  const hasEnough = selected.length >= 3;

  return (
    <div className='flex flex-col p-4 border border-gray-400 rounded-lg min-h-50'>
      <div
        aria-hidden={selected.length === 0}
        className={`flex justify-between mb-1 items-start sm:items-center gap-2 transition-all duration-300 overflow-hidden ${selected.length === 0 ? 'opacity-0 max-h-0' : 'opacity-100 max-h-16'}`}
      >
        <div className='flex flex-col sm:flex-row justify-end gap-2 sm:gap-4'>
          <p className={`${isOverWeight ? 'text-red-400' : 'text-gray-400'}`}>
            Total weight: <CountUp end={totalWeight} decimals={1} duration={0.6} preserveValue /> hg
          </p>
          <p className={`${selected.length > 0 && !hasEnough ? 'text-red-400' : 'text-gray-400'}`}>
            Total selected: {selected.length}
          </p>
        </div>
        <button
          className='text-red-400 transition-colors duration-300 hover:text-red-500 disabled:text-transparent disabled:cursor-not-allowed cursor-pointer'
          disabled={selected.length === 0}
          onClick={() => selected.forEach(p => onToggle(p))}
        >
          Clear All
        </button>
      </div>
      <small
        role={selected.length > 0 && !hasEnough ? 'alert' : undefined}
        aria-hidden={!(selected.length > 0 && !hasEnough)}
        className={`text-red-400 transition-all duration-300 overflow-hidden ${selected.length > 0 && !hasEnough ? 'h-5' : 'h-0 opacity-0'}`}
      >Select at least 3 Pokémon</small>
      <small
        role={isOverWeight ? 'alert' : undefined}
        aria-hidden={!isOverWeight}
        className={`text-red-400 transition-all duration-300 overflow-hidden shrink-0 ${isOverWeight ? 'h-5' : 'h-0 opacity-0'}`}
      >Total weight exceeds limit</small>
      {selected.length === 0 && (
        <p className='text-gray-500 text-center mt-4'>No Pokémon selected yet</p>
      )}
      <div className='flex gap-4 flex-wrap grow mt-3'>
        {selected.map(pokemon => (
          <div
            key={pokemon.name}
            role="button"
            tabIndex={0}
            aria-label={`Remove ${pokemon.name}`}
            className='flex h-fit items-center gap-2 px-3 py-1 border border-white rounded-lg capitalize text-white cursor-pointer hover:border-red-400 hover:text-red-400 transition-all duration-300'
            onClick={() => onToggle(pokemon)}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onToggle(pokemon);
              }
            }}
          >
            <Image src={spriteUrl(pokemon.pokemonApiId)} alt={pokemon.name} width={30} height={30} />
            <span className='text-sm'>{pokemon.name}</span>
          </div>
        ))}
      </div>
      <div className='w-full flex flex-col items-center gap-2 mt-4'>
        {saveError && <p role="alert" className='text-red-400 text-sm'>{saveError}</p>}
        <div className='flex flex-col sm:flex-row gap-2 w-full max-w-80'>
          <input
            type='text'
            aria-label='List name'
            placeholder='List name...'
            value={listName}
            onChange={e => onListNameChange(e.target.value)}
            className='flex-1 px-3 py-2 bg-transparent border border-gray-400 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white'
          />
          <button
            className='px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed cursor-pointer'
            disabled={!listName.trim() || selected.length === 0 || isOverWeight || !hasEnough || isPending}
            onClick={onSave}
          >
            {isPending ? 'Saving...' : 'Create List'}
          </button>
        </div>
      </div>
    </div>
  );
};
