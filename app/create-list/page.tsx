import Link from 'next/link';
import { PokemonList } from './PokemonList';

export default async function CreateList() {
  return (
    <main className="max-w-4xl mx-auto p-4">
      <Link href="/" className="text-gray-500 hover:text-gray-400 transition-colors duration-300 mb-4 inline-block">
        &larr; Back to Home
      </Link>
      <h1 className="text-2xl font-bold text-center mb-4">
        Available Pokémon
      </h1>
      <PokemonList />
    </main>
  );
}