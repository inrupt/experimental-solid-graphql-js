import Head from 'next/head';
import { useContext } from 'react';
// import Center from '../components old/Center'
// import Sidebar from '../components old/Sidebar'
import { Player, PlayList } from '../components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { LoginIcon, LogoutIcon } from '@heroicons/react/outline';
import { SessionContext } from '../context';
import { Query } from '../components/query';
import { FetchUserDocument } from '../graphql';

// function LoggedIn() {

// }

// function LogIn() {
//   return <Query
//     document={FetchUserDocument}
//   >
//     {
//       (data) => <div className="flex items-center bg-[#2e2e2e] space-x-3 opacity-90 hover:opacity-80 cursor-pointer rounded-full pr-2">
//         <img
//           className="rounded-full w-10 p-1 h-10 object-cover"
//           src={data.user.image.href}
//           alt="user image"
//         />
//         <h2 className="text-white">{data.user.name}</h2>
//         <br />
//         {/* TODO: Implement this */}
//         <LogoutIcon className="text-white w-5 h-5" />
//       </div>

//     }
//   </Query>


//   const { context } = useContext(SessionContext);

//   <header className="absolute top-5 right-5">
//     {
//       !context.session.info.isLoggedIn ?

//         <Link href='/login'>
//           <div className="flex items-center py-2 bg-white space-x-1.5 opacity-90 hover:opacity-80 cursor-pointer rounded-full pr-2">

//             <h2 className="ml-4">Sign In</h2>
//             <br />
//             <LoginIcon className="w-5 h-5" />
//             {/* <ChevronDoo className="text-white h-5 w-5" /> */}
//           </div>
//         </Link>
//         :
//         <div className="flex items-center bg-[#2e2e2e] space-x-3 opacity-90 hover:opacity-80 cursor-pointer rounded-full pr-2">
//           <img
//             className="rounded-full w-10 p-1 h-10 object-cover"
//             src={session?.user.image}
//             alt="user image"
//           />
//           <h2 className="text-white">{session?.user.name}</h2>
//           <br />
//           <LogoutIcon className="text-white w-5 h-5" />
//           {/* <ChevronDoo className="text-white h-5 w-5" /> */}
//         </div>
//     }

//   </header>
// }

export default function Home() {
  // const [ song, setSong ] = useState('http://example.org/song#the_end')
  const { query: { currentSong } } = useRouter()

  return (
    <div className="bg-black h-screen overflow-hidden">
      <Head>
        <title>Solid Music</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>



      <main className="flex">
        {/* <Sidebar /> */}
        {/* <Center /> */}
        <PlayList playlist='http://example.org/playlist#a' />
      </main>

      {typeof currentSong === 'string' &&
        <div className="sticky bottom-0">
          <Player song={currentSong} />
        </div>
      }
    </div>
  )
}
