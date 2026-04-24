export const useMurallonImagenesDestacadas = () => {
    const supabase = useSupabaseClient()
    const {
        uploadMurallonImagenDestacadaChica,
        uploadMurallonImagenDestacadaMediana,
        uploadMurallonImagenDestacadaGrande,
        deleteMurallonImagenDestacada,
        getMurallonImagenDestacadaUrl
    } = useStorage()
    const loading = ref(false)
    const imagenesDestacadas = ref([])
    const currentImagenDestacada = ref(null)
    const error = ref(null)

    const fetchImagenesDestacadas = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('murallon-imagenes-destacadas')
                .select('*')
                .order('created_at', { ascending: false })

            if (supabaseError) throw supabaseError

            const imagenesWithUrls = (data || []).map(imagen => ({
                ...imagen,
                imagen_chica: imagen.imagen_chica ? getMurallonImagenDestacadaUrl(imagen.imagen_chica) : null,
                imagen_mediana: imagen.imagen_mediana ? getMurallonImagenDestacadaUrl(imagen.imagen_mediana) : null,
                imagen_grande: imagen.imagen_grande ? getMurallonImagenDestacadaUrl(imagen.imagen_grande) : null
            }))

            imagenesDestacadas.value = imagenesWithUrls
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const fetchImagenDestacadaById = async (id) => {
        loading.value = true
        error.value = null
        currentImagenDestacada.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('murallon-imagenes-destacadas')
                .select('*')
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            const imagenWithUrls = {
                ...data,
                imagen_chica: data.imagen_chica ? getMurallonImagenDestacadaUrl(data.imagen_chica) : null,
                imagen_mediana: data.imagen_mediana ? getMurallonImagenDestacadaUrl(data.imagen_mediana) : null,
                imagen_grande: data.imagen_grande ? getMurallonImagenDestacadaUrl(data.imagen_grande) : null
            }

            currentImagenDestacada.value = imagenWithUrls
            return imagenWithUrls
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const fetchImagenDestacadaBySlug = async (slug) => {
        loading.value = true
        error.value = null
        currentImagenDestacada.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('murallon-imagenes-destacadas')
                .select('*')
                .eq('slug', slug)
                .single()

            if (supabaseError) throw supabaseError

            const imagenWithUrls = {
                ...data,
                imagen_chica: data.imagen_chica ? getMurallonImagenDestacadaUrl(data.imagen_chica) : null,
                imagen_mediana: data.imagen_mediana ? getMurallonImagenDestacadaUrl(data.imagen_mediana) : null,
                imagen_grande: data.imagen_grande ? getMurallonImagenDestacadaUrl(data.imagen_grande) : null
            }

            currentImagenDestacada.value = imagenWithUrls
            return imagenWithUrls
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const createImagenDestacada = async (imagenData, imagenChica, imagenMediana, imagenGrande) => {
        loading.value = true
        error.value = null

        try {
            const imagenType = imagenData.nombre?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w\-]/g, '') || 'imagen-hero-home'

            let imagenChicaPath = null
            let imagenMedianaPath = null
            let imagenGrandePath = null

            if (imagenChica) {
                imagenChicaPath = await uploadMurallonImagenDestacadaChica(imagenChica, imagenType)
            }

            if (imagenMediana) {
                imagenMedianaPath = await uploadMurallonImagenDestacadaMediana(imagenMediana, imagenType)
            }

            if (imagenGrande) {
                imagenGrandePath = await uploadMurallonImagenDestacadaGrande(imagenGrande, imagenType)
            }

            const finalImagenData = {
                ...imagenData,
                imagen_chica: imagenChicaPath,
                imagen_mediana: imagenMedianaPath,
                imagen_grande: imagenGrandePath,
                slug: null
            }

            const { data, error: supabaseError } = await supabase
                .from('murallon-imagenes-destacadas')
                .insert(finalImagenData)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            const dataWithUrls = {
                ...data,
                imagen_chica: data.imagen_chica ? getMurallonImagenDestacadaUrl(data.imagen_chica) : null,
                imagen_mediana: data.imagen_mediana ? getMurallonImagenDestacadaUrl(data.imagen_mediana) : null,
                imagen_grande: data.imagen_grande ? getMurallonImagenDestacadaUrl(data.imagen_grande) : null
            }

            imagenesDestacadas.value.unshift(dataWithUrls)
            return dataWithUrls
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateImagenDestacada = async (id, imagenData, imagenChica, imagenMediana, imagenGrande) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('murallon-imagenes-destacadas')
                .select('nombre, imagen_chica, imagen_mediana, imagen_grande')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const imagenType = currentData.nombre?.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '-').replace(/[^\w\-]/g, '')

            let imagenChicaPath = currentData?.imagen_chica
            let imagenMedianaPath = currentData?.imagen_mediana
            let imagenGrandePath = currentData?.imagen_grande

            if (imagenChica) {
                if (currentData?.imagen_chica) {
                    await deleteMurallonImagenDestacada(currentData.imagen_chica)
                }
                imagenChicaPath = await uploadMurallonImagenDestacadaChica(imagenChica, imagenType)
            }

            if (imagenMediana) {
                if (currentData?.imagen_mediana) {
                    await deleteMurallonImagenDestacada(currentData.imagen_mediana)
                }
                imagenMedianaPath = await uploadMurallonImagenDestacadaMediana(imagenMediana, imagenType)
            }

            if (imagenGrande) {
                if (currentData?.imagen_grande) {
                    await deleteMurallonImagenDestacada(currentData.imagen_grande)
                }
                imagenGrandePath = await uploadMurallonImagenDestacadaGrande(imagenGrande, imagenType)
            }

            const finalImagenData = {
                ...imagenData,
                imagen_chica: imagenChicaPath,
                imagen_mediana: imagenMedianaPath,
                imagen_grande: imagenGrandePath
            }

            const { data, error: supabaseError } = await supabase
                .from('murallon-imagenes-destacadas')
                .update(finalImagenData)
                .eq('id', id)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            const dataWithUrls = {
                ...data,
                imagen_chica: data.imagen_chica ? getMurallonImagenDestacadaUrl(data.imagen_chica) : null,
                imagen_mediana: data.imagen_mediana ? getMurallonImagenDestacadaUrl(data.imagen_mediana) : null,
                imagen_grande: data.imagen_grande ? getMurallonImagenDestacadaUrl(data.imagen_grande) : null
            }

            const index = imagenesDestacadas.value.findIndex(img => img.id === id)
            if (index !== -1) {
                imagenesDestacadas.value[index] = dataWithUrls
            }

            currentImagenDestacada.value = dataWithUrls
            return dataWithUrls
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteImagenDestacadaCompleta = async (id) => {
        loading.value = true
        error.value = null

        try {
            const { data: imagen, error: fetchError } = await supabase
                .from('murallon-imagenes-destacadas')
                .select('imagen_chica, imagen_mediana, imagen_grande')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const { error: supabaseError } = await supabase
                .from('murallon-imagenes-destacadas')
                .delete()
                .eq('id', id)

            if (supabaseError) throw supabaseError

            if (imagen?.imagen_chica) {
                await deleteMurallonImagenDestacada(imagen.imagen_chica)
            }
            if (imagen?.imagen_mediana) {
                await deleteMurallonImagenDestacada(imagen.imagen_mediana)
            }
            if (imagen?.imagen_grande) {
                await deleteMurallonImagenDestacada(imagen.imagen_grande)
            }

            imagenesDestacadas.value = imagenesDestacadas.value.filter(img => img.id !== id)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        imagenesDestacadas,
        currentImagenDestacada,
        loading,
        error,
        fetchImagenesDestacadas,
        fetchImagenDestacadaById,
        fetchImagenDestacadaBySlug,
        createImagenDestacada,
        updateImagenDestacada,
        deleteImagenDestacadaCompleta
    }
}
