import { getDirective } from '@graphql-tools/utils';

export function getSingleDirective(...args: Parameters<typeof getDirective>) {
  const directives = getDirective(...args);

  if (directives && directives.length > 1) {
    throw new Error(`At most 1 @${args[2]} directive allowed - received ${directives.length}`);
  }

  return directives?.[0];
}
