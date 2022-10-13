export function camelize(str: string) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) =>
    index === 0 ? word.toLowerCase() : word.toUpperCase()
  ).replace(/[^_a-zA-Z0-9]+/g, '');
}
