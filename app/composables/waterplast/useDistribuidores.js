export const useWaterplastDistribuidores = () => {
    const supabase = useSupabaseClient()
    const loading = ref(false)
    const distribuidores = ref([])
    const currentDistribuidor = ref(null)
    const error = ref(null)

    const fetchDistribuidores = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-distribuidores')
                .select('*')
                .order('created_at', { ascending: false })

            if (supabaseError) throw supabaseError

            distribuidores.value = data || []
        } catch (err) {
            error.value = err.message
            console.error('Error al obtener distribuidores:', err)
        } finally {
            loading.value = false
        }
    }

    const fetchDistribuidorById = async (id) => {
        loading.value = true
        error.value = null
        currentDistribuidor.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-distribuidores')
                .select('*')
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            currentDistribuidor.value = data
            return data
        } catch (err) {
            error.value = err.message
            console.error('Error al obtener distribuidor:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const createDistribuidor = async (distribuidorData) => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-distribuidores')
                .insert([distribuidorData])
                .select()
                .single()

            if (supabaseError) throw supabaseError

            distribuidores.value.unshift(data)
            return data
        } catch (err) {
            error.value = err.message
            console.error('Error al crear distribuidor:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateDistribuidor = async (id, distribuidorData) => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-distribuidores')
                .update(distribuidorData)
                .eq('id', id)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            const index = distribuidores.value.findIndex(dist => dist.id === id)
            if (index !== -1) {
                distribuidores.value[index] = data
            }

            currentDistribuidor.value = data
            return data
        } catch (err) {
            error.value = err.message
            console.error('Error al actualizar distribuidor:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteDistribuidorCompleto = async (id) => {
        loading.value = true
        error.value = null

        try {
            const { error: supabaseError } = await supabase
                .from('waterplast-distribuidores')
                .delete()
                .eq('id', id)

            if (supabaseError) throw supabaseError

            distribuidores.value = distribuidores.value.filter(dist => dist.id !== id)
        } catch (err) {
            error.value = err.message
            console.error('Error al eliminar distribuidor:', err)
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        distribuidores,
        currentDistribuidor,
        loading,
        error,
        fetchDistribuidores,
        fetchDistribuidorById,
        createDistribuidor,
        updateDistribuidor,
        deleteDistribuidorCompleto
    }
}