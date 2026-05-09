export async function onRequest(context) {
  const { request, env } = context
  const url = new URL(request.url)
  const targetPath = url.pathname.replace('/api/openai', '')
  const targetUrl = `https://api.openai.com${targetPath}${url.search}`

  const headers = new Headers(request.headers)
  headers.set('Authorization', `Bearer ${env.OPENAI_API_KEY}`)

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
