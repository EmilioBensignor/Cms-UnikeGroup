import { handleSupabaseError } from '~/utils/errorHandler.js'

export const useCatalogos = () => {
    const supabase = useSupabaseClient()
    const config = useRuntimeConfig()

    const catalogos = ref([])
    const loading = ref(false)
    const error = ref(null)
    const uploading = ref(false)

    const fetchCatalogos = async () => {
        try {
            loading.value = true
            error.value = null

            const { data, error: fetchError } = await supabase
                .from('catalogos')
                .select('*')
                .order('id', { ascending: true })

            if (fetchError) throw fetchError

            catalogos.value = data || []
        } catch (err) {
            error.value = handleSupabaseError(err)
        } finally {
            loading.value = false
        }
    }

    const uploadCatalogoPdf = async (file, marca) => {
        try {
            uploading.value = true
            error.value = null

            if (!file || file.type !== 'application/pdf') {
                throw new Error('Solo se permiten archivos PDF')
            }

            if (file.size > 50 * 1024 * 1024) {
                throw new Error('El archivo es demasiado grande. Máximo 50MB')
            }

            const cleanName = marca.toLowerCase()
                .normalize('NFD')
                .replace(/[̀-ͯ]/g, '')
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')

            const fileName = `${cleanName}/catalogo.pdf`

            const { data, error: uploadError } = await supabase.storage
                .from('catalogos')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) throw uploadError

            return data.path
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const updateCatalogoPdf = async (id, pdfPath) => {
        try {
            loading.value = true
            error.value = null

            const { error: updateError } = await supabase
                .from('catalogos')
                .update({ catalogo_pdf: pdfPath })
                .eq('id', id)

            if (updateError) throw updateError
        } catch (err) {
            error.value = handleSupabaseError(err)
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteCatalogoPdf = async (storagePath) => {
        try {
            error.value = null

            const { error: deleteError } = await supabase.storage
                .from('catalogos')
                .remove([storagePath])

            if (deleteError) throw deleteError
        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const getCatalogoPdfUrl = (storagePath) => {
        if (!storagePath) return null
        return `${config.public.supabase.url}/storage/v1/object/public/catalogos/${storagePath}`
    }

    return {
        catalogos: readonly(catalogos),
        loading: readonly(loading),
        error: readonly(error),
        uploading: readonly(uploading),
        fetchCatalogos,
        uploadCatalogoPdf,
        updateCatalogoPdf,
        deleteCatalogoPdf,
        getCatalogoPdfUrl,
    }
}
