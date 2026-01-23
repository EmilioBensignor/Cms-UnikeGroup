export const useRohermetCategorias = () => {
    const supabase = useSupabaseClient()
    const {
        uploadRohermetCategoriaImage,
        deleteRohermetCategoriaImage,
        getRohermetCategoriaImageUrl
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
                imagen: categoria.imagen ? getRohermetCategoriaImageUrl(categoria.imagen) : null
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

            const categoriaWithUrl = {
                ...data,
                imagen: data.imagen ? getRohermetCategoriaImageUrl(data.imagen) : null
            }

            currentCategoria.value = categoriaWithUrl
            return categoriaWithUrl
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateCategoria = async (id, categoriaData, imagen = null) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('rohermet-categorias')
                .select('nombre, imagen')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            let imagenPath = currentData?.imagen

            if (imagen) {
                if (currentData?.imagen) {
                    await deleteRohermetCategoriaImage(currentData.imagen)
                }
                imagenPath = await uploadRohermetCategoriaImage(imagen, currentData.nombre)
            }

            const finalCategoriaData = {
                ...categoriaData,
                imagen: imagenPath
            }

            const { data, error: supabaseError } = await supabase
                .from('rohermet-categorias')
                .update(finalCategoriaData)
                .eq('id', id)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            const dataWithUrl = {
                ...data,
                imagen: data.imagen ? getRohermetCategoriaImageUrl(data.imagen) : null
            }

            const index = categorias.value.findIndex(cat => cat.id === id)
            if (index !== -1) {
                categorias.value[index] = dataWithUrl
            }

            currentCategoria.value = dataWithUrl
            return dataWithUrl
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