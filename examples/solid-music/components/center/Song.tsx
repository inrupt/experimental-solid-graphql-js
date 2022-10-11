import Link from 'next/link';
import { FetchSongDocument, FetchSongQuery } from '../../graphql';
import { Query } from '../query';

export function Song(props: { song: string }) {
  return (
    <Link href={`?currentSong=${props.song}`}>
      <Query
        document={FetchSongDocument}
        variables={{ id: props.song }}
        children={data => <LoadedSong {...data} />}
        fallback={() => <></>}
        error={(e) => <>Error {JSON.stringify(e, null, 2)}</>}
        requireLogin={true}
      />
    </Link>
  )
}

function LoadedSong({ song }: FetchSongQuery): JSX.Element {
  return (
    <div
      className="grid grid-cols-2 text-[#929292] hover:text-white hover:bg-[#2b2d30] rounded-md cursor-pointer"
    // onClick={() => {}}
    >
      <div className="flex items-center pl-3 space-x-4 py-1">
        <p>{song.order}</p>
        <img
          className="h-10 w-10 object-cover"
          src={song.album.url}
          alt={song.album.name}
        />
        <div className="">
          <p className="w-36 lg:w-[20rem] truncate text-white">
            {song.title}
          </p>
          {/* TODO: Make these into URLS */}
          <p className="w-40">{song.artist.map(artist => artist.name).join(", ")}</p>
        </div>
      </div>

      <div className="flex items-center justify-between ml-auto md:ml-0 pr-10">
        <p className="hidden md:inline w-40 lg:w-96 truncate">
          {song.album.name}
        </p>
        {/* TODO: Add Other data here */}
        {/* <p>{millisToMinutesAndSeconds(track.track.duration_ms)}</p> */}
      </div>
    </div>
  )
}
