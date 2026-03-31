export const useMurallonCategorias = () => {
    const supabase = useSupabaseClient()
    const loading = ref(false)
    const categorias = ref([])
    const error = ref(null)

    const fetchCategorias = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('murallon-categorias')
                .select('*')
                .order('nombre', { ascending: true })

            if (supabaseError) throw supabaseError

            categorias.value = data || []
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    return {
        categorias: readonly(categorias),
        loading: readonly(loading),
        error: readonly(error),
        fetchCategorias
    }
}
