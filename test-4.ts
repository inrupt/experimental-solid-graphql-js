import { makeExecutableSchema } from '@graphql-tools/schema';
import { mapSchema } from '@graphql-tools/utils'
// import { renameDirective } from 'fake-rename-directive-package'
// import { authDirective } from 'fake-auth-directive-package'
// import { lowerDirective } from 'fake-lower-directive-package'

const typeDefs = /* GraphQL */ `
  directive @lower on FIELD_DEFINITION

  type Person @rename(to: "Human") {
    name: String!
    currentDateMinusDateOfBirth: Int @rename(to: "age")
    email: String! @auth(requires: "member") @lower
    phoneNumber: String! @auth(requires: "member")
  }
`

// const directiveTransformers = [
//   renameDirective('rename').renameDirectiveTransformer,
//   authDirective('auth').authDirectiveTransformer,
//   lowerDirective('lower').lowerDirectiveTransformer
// ]

let schema = makeExecutableSchema({
  typeDefs,
  // assumeValidSDL: true
})

schema = makeExecutableSchema({ typeDefs: schema })

// schema = directiveTransformers.reduce((curSchema, transformer) => transformer(curSchema), schema)