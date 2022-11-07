import Head from "next/head";
import { useContext } from "react";
// import Center from '../components old/Center'
// import Sidebar from '../components old/Sidebar'
import { Player, PlayList, Sidebar, Album } from "../components";
import { useRouter } from "next/router";
import Link from "next/link";
import { LoginIcon, LogoutIcon } from "@heroicons/react/outline";
import { SessionContext } from "../context";
import { Query } from "../components/query";
import { FetchUserDocument } from "../graphql";

function Login() {
  return (
    <Link href="/login">
      <div className="flex items-center py-2 bg-white space-x-1.5 opacity-90 hover:opacity-80 cursor-pointer rounded-full pr-2">
        <h2 className="ml-4">Sign In</h2>
        <br />
        <LoginIcon className="w-5 h-5" />
      </div>
    </Link>
  );
}

function LoginOrLogout() {
  return (
    <Query
      document={FetchUserDocument}
      error={Login}
      fallback={Login}
      requireLogin={true}
      variables={{}}
    >
      {(data) => (
        <div className="flex items-center bg-[#2e2e2e] space-x-3 opacity-90 hover:opacity-80 cursor-pointer rounded-full pr-2">
          <img
            className="rounded-full w-10 p-1 h-10 object-cover"
            src={data.user.image.href}
            alt="user image"
          />
          <h2 className="text-white">{data.user.name}</h2>
          <br />
          {/* TODO: Implement this */}
          <LogoutIcon className="text-white w-5 h-5" />
        </div>
      )}
    </Query>
  );
}

export default function Home() {
  const {
    query: { currentSong, currentPlaylist, currentAlbum },
  } = useRouter();

  return (
    <div className="bg-black h-screen overflow-hidden">
      <Head>
        <title>Solid Music</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="absolute top-5 right-5">
        <LoginOrLogout />
      </header>

      <main className="flex">
        <Sidebar />
        {/* <Center /> */}
        {typeof currentPlaylist === "string" && currentPlaylist.length && (
          <PlayList playlist={currentPlaylist} />
        )}
        {typeof currentAlbum === "string" && currentAlbum.length && (
          <Album album={currentAlbum} />
        )}
      </main>

      {typeof currentSong === "string" && (
        <div className="sticky bottom-0">
          <Player song={currentSong} />
        </div>
      )}
    </div>
  );
}
