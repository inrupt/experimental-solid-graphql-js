import { useState, useEffect, useRef, useImperativeHandle, Ref, LegacyRef, RefObject } from 'react';
import { VolumeUpIcon as VolumeDownIcon, VolumeUpIcon } from '@heroicons/react/outline';
import {
  FastForwardIcon, PauseIcon,
  PlayIcon, RewindIcon
} from '@heroicons/react/solid';
import Link from 'next/link';
import { FetchSongDocument, FetchSongQuery } from '../graphql';
import { Query } from './query';

export function Player(props: { song: string }) {
  return <Query
    document={FetchSongDocument}
    variables={{ id: props.song }}
    children={data => <LoadedPlayer {...data} />}
    fallback={() => <div className="h-24 bg-gradient-to-b from-gray-900 to-black text-white grid grid-cols-3 text-sm md:text-base px-2 md:px-8" />}
    error={(e) => <>Error {JSON.stringify(e, null, 2)}</>}
    requireLogin={true}
  />
}

function LoadedPlayer({ song }: FetchSongQuery): JSX.Element {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [ playing, setPlaying ] = useState(false);
  const [ volume, setVolume ] = useState(0.5);
  const { current } = audioRef;

  useEffect(() => {
    if (current) {
      if (playing) {
        if (current.readyState) {
          current.autoplay = true;
        } {
          current.play()
        }
      } else {
        current.autoplay = false;
        current.pause()
      }
    }
  }, [playing, current?.readyState]);
  
  // TODO: Don't trigger reload of data on volume change
  useEffect(() => {
    if (current) {
      current.volume = volume
    }
  }, [volume, current]);

  function setTime(time: number) {
    if (current) {
      current.currentTime = time;
    }
  }

  return (
    <div className="h-24 bg-gradient-to-b from-gray-900 to-black text-white grid grid-cols-3 text-sm md:text-base px-2 md:px-8">
      <audio ref={audioRef} src={song.url} />
      <SongDetails
        image={song.album.url}
        imageName={song.album.name}
        name={song.title}
        artist={song.artist?.[0]?.name}
      />
      <Controls
        setPlaying={setPlaying}
        setTime={setTime}
        playing={playing}
        audioRef={audioRef}
      />
      <Volume volume={volume} setVolume={setVolume} />
    </div>
  )
}

interface ControlProps {
  audioRef: RefObject<HTMLAudioElement>
  playing: boolean;
  setPlaying: (playing: boolean) => void;
  setTime: (number: number) => void;
}

function Controls(props: ControlProps) {
  return (
    <div className="relative flex-grow items-center justify-evenly">
      <PlayPause {...props} />
      {props.audioRef.current && <AudioScroll {...props} />}
    </div>
  )
}

function PlayPause(props: ControlProps) {
  return (
    <div className="mt-2.5 mb-1 flex flex-grow items-center justify-evenly">
      <RewindIcon
        className="w-5 h-5 cursor-pointer hover:scale-125 transition transform duration-100 ease-out"
        onClick={() => props.setTime(Math.max(0, props.audioRef.current?.currentTime ?? 0 - 30))}
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
        onClick={() => props.setTime(Math.min(props.audioRef.current?.duration ?? 0, props.audioRef.current?.currentTime ?? 0 + 30))}
      />
    </div>
  )
}

function AudioScroll(props: { audioRef: RefObject<HTMLAudioElement>; setTime: (number: number) => void; }) {
  const [time, setTime] = useState(props.audioRef.current?.currentTime ?? 0);

  useEffect(() => {
    setInterval(() => {
      setTime(props.audioRef.current?.currentTime ?? 0);
    }, 500);
  }, [])
  
  return (
    <div className="flex items-bottom justify-evenly range-sm border-none">
      <DisplayTime time={time} />
      <input
        type="range"
        step={0.01}
        value={time}
        onChange={e => props.setTime(parseFloat(e.target.value))}
        min={0}
        max={props.audioRef.current?.duration}
        className="flex-grow mx-3"
      />
      <DisplayTime time={props.audioRef.current?.duration ?? 0} />
    </div>
  )
}

function DisplayTime(props: { time: number }) {
  return <>{Math.floor(props.time / 60)}:{Math.floor(props.time % 60)}</>
}

function SongDetails(props: { image?: string; name: string; artist: string, imageName: string }) {
  return (
    <div className="flex items-center space-x-4">
      {/* TODO: Make this a link */}
      <Link href={'/'}>
      <img
        className="hidden md:inline h-12 w-12 object-cover cursor-pointer"
        src={props.image}
        alt={props.imageName}
      />
      </Link>
      <div>
        <h3 className="hover:underline">
          {/* TODO: Make this a link */}
        <Link href={'/'}>
        {props.name}
        </Link>
        </h3>
        <p className="text-sm text-gray-500 hover:underline">
          {/* TODO: Make this a link */}
          <Link href={'/'}>
            {props.artist}
          </Link>
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
