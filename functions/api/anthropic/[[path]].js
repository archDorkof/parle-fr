export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const targetPath = url.pathname.replace('/api/anthropic', '')
  const targetUrl = `https://api.anthropic.com${targetPath}${url.search}`

  const headers = new Headers(request.headers)
  headers.set('x-api-key', env.ANTHROPIC_API_KEY)
  headers.set('anthropic-version', '2023-06-01')
  headers.delete('anthropic-dangerous-direct-browser-access')
  headers.delete('origin')
  headers.delete('referer')

  const response = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: request.method !== 'GET' && request.method !== 'HEAD' ? request.body : undefined,
  })

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
  })
}
