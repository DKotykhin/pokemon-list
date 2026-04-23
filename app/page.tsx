export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { prisma } from '@/app/lib/prisma';
import { DeleteListButton } from './DeleteListButton';

export default async function Home() {
  const lists = await prisma.pokemonList.findMany({
    include: { pokemonItems: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <main className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">Welcome to the List App</h1>
      <h2 className="text-xl mb-6 text-center">Create and manage your lists easily.</h2>
      <Link href="/create-list">
        <span className='flex justify-center items-center px-4 py-2 text-xl bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-300'>
          Create a new list
        </span>
      </Link>

      {!lists || lists.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">You don&apos;t have any lists yet.</p>
      ) : (
        <ul className="mt-10 flex flex-col gap-4">
          {lists.map(list => {
            const totalWeight = list.pokemonItems.reduce((sum, p) => sum + p.weight, 0);
            return (
              <li key={list.id} className="p-4 border border-gray-400 rounded-lg max-w-87 hover:border-white transition-colors duration-300">
                <Link href={`/lists/${list.id}`} aria-label={`View list: ${list.name}`} className="block">
                  <div className="flex justify-between items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold capitalize truncate">{list.name}</h3>
                    <span className="text-gray-400 text-sm whitespace-nowrap">
                      {new Date(list.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <div className="flex gap-4 text-sm text-gray-400 mb-3">
                    <span>{list.pokemonItems.length} Pokémon</span>
                    <span>{totalWeight} hg total weight</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {list.pokemonItems.map(item => (
                      <span
                        key={item.id}
                        className="px-2 py-1 border border-gray-600 rounded text-xs text-gray-300 capitalize"
                      >
                        {item.name}
                      </span>
                    ))}
                  </div>
                </Link>
                <div className='w-full flex justify-end mt-2'>
                  <DeleteListButton id={list.id} name={list.name} />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
