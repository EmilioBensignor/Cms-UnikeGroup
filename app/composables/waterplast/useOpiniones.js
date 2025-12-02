export const useWaterplastOpiniones = () => {
    const supabase = useSupabaseClient()
    const { uploadOpinionImage, deleteOpinionImage, getOpinionImageUrl } = useStorage()
    const loading = ref(false)
    const opiniones = ref([])
    const currentOpinion = ref(null)
    const error = ref(null)

    const fetchOpiniones = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-opiniones')
                .select('*')
                .order('created_at', { ascending: false })

            if (supabaseError) throw supabaseError

            const opinionesWithUrls = (data || []).map(opinion => ({
                ...opinion,
                imagen: opinion.imagen ? getOpinionImageUrl(opinion.imagen) : null
            }))

            opiniones.value = opinionesWithUrls
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const fetchOpinionById = async (id) => {
        loading.value = true
        error.value = null
        currentOpinion.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('waterplast-opiniones')
                .select('*')
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            const opinionWithUrl = {
                ...data,
                imagen: data.imagen ? getOpinionImageUrl(data.imagen) : null
            }

            currentOpinion.value = opinionWithUrl
            return opinionWithUrl
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const createOpinion = async ({ opinionData, imagen }) => {
        loading.value = true
        error.value = null

        try {
            let imagePath = null

            if (imagen) {
                imagePath = await uploadOpinionImage(imagen, opinionData)
            }

            const finalOpinionData = {
                ...opinionData,
                imagen: imagePath || opinionData.imagen
            }

            const { data, error: supabaseError } = await supabase
                .from('waterplast-opiniones')
                .insert([finalOpinionData])
                .select()
                .single()

            if (supabaseError) throw supabaseError

            opiniones.value.unshift(data)
            return data
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateOpinion = async (id, opinionData, imagen, imagenFueEliminada = false) => {
        loading.value = true
        error.value = null

        try {
            const { data: currentData, error: fetchError } = await supabase
                .from('waterplast-opiniones')
                .select('imagen')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            let imagePath = currentData?.imagen

            if (imagen) {
                if (currentData?.imagen) {
                    await deleteOpinionImage(currentData.imagen)
                }
                imagePath = await uploadOpinionImage(imagen, opinionData)
            } else if (imagenFueEliminada) {
                imagePath = null
            }

            const finalOpinionData = {
                ...opinionData,
                imagen: imagePath
            }

            const { data, error: supabaseError } = await supabase
                .from('waterplast-opiniones')
                .update(finalOpinionData)
                .eq('id', id)
                .select()
                .single()

            if (supabaseError) throw supabaseError

            const dataWithUrl = {
                ...data,
                imagen: data.imagen ? getOpinionImageUrl(data.imagen) : null
            }

            const index = opiniones.value.findIndex(op => op.id === id)
            if (index !== -1) {
                opiniones.value[index] = dataWithUrl
            }

            currentOpinion.value = dataWithUrl
            return dataWithUrl
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteOpinionCompleta = async (id) => {
        loading.value = true
        error.value = null

        try {
            const { data: opinion, error: fetchError } = await supabase
                .from('waterplast-opiniones')
                .select('imagen')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            const { error: supabaseError } = await supabase
                .from('waterplast-opiniones')
                .delete()
                .eq('id', id)

            if (supabaseError) throw supabaseError

            if (opinion?.imagen) {
                await deleteOpinionImage(opinion.imagen)
            }

            opiniones.value = opiniones.value.filter(op => op.id !== id)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }


    return {
        opiniones,
        currentOpinion,
        loading,
        error,
        fetchOpiniones,
        fetchOpinionById,
        createOpinion,
        updateOpinion,
        deleteOpinionCompleta
    }
}