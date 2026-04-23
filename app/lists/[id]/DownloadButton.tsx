'use client';

interface PokemonItem {
  name: string;
  pokemonApiId: number;
  weight: number;
}

interface Props {
  listName: string;
  pokemon: PokemonItem[];
}

export const DownloadButton = ({ listName, pokemon }: Props) => {
  const handleDownload = () => {
    const data = {
      listName,
      pokemon: pokemon.map(p => ({ name: p.name, pokemonApiId: p.pokemonApiId, weight: p.weight })),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${listName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors duration-300 cursor-pointer"
    >
      Download list
    </button>
  );
};
