export function camelize(str: string) {
  return str.split(/[^a-zA-Z0-9]+/g)
    .filter(s => s !== '')
    .map(s => s[0].toUpperCase() + s.slice(1))
    .join('');
}
