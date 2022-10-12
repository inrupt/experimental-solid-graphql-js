import { Songs } from './Songs';
import { Query } from '../query';
import { FetchPlaylistDocument, FetchPlaylistQuery } from '../../graphql';
import { LoginIcon } from '@heroicons/react/outline';
import Link from 'next/link';

export function PlayList(props: { playlist: string }) {
  return <Query
    document={FetchPlaylistDocument}
    variables={{ id: props.playlist }}
    requireLogin={false}
    error={(e) => <>{JSON.stringify(e, null, 2)}</>}
    fallback={() => <></>}
    // TODO: Don't query unecessary song data here
    // children={props => <LoadedPlaylist {...props} />}
    >
    {data => <LoadedPlaylist {...data} />}
  </Query>
}

function LoadedPlaylist({ playlist }: FetchPlaylistQuery) {
  return <Center
      name={playlist.name}
      songs={playlist.entries.map(song => song.song._id)}
      image={playlist.image}
      type='Playlist'
    />
}

export function Center(props: { name: string; songs: string[]; image: string; type: string }) {
  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide select-none relative bg-gradient-to-t from-purple-900 to-black">
      <section className="flex items-end space-x-7 bg-gradient-to-b to-black p-5 text-white bg-[#2e2e2e] rounded m-2.5">
        <img className="h-44 w-44 rounded shadow-2xl object-cover" src={props.image} alt={props.name} />
        <div>
          <p>{props.type}</p>
          <h1 className="text-2xl md:text-3xl xl:text-5xl">{props.name}</h1>
        </div>
      </section>
      

      <div>
        <Songs songs={props.songs} />
      </div>
    </div>
  )
}
