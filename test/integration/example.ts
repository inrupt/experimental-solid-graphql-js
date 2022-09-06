import gql from 'graphql-tag'

const query = gql`
  query userFriends {
    # Questions:
    # - How to handle IDs since in general we are probably wanting to map to URIs
    user {
      name1
      friends {
        name2
      }
    }
  }
`

const x = {};

// const query = gql`
//   {
//     # Questions:
//     # - How to handle IDs since in genera we are probably wanting to map to URIs
//     # @id(":Jesse") <- Should also allow this
//     user @iri(${x}) {
//       name
//       friends
//     }
//   }
// `



