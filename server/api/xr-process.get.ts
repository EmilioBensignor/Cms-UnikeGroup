export default defineEventHandler(async (event) => {
  const { id } = getQuery(event) as { id: string }

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing producto id parameter'
    })
  }

  const config = useRuntimeConfig()

  if (!config.supabaseServiceKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Supabase service key not configured'
    })
  }

  try {
    const url = `${config.public.supabase.url}/functions/v1/process-xr?producto_id=${id}`

    // Llamada server→server con Service Role
    const result = await $fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${config.supabaseServiceKey}`
      }
    })

    return { success: true, result }
  } catch (error) {
    console.error('Error calling process-xr function:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to process XR for producto'
    })
  }
})