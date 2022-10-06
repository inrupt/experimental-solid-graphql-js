
function Song({ order, track }: any) {
  // const spotifyApi = useSpotify();
  // const [currentTrackId, setCurrentTrackId] =
  //   useRecoilState(currentTrackIdState);
  // const [isPlaying, setIsPlaying] = useRecoilState(isPlayingState);

  // const playSong = () => {
  //   setCurrentTrackId(track.track.id);
  //   setIsPlaying(true);
  //   spotifyApi.play({
  //     uris: [track.track.uri],
  //   });
  // };

  return (
    <div
      className="grid grid-cols-2 text-[#929292] hover:text-white hover:bg-[#2b2d30] rounded-md cursor-pointer"
      onClick={() => {}}
    >
      <div className="flex items-center pl-3 space-x-4 py-1">
        <p>{order + 1}</p>
        <img
          className="h-10 w-10 object-cover"
          src={track.track.album.images[0].url}
          alt={track.track.album.name}
        />
        <div className="">
          <p className="w-36 lg:w-[20rem] truncate text-white">
            {track.track.name}
          </p>
          <p className="w-40">{track.track.artists.map((artist: any) => artist.name).join(", ")}</p>
        </div>
      </div>

      <div className="flex items-center justify-between ml-auto md:ml-0 pr-10">
        <p className="hidden md:inline w-40 lg:w-96 truncate">
          {track.track.album.name}
        </p>
        {/* TODO: Add Other data here */}
        {/* <p>{millisToMinutesAndSeconds(track.track.duration_ms)}</p> */}
      </div>
    </div>
  );
}

export default Song;
