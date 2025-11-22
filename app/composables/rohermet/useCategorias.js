export const useRohermetCategorias = () => {
    const supabase = useSupabaseClient()
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

            categorias.value = data || []
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

            currentCategoria.value = data
            return data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateCategoria = async (id, categoriaData) => {
        loading.value = true
        error.value = null

        try {
            const finalCategoriaData = {
                ...categoriaData
            }

            const { data, error: supabaseError } = await supabase
                .from('rohermet-categorias')
                .update(finalCategoriaData)
                .eq('id', id)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            const index = categorias.value.findIndex(cat => cat.id === id)
            if (index !== -1) {
                categorias.value[index] = data
            }

            currentCategoria.value = data
            return data
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
