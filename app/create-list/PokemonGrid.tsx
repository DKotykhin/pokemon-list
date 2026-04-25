'use client';

import Image from 'next/image';
import { memo, useEffect, useMemo, useRef, useState } from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import type { Pokemon, SelectedPokemon, PokemonResponse } from './types';

const LIMIT = 24;
const BASE_URL = process.env.NEXT_PUBLIC_POKEMON_API_URL;

const imageUrl = (url: string) => {
  const id = url.split('/').filter(Boolean).pop();
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;
};

const SkeletonCard = () => (
  <div aria-hidden="true" className='w-30 h-30 flex flex-col justify-center items-center p-4 border border-gray-400 rounded-lg'>
    <div className='w-15 h-15 bg-gray-500 rounded-full mb-2 animate-pulse'></div>
    <div className='w-20 h-4 bg-gray-500 rounded mb-1 animate-pulse'></div>
  </div>
);

interface CardProps {
  pokemon: Pokemon;
  isSelected: boolean;
  isLoading: boolean;
  priority?: boolean;
  onToggle: (pokemon: Pokemon) => void;
}

const PokemonCard = memo(({ pokemon, isSelected, isLoading, priority, onToggle }: CardProps) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div
      role="button"
      tabIndex={isLoading ? -1 : 0}
      aria-pressed={isSelected}
      aria-disabled={isLoading}
      aria-busy={isLoading}
      aria-label={`${pokemon.name}${isSelected ? ', selected' : ''}`}
      className={`w-30 h-30 flex flex-col justify-center items-center p-4 border rounded-lg capitalize hover:scale-105 transition-all duration-300 cursor-pointer ${isSelected
          ? 'border-white text-white'
          : 'border-gray-400 text-gray-400 hover:border-white hover:text-white'
        } ${isLoading ? 'opacity-60 pointer-events-none' : ''}`}
      onClick={() => onToggle(pokemon)}
      onKeyDown={e => {
        if ((e.key === 'Enter' || e.key === ' ') && !isLoading) {
          e.preventDefault();
          onToggle(pokemon);
        }
      }}
    >
      {isLoading
        ? <div aria-hidden="true" className='w-8 h-8 border-2 border-gray-400 border-t-white rounded-full animate-spin mb-2' />
        : imgError
          ? <svg aria-hidden="true" width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="30" cy="30" r="22" stroke="currentColor" strokeWidth="2.5" />
              <rect x="27" y="15" width="6" height="18" rx="3" fill="currentColor" />
              <circle cx="30" cy="40" r="3.5" fill="currentColor" />
            </svg>
          : <Image src={imageUrl(pokemon.url)} alt={pokemon.name} width={60} height={60} priority={priority} onError={() => setImgError(true)} />
      }
      <span className='max-w-24 truncate text-sm mt-1'>{pokemon.name}</span>
    </div>
  );
});
PokemonCard.displayName = 'PokemonCard';

interface Props {
  selected: SelectedPokemon[];
  loadingNames: Set<string>;
  onToggle: (pokemon: Pokemon) => void;
}

export const PokemonGrid = memo(({ selected, loadingNames, onToggle }: Props) => {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteQuery<PokemonResponse>({
      queryKey: ['pokemon'],
      queryFn: ({ pageParam }) =>
        fetch(`${BASE_URL}?offset=${pageParam}&limit=${LIMIT}`).then(r => r.json()),
      initialPageParam: 0,
      getNextPageParam: (lastPage) => {
        if (!lastPage.next) return undefined;
        return Number(new URL(lastPage.next).searchParams.get('offset'));
      },
    });

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }, { root: containerRef.current });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const selectedNames = useMemo(() => new Set(selected.map(p => p.name)), [selected]);
  const allPokemon = data?.pages.flatMap(page => page.results) ?? [];

  return (
    <>
      {error && <p>Error: {(error as Error).message}</p>}
      <div
        ref={containerRef}
        role="region"
        aria-label="Pokémon catalogue"
        className='py-1 flex gap-4 flex-wrap justify-center max-h-120 overflow-y-auto overflow-x-hidden custom-scrollbar'
      >
        {isLoading
          ? Array.from({ length: LIMIT }).map((_, index) => (
            <SkeletonCard key={index} />
          ))
          : allPokemon.map((pokemon: Pokemon, index) => (
            <PokemonCard
              key={pokemon.name}
              pokemon={pokemon}
              isSelected={selectedNames.has(pokemon.name)}
              isLoading={loadingNames.has(pokemon.name)}
              priority={index === 0}
              onToggle={onToggle}
            />
          ))}
        {isFetchingNextPage &&
          Array.from({ length: LIMIT }).map((_, index) => (
            <SkeletonCard key={`next-${index}`} />
          ))}
        {!hasNextPage && !isLoading && (
          <p className='w-full text-center text-gray-500 text-sm py-2'>
            All {allPokemon.length} Pokémon loaded
          </p>
        )}
        <div ref={sentinelRef} className='w-full h-1' />
      </div>
    </>
  );
});
PokemonGrid.displayName = 'PokemonGrid';
