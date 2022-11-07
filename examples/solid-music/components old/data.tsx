// Some static data for testing purposes

export const songInfo = {
  album: {
    images: [
      {
        url: "https://www.freemusicpublicdomain.com/wp-content/uploads/2014/09/cdoll.jpg",
      },
    ],
  },
  name: "Angel",
  artists: [
    {
      name: "Lost European",
    },
  ],
  id: 1,
};

export const session = {
  user: {
    image: "https://avatars.githubusercontent.com/u/63333554?v=4",
    name: "jeswr",
  },
};

export const playlist = {
  name: "The Angels",
  images: [
    {
      url: "https://www.freemusicpublicdomain.com/wp-content/uploads/2014/09/cdoll.jpg",
    },
  ],
  tracks: {
    items: [
      {
        track: songInfo,
      },
      {
        track: {
          album: {
            images: [
              {
                url: "https://e7.pngegg.com/pngimages/275/504/png-clipart-lucifer-demon-devil-demon-fictional-character-lucifer-thumbnail.png",
              },
            ],
          },
          name: "Demon",
          artists: [
            {
              name: "Lost European",
            },
            {
              name: "The Demons",
            },
          ],
          id: 5,
        },
      },
    ],
  },
};

// const playlist = {
//   tracks: {
// items: [
//   {
//     track: {
//       id: 1,
//       album: {

//       }
//     },
//   }
//     ]
//   }
// }
