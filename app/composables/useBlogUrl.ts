export function useBlogUrl() {
  function postUrl(post: { path: string }) {
    return post.path.replace('/blogs/', '/blog/')
  }
  return { postUrl }
}
