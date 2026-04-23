'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
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

interface Props {
  selected: SelectedPokemon[];
  loadingNames: Set<string>;
  onToggle: (pokemon: Pokemon) => void;
}

export const PokemonGrid = ({ selected, loadingNames, onToggle }: Props) => {
  const sentinelRef = useRef<HTMLDivElement>(null);

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
    });

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPokemon = data?.pages.flatMap(page => page.results) ?? [];

  return (
    <>
      {error && <p>Error: {(error as Error).message}</p>}
      <div
        role="region"
        aria-label="Pokémon catalogue"
        className='py-1 flex gap-4 flex-wrap justify-center max-h-120 overflow-y-auto overflow-x-hidden custom-scrollbar'
      >
        {isLoading
          ? Array.from({ length: LIMIT }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          : allPokemon.map((pokemon: Pokemon) => {
              const isSelected = selected.some(p => p.name === pokemon.name);
              const isLoadingThis = loadingNames.has(pokemon.name);
              return (
                <div
                  key={pokemon.name}
                  role="button"
                  tabIndex={isLoadingThis ? -1 : 0}
                  aria-pressed={isSelected}
                  aria-disabled={isLoadingThis}
                  aria-busy={isLoadingThis}
                  aria-label={`${pokemon.name}${isSelected ? ', selected' : ''}`}
                  className={`w-30 h-30 flex flex-col justify-center items-center p-4 border rounded-lg capitalize hover:scale-105 transition-all duration-300 cursor-pointer ${
                    isSelected
                      ? 'border-white text-white'
                      : 'border-gray-400 text-gray-400 hover:border-white hover:text-white'
                  } ${isLoadingThis ? 'opacity-60 pointer-events-none' : ''}`}
                  onClick={() => onToggle(pokemon)}
                  onKeyDown={e => {
                    if ((e.key === 'Enter' || e.key === ' ') && !isLoadingThis) {
                      e.preventDefault();
                      onToggle(pokemon);
                    }
                  }}
                >
                  {isLoadingThis
                    ? <div aria-hidden="true" className='w-8 h-8 border-2 border-gray-400 border-t-white rounded-full animate-spin mb-2' />
                    : <Image src={imageUrl(pokemon.url)} alt="" width={60} height={60} />
                  }
                  <span className='max-w-24 truncate'>{pokemon.name}</span>
                </div>
              );
            })}
        {isFetchingNextPage &&
          Array.from({ length: LIMIT }).map((_, index) => (
            <SkeletonCard key={`next-${index}`} />
          ))}
        <div ref={sentinelRef} className='w-full h-1' />
      </div>
    </>
  );
};
