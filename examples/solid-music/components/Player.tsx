import { VolumeUpIcon as VolumeDownIcon, VolumeUpIcon } from '@heroicons/react/outline';
import {
  FastForwardIcon, PauseIcon,
  PlayIcon, RewindIcon
} from '@heroicons/react/solid';
import { FetchSongDocument, FetchSongQuery } from '../graphql';
import { Query } from './query';

export default function Player(props: { song: string }) {
  return <Query
    document={FetchSongDocument}
    variables={{ id: props.song }}
    // children={data => <LoadedPlayer {...data} />}
    children={data => <>Loaded with {JSON.stringify(data.song, null, 2)}</>}
    fallback={() => <>Fallback</>}
    error={(e) => <>Error {JSON.stringify(e, null, 2)}</>}
    requireLogin={true}
  />
}

function LoadedPlayer({ song }: FetchSongQuery): JSX.Element {
  return (
    <div>
      Player for {song.title}
    </div>
  )
  
  // return (
  //   <div className="h-24 bg-gradient-to-b from-gray-900 to-black text-white grid grid-cols-3 text-sm md:text-base px-2 md:px-8">
  //     <div className="relative flex-grow items-center justify-evenly">
  //     <p className="text-sm text-gray-500">
  //     Player for {song.title}
  //     </p>
        
  //     </div>
  //   </div>
  // )
}

interface ControlProps {
  time: number;
  duration: number;
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  setTime: (number: number) => void;
}



function Controls(props: ControlProps) {
  return (
    <div className="relative flex-grow items-center justify-evenly">
      <PlayPause {...props} />
      <AudioScroll {...props} />
    </div>
  )
}

function PlayPause(props: ControlProps) {
  return (
    <div className="mt-2.5 mb-1 flex flex-grow items-center justify-evenly">
      <RewindIcon
        className="w-5 h-5 cursor-pointer hover:scale-125 transition transform duration-100 ease-out"
        onClick={() => props.setTime(Math.max(0, props.time - 30))}
      />
      {props.playing ? (
        <PauseIcon
          // TODO: Set the proper Solid Color here
          className="w-10 h-10 cursor-pointer hover:scale-125 transition transform duration-100 ease-out text-[#9932CC]"
          onClick={() => props.setPlaying(false)}
        />
      ) : (
        <PlayIcon
          className="w-10 h-10 cursor-pointer hover:scale-125 transition transform duration-100 ease-out"
          onClick={() => props.setPlaying(true)}
        />
      )}
      <FastForwardIcon
        className="w-5 h-5 cursor-pointer hover:scale-125 transition transform duration-100 ease-out"
        onClick={() => props.setTime(Math.min(props.duration, props.time + 30))}
      />
    </div>
  )
}

function AudioScroll(props: { time: number; duration: number; setTime: (number: number) => void; }) {
  return (
    <div className="flex items-bottom justify-evenly range-sm border-none">
      <DisplayTime time={props.time} />
      <input
        type="range"
        step={0.01}
        value={props.time}
        onChange={e => props.setTime(parseFloat(e.target.value))}
        min={0}
        max={props.duration}
        className="flex-grow mx-3"
      />
      <DisplayTime time={props.duration} />
    </div>
  )
}

function DisplayTime(props: { time: number }) {
  return <>{Math.floor(props.time / 60)}:{Math.floor(props.time % 60)}</>
}

function SongDetails(props: { image: string; name: string; artist: string, imageName: string }) {
  return (
    <div className="flex items-center space-x-4">
      <img
        className="hidden md:inline h-12 w-12 object-cover"
        src={props.image}
        alt={props.imageName}
      />
      <div>
        <h3>{props.name}</h3>
        <p className="text-sm text-gray-500">
          {props.artist}
        </p>
      </div>
    </div>
  )
}

function Volume({ volume, setVolume }: { volume: number, setVolume: (volume: number) => void }) {
  return (
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
  )
}
