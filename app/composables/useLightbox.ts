// The element that opened the picture, given the focus back on close. Not document.activeElement:
// Safari does not focus a button on a click, so that is the body. Client only, never reactive
let opener: HTMLElement | null = null

/** The picture shown full size over the page (UiLightbox), after a click on an illustration */
export function useLightbox() {
  const picture = useState<{ src: string; alt: string } | null>('lightbox', () => null)
  return {
    picture,
    open: (src: string, alt: string, from?: EventTarget | null) => {
      opener = from instanceof HTMLElement ? from : null
      picture.value = { src, alt }
    },
    close: () => (picture.value = null),
    /** What opened the picture, once */
    takeOpener: () => {
      const element = opener
      opener = null
      return element
    },
  }
}
