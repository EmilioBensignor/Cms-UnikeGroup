export const useMurallonTiposAplicacion = () => {
    const supabase = useSupabaseClient()
    const loading = ref(false)
    const tiposAplicacion = ref([])
    const error = ref(null)

    const fetchTiposAplicacion = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('murallon-tipos-aplicacion')
                .select('*')
                .order('nombre', { ascending: true })

            if (supabaseError) throw supabaseError

            tiposAplicacion.value = data || []
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    return {
        tiposAplicacion: readonly(tiposAplicacion),
        loading: readonly(loading),
        error: readonly(error),
        fetchTiposAplicacion
    }
}
