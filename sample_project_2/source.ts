export const source = /* GraphQL */ `
{
  person(idf: "https://id.inrupt.com/jeswr") {
    idf,
    idfgh,
    label,
    mother {
      idf,
      label
    },
    father {
      label
    },
    motherLabel
  }
}
`
