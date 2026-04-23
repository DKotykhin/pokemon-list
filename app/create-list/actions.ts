'use server';

import { prisma } from '@/app/lib/prisma';

interface PokemonInput {
  name: string;
  pokemonApiId: number;
  weight: number;
}

export async function createPokemonList(name: string, pokemon: PokemonInput[]) {
  await prisma.pokemonList.create({
    data: {
      name,
      pokemonItems: {
        create: pokemon.map(p => ({ name: p.name, pokemonApiId: p.pokemonApiId, weight: p.weight })),
      },
    },
  });
}
