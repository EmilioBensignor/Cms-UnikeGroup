export const useRohermetCategorias = () => {
    const supabase = useSupabaseClient()
    const {
        uploadCategoriaImage,
        deleteCategoriaImage,
        getCategoriaImageUrl
    } = useStorage()
    const loading = ref(false)
    const categorias = ref([])
    const currentCategoria = ref(null)
    const error = ref(null)

    const fetchCategorias = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('rohermet-categorias')
                .select('*')
                .order('orden', { ascending: true })

            if (supabaseError) throw supabaseError

            const categoriasWithUrls = (data || []).map(categoria => ({
                ...categoria,
                imagen: categoria.imagen ? getCategoriaImageUrl(categoria.imagen, 'rohermet') : null
            }))

            categorias.value = categoriasWithUrls
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const fetchCategoriaById = async (id) => {
        loading.value = true
        error.value = null
        currentCategoria.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('rohermet-categorias')
                .select('*')
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            const categoriaWithUrls = {
                ...data,
                imagen: data.imagen ? getCategoriaImageUrl(data.imagen, 'rohermet') : null
            }

            currentCategoria.value = categoriaWithUrls
            return categoriaWithUrls
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateCategoria = async (id, categoriaData, imagenes) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('rohermet-categorias')
                .select('nombre, imagen')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const categoriaNombre = currentData?.nombre || 'categoria'
            let imagenPath = currentData?.imagen

            if (imagenes?.imagen) {
                if (currentData?.imagen) {
                    await deleteCategoriaImage(currentData.imagen, 'rohermet')
                }
                imagenPath = await uploadCategoriaImage(imagenes.imagen, categoriaNombre, 'rohermet')
            }

            const finalCategoriaData = {
                ...categoriaData,
                imagen: imagenPath
            }

            delete finalCategoriaData.nombre

            const { data, error: supabaseError } = await supabase
                .from('rohermet-categorias')
                .update(finalCategoriaData)
                .eq('id', id)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            const dataWithUrls = {
                ...data,
                imagen: data.imagen ? getCategoriaImageUrl(data.imagen, 'rohermet') : null
            }

            const index = categorias.value.findIndex(cat => cat.id === id)
            if (index !== -1) {
                categorias.value[index] = dataWithUrls
            }

            currentCategoria.value = dataWithUrls
            return dataWithUrls
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        categorias,
        currentCategoria,
        loading,
        error,
        fetchCategorias,
        fetchCategoriaById,
        updateCategoria
    }
}
