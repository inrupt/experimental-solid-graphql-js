import Head from 'next/head';
import { useState } from 'react';
// import Center from '../components old/Center'
// import Sidebar from '../components old/Sidebar'
import { Player, PlayList } from '../components';
import { useRouter } from 'next/router';

export default function Home() {
  // const [ song, setSong ] = useState('http://example.org/song#the_end')
  const { query: { song } } = useRouter()

  return (
    <div className="bg-black h-screen overflow-hidden">
      <Head>
        <title>Solid Music</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex">
        {/* <Sidebar /> */}
        {/* <Center /> */}
        <PlayList playlist='http://example.org/playlist#a'/>
      </main>

      {typeof song === 'string' &&
        <div className="sticky bottom-0">
          <Player song={song} />
        </div>
      }
    </div>
  )
}
