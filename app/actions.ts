'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/app/lib/prisma';

export async function deletePokemonList(id: string) {
  await prisma.pokemonList.delete({ where: { id } });
  revalidatePath('/');
}
