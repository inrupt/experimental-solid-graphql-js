
import { HomeIcon } from '@heroicons/react/solid';
import { useEffect, useState } from 'react';
import Link from 'next/link'
import { LibraryIcon } from '@heroicons/react/outline';
import { Query } from './query';
import { FetchPlaylistsQuery, FetchPlaylistsDocument, FetchUserDocument } from '../graphql';
import { useRouter } from 'next/router';

export function Sidebar() {
  const urlData = useRouter();

  return (
    <div className="h-screen text-gray-300 p-5 text-sm border-r border-gray-500 overflow-y-scroll h0screen scrollbar-hide sm:max-w-[20rem] lg:max-w-[15rem] md:inline-flex">
      <div className='space-y-4'>

        <Link href='/'>
          <button className="flex items-center space-x-2 hover:text-white">
            <HomeIcon className="h-5 w-5" />
            <p>Home</p>
          </button>
        </Link>

        <Link href='/playlists'>
          <button className="flex items-center space-x-2 hover:text-white">
            <LibraryIcon className="h-5 w-5" />
            <p>Playlists</p>
          </button>
        </Link>


        <Query
          document={FetchUserDocument}
          error={() => <>Error</>}
          fallback={() => <></>}
          requireLogin={true}
          variables={{}}
        >
          {
            (data) => <>
              {data.user.playlists.map(x => {
                return <Link key={x._id} href={{
                  ...urlData,
                  query: {
                    ...urlData.query,
                    currentPlaylist: x._id
                  }
                }}>
                  <button className="flex items-center pl-6 hover:text-white">
                    <p>{x.name}</p>
                  </button>
                </Link>;
              })}
            </>
          }
        </Query>


      </div>
    </div>
  )

  // <Link href='/playlists'>
  //         <button className="flex items-center pl-8 hover:text-white">
  //           {/* <LibraryIcon className="h-5 w-5" /> */}
  //           {/* <p>Playlists</p> */}
  // <Query
  //   document={FetchPlaylistsDocument}
  //   error={() => <>Error</>}
  //   fallback={() => <>Fallback</>}
  //   requireLogin={true}
  //   variables={{}}
  //   >
  //     {(data) => <>{JSON.stringify(data, null, 2)}</>}
  //   </Query>

  //         </button>
  //       </Link>

  // const spotifyApi = useSpotify();
  // const { data: session, status } = useSession();
  const [playlists, setPlaylist] = useState([
    'http://example.org/playlist#a'
  ]);
  // const [playlistId, setPlaylistId] = useRecoilState(playlistIdState);

  useEffect(() => {
    // if (spotifyApi.getAccessToken()) {
    //   spotifyApi.getUserPlaylists().then((data) => {
    //     setPlaylist(data.body.items);
    //   });
    // }
  }, []);

  return (
    <div className="text-white-500 p-5 text-sm border-r border-gray-900 overflow-y-scroll h-screen scrollbar-hide sm:max-w-[12rem] lg:max-w-[15rem] hidden md:inline-flex ">
      Helel

      <div className="space-y-4">
        <button className="flex items-center space-x-2 hover:text-white">
          <HomeIcon className="h-5 w-5" />
          <p>Home</p>
        </button>
        {/* <button className="flex items-center space-x-2 hover:text-white">
          <SearchIcon className="h-5 w-5" />
          <p>Search</p>
        </button> */}
        {/* <button className="flex items-center space-x-2 hover:text-white">
          <LibraryIcon className="h-5 w-5" />
          <p>Your Library</p>
        </button> */}
        {/* <hr className="border-t-[0.1px] border-gray-900" /> */}

        {/* <button className="flex items-center space-x-2 hover:text-white">
          <PlusCircleIcon className="h-5 w-5" />
          <p>create Playlist</p>
        </button> */}
        {/* <button className="flex items-center space-x-2 hover:text-white">
          <HeartIcon className="h-5 w-5" />
          <p>Liked Songs</p>
        </button> */}
        {/* <button className="flex items-center space-x-2 hover:text-white">
          <RssIcon className="h-5 w-5" />
          <p>Your Episodes</p>
        </button> */}
        <hr className="border-t-[0.1px] border-gray-900" />
        {/* Playlists...  */}
        {playlists.map((playlist: any) => (
          <p
            key={playlist.id}
            // onClick={() => setPlaylist(playlist.id)}
            className="cursor-pointer hover:text-white"
          >
            {playlist.name}
          </p>
        ))}
      </div>
    </div>
  );
}
