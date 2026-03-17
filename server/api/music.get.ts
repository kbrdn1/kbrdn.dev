export default defineEventHandler(async () => {
  const query = 'zamdane dernière pluie'
  const res = await $fetch<{ data: Array<{
    title: string
    artist: { name: string }
    album: { title: string; cover_medium: string }
    preview: string
    link: string
  }> }>(`https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=1`)
  if (res.data?.[0]) {
    const track = res.data[0]
    return {
      title: track.title,
      artist: track.artist.name,
      album: track.album.title,
      cover: track.album.cover_medium,
      preview: track.preview,
      link: track.link,
    }
  }
  return null
})
