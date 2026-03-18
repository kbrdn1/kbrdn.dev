const playlist = [
  'zamdane dernière pluie',
  'timal ultimatum',
  'maes arsenal',
  'shiro sagisu number one',
  'd-tecnolife uverworld',
  'timal story',
  'zamdane magicien',
  'official hige dandism same blue',
  'shiro sagisu treachery treacherously',
  'maes le moine',
]

export default defineEventHandler(async () => {
  const results = await Promise.all(
    playlist.map(async (query) => {
      try {
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
      } catch {
        // skip failed track
      }
      return null
    })
  )

  return results.filter(Boolean)
})
