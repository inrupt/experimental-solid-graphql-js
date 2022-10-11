
import { HomeIcon } from '@heroicons/react/solid';
import { useEffect, useState } from 'react';

function Sidebar() {
  // const spotifyApi = useSpotify();
  // const { data: session, status } = useSession();
  const [playlists, setPlaylist] = useState([]);
  // const [playlistId, setPlaylistId] = useRecoilState(playlistIdState);

  useEffect(() => {
    // if (spotifyApi.getAccessToken()) {
    //   spotifyApi.getUserPlaylists().then((data) => {
    //     setPlaylist(data.body.items);
    //   });
    // }
  }, []);

  return (
    <div className="text-gray-500 p-5 text-sm border-r border-gray-900 overflow-y-scroll h-screen scrollbar-hide sm:max-w-[12rem] lg:max-w-[15rem] hidden md:inline-flex ">
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

export default Sidebar;
