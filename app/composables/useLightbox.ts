/** The picture shown full size over the page (UiLightbox), after a click on an illustration */
export function useLightbox() {
  const picture = useState<{ src: string; alt: string } | null>('lightbox', () => null)
  return {
    picture,
    open: (src: string, alt: string) => (picture.value = { src, alt }),
    close: () => (picture.value = null),
  }
}
