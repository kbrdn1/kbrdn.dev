/**
 * The player floating at the bottom of the viewport: the music (LayoutMusicDock) or the article
 * reader (BlogListen). One at a time, they take the same place; the reader taking it pauses the
 * music.
 */
export const useDock = () => useState<'music' | 'speech' | null>('dock', () => null)
