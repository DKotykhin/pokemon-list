'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Props {
  pokemonApiId: number;
  name: string;
}

export const PokemonImage = ({ pokemonApiId, name }: Props) => {
  const [imgError, setImgError] = useState(false);
  const src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonApiId}.png`;

  if (imgError) {
    return (
      <svg aria-hidden="true" width="80" height="80" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="30" cy="30" r="22" stroke="currentColor" strokeWidth="2.5" />
        <rect x="27" y="15" width="6" height="18" rx="3" fill="currentColor" />
        <circle cx="30" cy="40" r="3.5" fill="currentColor" />
      </svg>
    );
  }

  return (
    <Image src={src} alt={name} width={80} height={80} onError={() => setImgError(true)} />
  );
};
