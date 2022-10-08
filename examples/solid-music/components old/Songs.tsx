import Song from './Song';

import { playlist } from './data';

function Songs() {
  return (
    <div className="px-6 py-3 flex flex-col space-y-2 text-white bg-[#2e2e2e] rounded m-2.5 bg-opacity-50">
      {playlist?.tracks.items.map((track, i) => (
        <Song key={track.track.id} track={track} order={i} />
      ))}
    </div>
  );
}

export default Songs;
