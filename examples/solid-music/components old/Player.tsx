import { VolumeUpIcon as VolumeDownIcon, VolumeUpIcon } from '@heroicons/react/outline';
import {
  FastForwardIcon, PauseIcon,
  PlayIcon, RewindIcon
} from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

function Player() {
  // const url = "https://file-examples.com/storage/fe4999944e63361b793404c/2017/11/file_example_MP3_700KB.mp3";

  const url = "https://www.dropbox.com/s/wyoq5ku3ofpgce9/Angel%20No%20Vocal%20-%20Lost%20European.mp3?dl=1";

  const songInfo = {
    album: {
      images: [
        {
          url: "https://www.freemusicpublicdomain.com/wp-content/uploads/2014/09/cdoll.jpg"
        }
      ]
    },
    name: "Angel",
    artists: [
      {
        name: "Lost European"
      }
    ]
  }

  const router = useRouter();

  // const spotifyApi = useSpotify();
  // const { data: session, status } = useSession();
  // const [currentTrackId, setCurrentTrackId] =
  //   useRecoilState(currentTrackIdState);
  const [audio] = useState(typeof Audio === "undefined" ? undefined : new Audio(url));
  const [isPlaying, setPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);

  useEffect(() => {
    if (audio) {
      if (isPlaying) {
        if (audio.readyState) {
          audio.autoplay = true;
        } {
          audio.play()
        }
      } else {
        audio.autoplay = false;
        audio.pause()
      }
    }
  }, [isPlaying, audio, audio?.readyState]);

  useEffect(() => {
    if (audio) {
      audio.volume = volume
    }
  }, [volume, audio]);

  // TODO: Check this use effect
  useEffect(() => {
    if (audio !== undefined) {
      audio.preload = 'auto'
    }

    audio?.addEventListener('ended', () => setPlaying(false));
    return () => {
      audio?.removeEventListener('ended', () => setPlaying(false));
    };
  }, [audio]);

  useEffect(() => {
    console.log('use effect called with', router.pathname)
    // router.beforePopState(() => {
    //   console.log('before pop state called')
    // })

    // TODO: Fix this
    // @ts-ignore
    audio?.onplay?.(() => {
      setPlaying(true);
    });

    // Handle user triggered events (e.g. with keyboard)
    // TODO: Fix this
    // @ts-ignore
    audio?.onpause?.(() => {
      setPlaying(false);
    });
  }, [audio])

  // useLayoutEffect(() => {
  //   console.log('use layout effect called with', router.pathname)
  //   router.beforePopState(() => {
  //     console.log('before pop state called')
  //   })
  // })

  // const songInfo = useSongInfo(currentTrackId);

  // const fetchCurrentSong = () => {
  //   if (!songInfo) {
  //     spotifyApi.getMyCurrentPlayingTrack().then((data) => {
  //       setCurrentTrackId(data.body?.item?.id);
  //       spotifyApi.getMyCurrentPlaybackState().then((data) => {
  //         setIsPlaying(data.body?.is_playing);
  //       });
  //     });
  //   }
  // };

  const handlePlayPause = () => {
    setPlaying(!isPlaying)
    // spotifyApi.getMyCurrentPlaybackState().then((data) => {
    //   if (data.body?.is_playing) {
    //     spotifyApi.pause();
    //     setIsPlaying(false);
    //   } else {
    //     spotifyApi.play();
    //     setIsPlaying(true);
    //   }
    // });
  };

  // useEffect(() => {
  //   if (spotifyApi.getAccessToken() && !currentTrackId) {
  //     fetchCurrentSong();
  //     setVolume(50);
  //   }
  // }, [currentTrackId, spotifyApi, session]);

  // const debouncedAdjustVolume = useCallback(
  //   debounce((volume) => {
  //     spotifyApi.setVolume(volume).catch((err) => {});
  //   }, 300),
  //   []
  // );

  // useEffect(() => {
  //   if (volume > 0 && volume < 100) {
  //     debouncedAdjustVolume(volume);
  //   }
  // }, [volume]);

  // const url = "https://www.dropbox.com/s/wyoq5ku3ofpgce9/Angel%20No%20Vocal%20-%20Lost%20European.mp3?dl=1";
  // const albumCover = "https://www.freemusicpublicdomain.com/wp-content/uploads/2014/09/cdoll.jpg";
  // const artistName = "Lost European"
  // const title = "Angel"

  const [currentTime, setCurrentTime] = useState(audio?.currentTime ?? 0);

  // TODO: Work out how to avoid this triggering a massive amount of downloads
  // useEffect(() => {
  //   setInterval(() => {
  //     setCurrentTime(audio?.currentTime ?? 0);
  //     setPlaying(audio !== undefined && !audio.paused)
  //   }, 1000);
  // });


  return (
    <div className="h-24 bg-gradient-to-b from-gray-900 to-black text-white grid grid-cols-3 text-sm md:text-base px-2 md:px-8">
      <div className="flex items-center space-x-4">
        <img
          className="hidden md:inline h-12 w-12 object-cover"
          src={songInfo?.album.images?.[0].url}
          alt=""
        />
        <div>
          <h3>{songInfo?.name}</h3>
          <p className="text-sm text-gray-500">
            {songInfo?.artists?.[0]?.name}
          </p>
        </div>
      </div>
    
      {/* <div className="relative justify-evenly items-center"> */}
        <div className="relative flex-grow items-center justify-evenly">
         <div className="mt-2.5 mb-1 flex flex-grow items-center justify-evenly">
 {/* <SwitchHorizontalIcon className="w-5 h-5 cursor-pointer hover:scale-125 transition transform duration-100 ease-out" /> */}
 <RewindIcon className="w-5 h-5 cursor-pointer hover:scale-125 transition transform duration-100 ease-out" />
          {isPlaying ? (
            <PauseIcon
            // TODO: Set the proper Solid Color here
              className="w-10 h-10 cursor-pointer hover:scale-125 transition transform duration-100 ease-out text-[#9932CC]"
              onClick={handlePlayPause}
            />
          ) : (
            <PlayIcon
              className="w-10 h-10 cursor-pointer hover:scale-125 transition transform duration-100 ease-out"
              onClick={handlePlayPause}
            />
          )}
          <FastForwardIcon className="w-5 h-5 cursor-pointer hover:scale-125 transition transform duration-100 ease-out" />
          {/* <ReplyIcon className="w-5 h-5 cursor-pointer hover:scale-125 transition transform duration-100 ease-out" /> */}
       
         </div>
         {
          audio !== undefined && audio?.duration > 0 ?


            <div className="flex items-bottom justify-evenly range-sm border-none">
              {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60)}
              <input
                type="range"
                step={0.01}
                value={currentTime}
                onChange={(value) => {
                  setCurrentTime(Number(value.target.value));
                  audio.currentTime = Number(value.target.value);
                }}
                min={0}
                max={audio?.duration}
                className="flex-grow mx-3"
              />
              {Math.floor(audio?.duration / 60)}:{Math.floor(audio?.duration % 60)}
            </div>

            : <></>
        }
          </div>
        {/* TODO: Implement this */}
        {/* {
          audio?.duration > 0 ?


            <div className="flex items-bottom justify-evenly range-sm border-none">
              {Math.floor(currentTime / 60)}:{Math.floor(currentTime % 60)}
              <input
                type="range"
                step={0.01}
                value={currentTime}
                onChange={(value) => {
                  setCurrentTime(value.target.value);
                  audio.currentTime = value.target.value;
                }}
                min={0}
                max={audio?.duration}
                className="flex-grow mx-3"
              />
              {Math.floor(audio?.duration / 60)}:{Math.floor(audio?.duration % 60)}
            </div>

            : <></>
        } */}
      {/* </div> */}



      <div className="flex items-center space-x-3 md:space-x-4 justify-end p-5">
        <VolumeDownIcon
          className="w-5 h-5 cursor-pointer hover:scale-125 transition transform duration-100 ease-out"
          onClick={() => volume > 0 && setVolume(volume - 0.1)}
        />
        <input
          type="range"
          step={0.01}
          value={volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          min={0}
          max={1}
          className="w-14 md:w-36 "
        />
        <VolumeUpIcon
          className="w-5 h-5 cursor-pointer hover:scale-125 transition transform duration-100 ease-out"
          onClick={() => volume < 1 && setVolume(volume + 0.1)}
        />
      </div>
    </div>
  );
}

export default Player;
