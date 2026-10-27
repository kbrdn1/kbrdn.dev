// Minutes to read a parsed content body, at about 200 words a minute
export const readingTime = (body: unknown) =>
  body ? Math.max(1, Math.ceil(JSON.stringify(body).split(/\s+/).length / 200)) : 0
