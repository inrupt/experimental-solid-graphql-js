import { Song } from "./Song";

export function Songs({ songs }: { songs: string[] }) {
  return (
    <div className="px-6 py-3 flex flex-col space-y-2 text-white bg-[#2e2e2e] rounded m-2.5 bg-opacity-50">
      {songs.map((song, i) => (
        <Song key={song} song={song} order={i + 1} />
      ))}
    </div>
  );
}

export default Songs;
