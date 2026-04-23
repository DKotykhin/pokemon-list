export const dynamic = 'force-dynamic';

import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/app/lib/prisma';
import { DownloadButton } from './DownloadButton';

const spriteUrl = (pokemonApiId: number) =>
  `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonApiId}.png`;

export default async function ListPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const list = await prisma.pokemonList.findUnique({
    where: { id },
    include: { pokemonItems: true },
  });

  if (!list) notFound();

  const totalWeight = list.pokemonItems.reduce((sum, p) => sum + p.weight, 0);

  return (
    <main className="max-w-4xl mx-auto p-4">
      <Link href="/" aria-label="Back to lists" className="text-gray-400 hover:text-white transition-colors duration-300 text-sm">
        ← Back to lists
      </Link>

      <div className="mt-6 mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold capitalize">{list.name}</h1>
          <p className="text-gray-400 mt-1 text-sm">
            {new Date(list.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}
            {list.pokemonItems.length} Pokémon
            {' · '}
            {totalWeight} hg total
          </p>
        </div>
        <DownloadButton
          listName={list.name}
          pokemon={list.pokemonItems.map(p => ({ name: p.name, pokemonApiId: p.pokemonApiId, weight: p.weight }))}
        />
      </div>

      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {list.pokemonItems.map(item => (
          <li
            key={item.id}
            className="flex flex-col items-center gap-2 p-4 border border-gray-600 rounded-lg"
          >
            <Image
              src={spriteUrl(item.pokemonApiId)}
              alt={item.name}
              width={80}
              height={80}
            />
            <span className="capitalize font-medium">{item.name}</span>
            <span className="text-gray-400 text-sm">{item.weight} hg</span>
          </li>
        ))}
      </ul>
    </main>
  );
}
