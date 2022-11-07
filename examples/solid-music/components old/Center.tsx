import { LoginIcon, LogoutIcon } from "@heroicons/react/outline";
import Link from "next/link";
import { useContext, useEffect, useState } from "react";
import Songs from "./Songs";

const colors = [
  "from-indigo-500",
  "from-blue-500",
  "from-green-500",
  "from-red-500",
  "from-yellow-500",
  "from-pink-500",
  "from-purple-500",
];

import { playlist, session } from "./data";
import { SessionContext } from "../context";
import { solidQuery } from "../graphql";

function Center() {
  // const { data: session } = useSession();
  // const spotifyApi = useSpotify();
  const [color, setColor] = useState(null);
  // const playlistId = useRecoilValue(playlistIdState);
  // const [playlist, setPlaylist] = useRecoilState(playlistState);
  const [isActive, setActive] = useState("false");
  const { context } = useContext(SessionContext);

  useEffect(() => {
    // setColor(shuffle(colors).pop());
  }, []);

  useEffect(() => {
    // spotifyApi
    //   .getPlaylist(playlistId)
    //   .then((data) => {
    //     setPlaylist(data.body);
    //   })
    //   .catch((err) => console.log('Something went wrong!', err));
  }, []);

  useEffect(() => {
    solidQuery;
  }, []);

  const handleToggle = () => {
    // setActive(!isActive);
  };

  return (
    <div className="flex-grow h-screen overflow-y-scroll scrollbar-hide select-none relative bg-gradient-to-t from-purple-900 to-black">
      <header className="absolute top-5 right-5" onClick={handleToggle}>
        {!context.session.info.isLoggedIn ? (
          <Link href="/login">
            <div className="flex items-center py-2 bg-white space-x-1.5 opacity-90 hover:opacity-80 cursor-pointer rounded-full pr-2">
              <h2 className="ml-4">Sign In</h2>
              <br />
              <LoginIcon className="w-5 h-5" />
              {/* <ChevronDoo className="text-white h-5 w-5" /> */}
            </div>
          </Link>
        ) : (
          <div className="flex items-center bg-[#2e2e2e] space-x-3 opacity-90 hover:opacity-80 cursor-pointer rounded-full pr-2">
            <img
              className="rounded-full w-10 p-1 h-10 object-cover"
              src={session?.user.image}
              alt="user image"
            />
            <h2 className="text-white">{session?.user.name}</h2>
            <br />
            <LogoutIcon className="text-white w-5 h-5" />
            {/* <ChevronDoo className="text-white h-5 w-5" /> */}
          </div>
        )}
      </header>
      <div
        className={
          `h-10 w-52 rounded-sm bg-[#2e2e2e] text-white absolute right-8 top-[4.3rem] flex-col` +
          " " +
          `${isActive ? "hidden" : "flex"}`
        }
      >
        <div
          className="flex items-center justify-between cursor-pointer px-3 py-2"
          // TODO: Implement Logout
          // onClick={signOut}
        >
          <p className="hover:bg-[#2b2d30]">Log out</p>
          <LogoutIcon className="w-5 h-5" />
        </div>
      </div>
      <section
        className={`flex items-end space-x-7 bg-gradient-to-b to-black ${color} p-5 text-white bg-[#2e2e2e] rounded m-2.5`}
      >
        <img
          className="h-44 w-44 rounded shadow-2xl object-cover"
          src={playlist?.images?.[0]?.url}
          alt="album image"
        />
        <div>
          <p>Playlist</p>
          <h1 className="text-2xl md:text-3xl xl:text-5xl">{playlist?.name}</h1>
        </div>
      </section>

      <div>
        <Songs />
      </div>
    </div>
  );
}

export default Center;
