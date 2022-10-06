import { ChevronDoubleRightIcon, ChevronRightIcon } from '@heroicons/react/outline';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { KeyboardEventHandler, MouseEventHandler, useContext, useEffect, useState } from 'react';
import { SessionContext } from '../context';

const providers = {
  "https://login.inrupt.com/": "Inrupt PodSpaces Europe",
  "https://solidcommunity.net/": "Solid Community Server",
  "https://solidweb.me/": "Solid Community Server",
  "https://pod.playground.solidlab.be/": "SolidLab Pod Playground",
  "http://localhost:3001/": "Local Test Server"
}

function Spinner() {
  return (
    <svg className="animate-spin mr-0.5 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  )
}

function ChevronOrSpinner(props: { onClick?: MouseEventHandler; loading?: boolean }) {
  return props.loading ?
    <Spinner /> :
    <ChevronRightIcon onClick={props.onClick} className="text-white h-5 w-5 p-1" />;
}

function Provider(props: { name: string; url: string }) {
  const { query } = useRouter();

  return (
    <Link
      shallow
      href={`?provider=${encodeURIComponent(props.url)}`}>
      <div className="flex my-2 items-center bg-[#2e2e2e] opacity-90 hover:opacity-80 cursor-pointer rounded-full pr-2">
        <a href={props.url}>
          <img
            className="rounded-full w-10 p-1  ml-1 h-10 object-cover"
            src={`${props.url}favicon.ico`}
            alt=""
          />
        </a>
        <h2 className="text-white flex-auto  p-2">{props.name}</h2>
        <ChevronOrSpinner loading={query.provider === props.url} />
      </div>
    </Link>
  )
}

function clean(url: string) {
  let provider = url;
  if (!provider.startsWith('http://') && !provider.startsWith('https://')) {
    provider = 'https://' + provider;
  }
  if (!provider.endsWith('/')) {
    provider += '/';
  }
  return provider;
}

function strip(url: string) {
  return url
    .replace(/^https:\/\//, '')
    .replace(/\/$/, '');
}

function Login() {
  const { query, push, pathname, replace } = useRouter();
  const [input, setInput] = useState(typeof query.provider === 'string' && query.provider in providers ? strip(query.provider) : '');
  // TODO: Fix this heuristic
  const [hidden, setHidden] = useState(input === '');
  const { context, setContext } = useContext(SessionContext);


  const submit = () => {
    if (input !== '') {
      let provider = input;
      if (!provider.startsWith('http://') && !provider.startsWith('https://')) {
        provider = 'https://' + provider;
      }
      if (!provider.endsWith('/')) {
        provider += '/';
      }
      setInput(strip(provider))
      push({ pathname, query: { provider } });
    }
  }

  const submitKey = (key: { code?: string }) => {
    if (key.code === 'Enter') {
      submit()
    }
  }

  if (typeof query.provider === 'string') {
    if (!context.requestInProgress) {
      context.session.login({
        oidcIssuer: query.provider,
        redirectUrl: window.location.origin + window.location.pathname,
        clientName: 'Solid Dotify',
      }).catch(reason => {
        replace({
          pathname: pathname,
          query: {
            // TODO: Make the paths match with the server redirect paths
            error: `${reason}`
          }
        });
      }).finally(() => {
        setContext({ session: context.session, requestInProgress: false });
      });
    }
  }


  useEffect(() => {
    if (query.code) {
      // context.session.onSessionRestore(() => {
      //   console.log('session retored')
      // })

      context.session.handleIncomingRedirect({
        url: window.location.href,
        // Add this to the index page with restore previous session:true
        restorePreviousSession: false,
      }).then(s => {
        if (s?.isLoggedIn) {
          push({ pathname: window.location.origin })
        } else {
          replace({
            pathname,
            query: {
              error: `Could not login`
            }
          });
        }
      }).catch(reason => {
        replace({
          pathname,
          query: {
            err: `${reason}`
          }
        });
      }).finally(() => {
        setContext({ session: context.session, requestInProgress: false });
      });
    }
  }, [query.code])

  return (
    <div
      className="h-screen flex flex-col text-white bg-gradient-to-t from-purple-900 via-gray-700 to-black"
    // style={{ backgroundColor: 'black' }}
    >
      <div className="border-b py-2 mx-5">

        <div className="flex items-center justify-center cursor-pointer">

          <a href='https://solidproject.org/'>
            <img
              className='w-20'
              src='https://solidproject.org/assets/img/solid-emblem.svg'
              alt="Solid Project Logo"
            />
          </a>
          <Link href='/'>
            <div className="text-white flex text-3xl p-5">
              Solid Music
            </div>
          </Link>
        </div>

      </div>


      <div className='flex flex-grow items-center justify-center'>
        <div className="absolute text-white w-6/12 flex-shrink: 0">
          <div className='flex justify-center'>

            To continue, select a Pod provider
          </div>

          <div className="flex-auto mt-4 mb-6 pb-3 border-b bg-grey border-[#2e2e2e]">
            {Object.entries(providers).map(([url, name]) =>
              <Provider
                key={url}
                url={url}
                name={name}
              />
            )}
          </div>


          <div className='flex justify-center'>

            or, manually enter the url
          </div>
          <div className="flex-auto mt-4 bg-grey border-[#2e2e2e]">
            <div
              onKeyDown={submitKey}
              className="flex items-center bg-[#2e2e2e] space-x-3 opacity-90 hover:opacity-80 cursor-pointer rounded-full pr-2">


              {/* TODO: Handle case of directing to page with pre-input URL */}
              {<img
                className={`rounded-full w-${hidden ? '0' : '10'} p-${hidden ? '0' : '1'} h-10 object-cover`}
                src={`${clean(input)}favicon.ico`}
                alt=""
                hidden={hidden}
                onLoad={() => { setHidden(false) }}
                onError={() => { setHidden(true) }}
                onAbort={() => { setHidden(true) }}
                onLoadStart={() => { setHidden(false) }}
              />}


              <input
                className="rounded-full w-30 p-1 pl-3.5 h-10 object-cover flex-auto text-black"
                type="url"
                name='provider'
                required
                value={input}
                onChange={e => setInput(e.target.value)}
                // TODO: Allow this to be just login.inrupt.com
                placeholder='login.inrupt.com'
              />
              <ChevronOrSpinner loading={query.provider === clean(input)} onClick={submit} />
              {/* <button className="text-white w-5 h-5 p-1 right"> <ChevronRightIcon /> </button> */}
            </div>
            
            {query.error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mt-10 rounded relative" role="alert">
              <strong className="font-bold">Error occurred during login: </strong>
              <span className="block sm:inline">{query.error}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg
                onClick={() => {
                  // Clear the error from the header
                  replace({ pathname })
                }}
                className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
              </span>
            </div>}
          </div>
        </div>


      </div>
      <div>
        <a href="https://inrupt.com/">
          <img
            className="h-20 p-3 items-left"
            // TODO: Fix this
            alt='Inrupt Logo (c)'
            src="/inruptLogo.svg"
          />
        </a>
      </div>

    </div>
  );
}

export default Login;
