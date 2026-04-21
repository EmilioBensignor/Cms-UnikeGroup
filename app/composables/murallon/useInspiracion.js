export const useMurallonInspiracion = () => {
    const supabase = useSupabaseClient()
    const {
        uploadMurallonInspiracionImage,
        deleteMurallonInspiracionImage,
        getMurallonInspiracionImageUrl
    } = useStorage()
    const loading = ref(false)
    const inspiraciones = ref([])
    const currentInspiracion = ref(null)
    const error = ref(null)

    const fetchInspiraciones = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('inspiracion-murallon')
                .select('*')
                .order('orden', { ascending: true })

            if (supabaseError) throw supabaseError

            const dataWithUrls = (data || []).map(item => ({
                ...item,
                imagen_antes: item.imagen_antes ? getMurallonInspiracionImageUrl(item.imagen_antes) : null,
                imagen_despues: item.imagen_despues ? getMurallonInspiracionImageUrl(item.imagen_despues) : null,
                imagen_antes_path: item.imagen_antes,
                imagen_despues_path: item.imagen_despues
            }))

            inspiraciones.value = dataWithUrls
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const fetchInspiracionById = async (id) => {
        loading.value = true
        error.value = null
        currentInspiracion.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('inspiracion-murallon')
                .select('*')
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            currentInspiracion.value = {
                ...data,
                imagen_antes: data.imagen_antes ? getMurallonInspiracionImageUrl(data.imagen_antes) : null,
                imagen_despues: data.imagen_despues ? getMurallonInspiracionImageUrl(data.imagen_despues) : null,
                imagen_antes_path: data.imagen_antes,
                imagen_despues_path: data.imagen_despues
            }
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const createInspiracion = async (inspiracionData, imagenAntesFile, imagenDespuesFile) => {
        loading.value = true
        error.value = null

        try {
            let imagenAntesPath = null
            let imagenDespuesPath = null

            if (imagenAntesFile) {
                imagenAntesPath = await uploadMurallonInspiracionImage(imagenAntesFile, inspiracionData.titulo, 'antes')
            }

            if (imagenDespuesFile) {
                imagenDespuesPath = await uploadMurallonInspiracionImage(imagenDespuesFile, inspiracionData.titulo, 'despues')
            }

            const { data, error: supabaseError } = await supabase
                .from('inspiracion-murallon')
                .insert([{
                    titulo: inspiracionData.titulo,
                    orden: inspiracionData.orden || 0,
                    imagen_antes: imagenAntesPath,
                    imagen_despues: imagenDespuesPath
                }])
                .select()

            if (supabaseError) throw supabaseError

            return data[0]
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateInspiracion = async (id, inspiracionData, imagenAntesFile, imagenDespuesFile) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('inspiracion-murallon')
                .select('imagen_antes, imagen_despues')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            let imagenAntesPath = currentData.imagen_antes
            let imagenDespuesPath = currentData.imagen_despues

            if (imagenAntesFile) {
                if (currentData.imagen_antes) {
                    try {
                        await deleteMurallonInspiracionImage(currentData.imagen_antes)
                    } catch (err) {
                        console.warn('Error al borrar imagen antes anterior:', err)
                    }
                }
                imagenAntesPath = await uploadMurallonInspiracionImage(imagenAntesFile, inspiracionData.titulo, 'antes')
            }

            if (imagenDespuesFile) {
                if (currentData.imagen_despues) {
                    try {
                        await deleteMurallonInspiracionImage(currentData.imagen_despues)
                    } catch (err) {
                        console.warn('Error al borrar imagen después anterior:', err)
                    }
                }
                imagenDespuesPath = await uploadMurallonInspiracionImage(imagenDespuesFile, inspiracionData.titulo, 'despues')
            }

            const { data, error: supabaseError } = await supabase
                .from('inspiracion-murallon')
                .update({
                    titulo: inspiracionData.titulo,
                    orden: inspiracionData.orden,
                    imagen_antes: imagenAntesPath,
                    imagen_despues: imagenDespuesPath
                })
                .eq('id', id)
                .select()

            if (supabaseError) throw supabaseError

            return data[0]
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteInspiracion = async (id) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('inspiracion-murallon')
                .select('imagen_antes, imagen_despues')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            if (currentData.imagen_antes) {
                try {
                    await deleteMurallonInspiracionImage(currentData.imagen_antes)
                } catch (err) {
                    console.warn('Error al borrar imagen antes:', err)
                }
            }

            if (currentData.imagen_despues) {
                try {
                    await deleteMurallonInspiracionImage(currentData.imagen_despues)
                } catch (err) {
                    console.warn('Error al borrar imagen después:', err)
                }
            }

            const { error: supabaseError } = await supabase
                .from('inspiracion-murallon')
                .delete()
                .eq('id', id)

            if (supabaseError) throw supabaseError

            inspiraciones.value = inspiraciones.value.filter(item => item.id !== id)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        loading: readonly(loading),
        inspiraciones: readonly(inspiraciones),
        currentInspiracion: readonly(currentInspiracion),
        error: readonly(error),
        fetchInspiraciones,
        fetchInspiracionById,
        createInspiracion,
        updateInspiracion,
        deleteInspiracion
    }
}
