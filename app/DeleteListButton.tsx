'use client';

import { useTransition } from 'react';
import { deletePokemonList } from './actions';

export const DeleteListButton = ({ id, name }: { id: string; name: string }) => {
  const [isPending, startTransition] = useTransition();

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!confirm('Delete this list?')) return;
    startTransition(() => deletePokemonList(id));
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isPending}
      aria-label={`Delete ${name}`}
      className="text-xs text-gray-500 hover:text-red-400 transition-colors duration-300 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
    >
      {isPending ? 'Deleting…' : 'Delete'}
    </button>
  );
};
