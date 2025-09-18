export const useWaterplastImagenesDestacadas = () => {
    const supabase = useSupabaseClient()
    const {
        uploadImagenDestacadaChica,
        uploadImagenDestacadaMediana,
        uploadImagenDestacadaGrande,
        deleteImagenDestacada,
        getImagenDestacadaUrl
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
                .from('waterplast-imagenes-destacadas')
                .select('*')
                .order('created_at', { ascending: false })

            if (supabaseError) throw supabaseError

            const imagenesWithUrls = (data || []).map(imagen => ({
                ...imagen,
                imagen_chica: imagen.imagen_chica ? getImagenDestacadaUrl(imagen.imagen_chica) : null,
                imagen_mediana: imagen.imagen_mediana ? getImagenDestacadaUrl(imagen.imagen_mediana) : null,
                imagen_grande: imagen.imagen_grande ? getImagenDestacadaUrl(imagen.imagen_grande) : null
            }))

            imagenesDestacadas.value = imagenesWithUrls
        } catch (err) {
            error.value = err.message
            console.error('Error al obtener imágenes destacadas:', err)
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
                .from('waterplast-imagenes-destacadas')
                .select('*')
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            const imagenWithUrls = {
                ...data,
                imagen_chica: data.imagen_chica ? getImagenDestacadaUrl(data.imagen_chica) : null,
                imagen_mediana: data.imagen_mediana ? getImagenDestacadaUrl(data.imagen_mediana) : null,
                imagen_grande: data.imagen_grande ? getImagenDestacadaUrl(data.imagen_grande) : null
            }

            currentImagenDestacada.value = imagenWithUrls
            return imagenWithUrls
        } catch (err) {
            error.value = err.message
            console.error('Error al obtener imagen destacada:', err)
            throw err
        } finally {
            loading.value = false
        }
    }


    const updateImagenDestacada = async (id, imagenData, imagenChica, imagenMediana, imagenGrande) => {
        loading.value = true
        error.value = null

        try {
            // Obtener imagen destacada actual para conocer las imágenes anteriores y el nombre
            const { data: currentData, error: fetchError } = await supabase
                .from('waterplast-imagenes-destacadas')
                .select('nombre, imagen_chica, imagen_mediana, imagen_grande')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const imagenNombre = currentData?.nombre || 'imagen-destacada'

            let imagenChicaPath = currentData?.imagen_chica
            let imagenMedianaPath = currentData?.imagen_mediana
            let imagenGrandePath = currentData?.imagen_grande

            // Actualizar imagen chica si hay una nueva
            if (imagenChica) {
                if (currentData?.imagen_chica) {
                    await deleteImagenDestacada(currentData.imagen_chica)
                }
                imagenChicaPath = await uploadImagenDestacadaChica(imagenChica)
            }

            // Actualizar imagen mediana si hay una nueva
            if (imagenMediana) {
                if (currentData?.imagen_mediana) {
                    await deleteImagenDestacada(currentData.imagen_mediana)
                }
                imagenMedianaPath = await uploadImagenDestacadaMediana(imagenMediana)
            }

            // Actualizar imagen grande si hay una nueva
            if (imagenGrande) {
                if (currentData?.imagen_grande) {
                    await deleteImagenDestacada(currentData.imagen_grande)
                }
                imagenGrandePath = await uploadImagenDestacadaGrande(imagenGrande)
            }

            const finalImagenData = {
                ...imagenData,
                imagen_chica: imagenChicaPath,
                imagen_mediana: imagenMedianaPath,
                imagen_grande: imagenGrandePath
            }

            const { data, error: supabaseError } = await supabase
                .from('waterplast-imagenes-destacadas')
                .update(finalImagenData)
                .eq('id', id)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            // Convertir las imágenes a URLs completas para mostrar
            const dataWithUrls = {
                ...data,
                imagen_chica: data.imagen_chica ? getImagenDestacadaUrl(data.imagen_chica) : null,
                imagen_mediana: data.imagen_mediana ? getImagenDestacadaUrl(data.imagen_mediana) : null,
                imagen_grande: data.imagen_grande ? getImagenDestacadaUrl(data.imagen_grande) : null
            }

            const index = imagenesDestacadas.value.findIndex(img => img.id === id)
            if (index !== -1) {
                imagenesDestacadas.value[index] = dataWithUrls
            }

            currentImagenDestacada.value = dataWithUrls
            return dataWithUrls
        } catch (err) {
            error.value = err.message
            console.error('Error al actualizar imagen destacada:', err)
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
                .from('waterplast-imagenes-destacadas')
                .select('imagen_chica, imagen_mediana, imagen_grande')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const { error: supabaseError } = await supabase
                .from('waterplast-imagenes-destacadas')
                .delete()
                .eq('id', id)

            if (supabaseError) throw supabaseError

            // Eliminar todas las imágenes asociadas
            if (imagen?.imagen_chica) {
                await deleteImagenDestacada(imagen.imagen_chica)
            }
            if (imagen?.imagen_mediana) {
                await deleteImagenDestacada(imagen.imagen_mediana)
            }
            if (imagen?.imagen_grande) {
                await deleteImagenDestacada(imagen.imagen_grande)
            }

            imagenesDestacadas.value = imagenesDestacadas.value.filter(img => img.id !== id)
        } catch (err) {
            error.value = err.message
            console.error('Error al eliminar imagen destacada:', err)
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
        updateImagenDestacada,
        deleteImagenDestacadaCompleta
    }
}