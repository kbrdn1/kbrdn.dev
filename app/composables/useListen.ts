/**
 * What the article's headings (BlogListenFrom) share with its reader (BlogListen): whether it
 * has a voice to read with, and a request to read from a heading (its id), which the reader
 * takes and clears.
 */
export const useListen = () => ({
  ready: useState('listen-ready', () => false),
  from: useState<string | null>('listen-from', () => null),
})
