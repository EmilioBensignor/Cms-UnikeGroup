export const useWaterplastSubcategorias = () => {
    const supabase = useSupabaseClient()
    const loading = ref(false)
    const subcategorias = ref([])
    const currentSubcategoria = ref(null)
    const error = ref(null)

    const fetchSubcategorias = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-subcategorias')
                .select(`
                    *,
                    categoria:categoria_id(id, nombre, orden)
                `)
                .order('categoria_id', { ascending: true })
                .order('orden', { ascending: true })

            if (supabaseError) throw supabaseError

            subcategorias.value = data || []
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const fetchSubcategoriasByCategoria = async (categoriaId) => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-subcategorias')
                .select('*')
                .eq('categoria_id', categoriaId)
                .order('orden', { ascending: true })

            if (supabaseError) throw supabaseError

            return data || []
        } catch (err) {
            error.value = err.message
            return []
        } finally {
            loading.value = false
        }
    }

    const fetchSubcategoriaById = async (id) => {
        loading.value = true
        error.value = null
        currentSubcategoria.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-subcategorias')
                .select(`
                    *,
                    categoria:categoria_id(id, nombre)
                `)
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            currentSubcategoria.value = data
            return data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const createSubcategoria = async (subcategoriaData) => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-subcategorias')
                .insert(subcategoriaData)
                .select(`
                    *,
                    categoria:categoria_id(id, nombre)
                `)
                .single()

            if (supabaseError) throw supabaseError

            subcategorias.value.push(data)
            return data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateSubcategoria = async (id, subcategoriaData) => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-subcategorias')
                .update(subcategoriaData)
                .eq('id', id)
                .select(`
                    *,
                    categoria:categoria_id(id, nombre)
                `)
                .single()

            if (supabaseError) throw supabaseError

            const index = subcategorias.value.findIndex(sub => sub.id === id)
            if (index !== -1) {
                subcategorias.value[index] = data
            }

            currentSubcategoria.value = data
            return data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteSubcategoria = async (id) => {
        loading.value = true
        error.value = null

        try {
            const { error: supabaseError } = await supabase
                .from('waterplast-subcategorias')
                .delete()
                .eq('id', id)

            if (supabaseError) throw supabaseError

            subcategorias.value = subcategorias.value.filter(sub => sub.id !== id)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        subcategorias,
        currentSubcategoria,
        loading,
        error,
        fetchSubcategorias,
        fetchSubcategoriasByCategoria,
        fetchSubcategoriaById,
        createSubcategoria,
        updateSubcategoria,
        deleteSubcategoria
    }
}
