<template>
    <DefaultSection>
        <HeadingH1>Catálogos</HeadingH1>
        <p class="text-gray-dark mb-8">Subí o actualizá los catálogos PDF de cada marca. Se mostrarán en la web para descarga.</p>

        <div v-if="loading" class="flex justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="catalogo in catalogos" :key="catalogo.id"
                class="border border-gray-light rounded-2xl p-6 flex flex-col gap-5">
                <div class="flex items-center gap-3">
                    <h3 class="text-lg font-semibold text-dark">{{ catalogo.marca }}</h3>
                    <span v-if="catalogo.catalogo_pdf"
                        class="text-xs font-medium bg-green-100 text-green-700 px-2.5 py-1 rounded-full">
                        PDF cargado
                    </span>
                    <span v-else class="text-xs font-medium bg-red-100 text-red-600 px-2.5 py-1 rounded-full">
                        Sin PDF
                    </span>
                </div>

                <div v-if="catalogo.catalogo_pdf" class="flex items-center gap-4">
                    <a :href="getCatalogoPdfUrl(catalogo.catalogo_pdf)" target="_blank" rel="noopener noreferrer"
                        class="text-primary text-sm font-medium hover:underline flex items-center gap-1.5">
                        <Icon name="tabler:file-type-pdf" class="w-5 h-5" />
                        Ver catálogo actual
                    </a>
                    <button @click="handleDelete(catalogo)"
                        class="text-error text-sm font-medium hover:underline flex items-center gap-1.5 cursor-pointer">
                        <Icon name="tabler:trash" class="w-4 h-4" />
                        Eliminar
                    </button>
                </div>

                <label
                    class="mt-auto flex items-center justify-center gap-2 border-2 border-dashed border-gray-light rounded-xl py-4 px-4 cursor-pointer hover:border-primary hover:bg-blue-50/30 transition-colors duration-200"
                    :class="{ 'opacity-50 pointer-events-none': uploadingId === catalogo.id }">
                    <Icon v-if="uploadingId !== catalogo.id" name="tabler:upload" class="w-5 h-5 text-gray-dark" />
                    <div v-else class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                    <span class="text-sm text-gray-dark font-medium">
                        {{ uploadingId === catalogo.id ? 'Subiendo...' : (catalogo.catalogo_pdf ? 'Reemplazar PDF' : 'Subir PDF') }}
                    </span>
                    <input type="file" accept="application/pdf" class="hidden"
                        @change="(e) => handleUpload(e, catalogo)" :disabled="uploadingId === catalogo.id" />
                </label>
            </div>
        </div>
    </DefaultSection>
</template>

<script setup>
import { useCatalogos } from '~/composables/useCatalogos.js'

const { catalogos, loading, uploading, fetchCatalogos, uploadCatalogoPdf, updateCatalogoPdf, deleteCatalogoPdf, getCatalogoPdfUrl } = useCatalogos()
const { success, error: notifyError } = useNotification()

const uploadingId = ref(null)

const handleUpload = async (event, catalogo) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
        uploadingId.value = catalogo.id

        if (catalogo.catalogo_pdf) {
            await deleteCatalogoPdf(catalogo.catalogo_pdf).catch(() => { /* noop */ })
        }

        const path = await uploadCatalogoPdf(file, catalogo.marca)
        await updateCatalogoPdf(catalogo.id, path)
        await fetchCatalogos()

        success(`Catálogo de ${catalogo.marca} actualizado exitosamente`)
    } catch (err) {
        notifyError(`Error al subir el catálogo: ${err.message}`)
    } finally {
        uploadingId.value = null
        event.target.value = ''
    }
}

const handleDelete = async (catalogo) => {
    if (!confirm(`¿Eliminar el catálogo de ${catalogo.marca}?`)) return

    try {
        await deleteCatalogoPdf(catalogo.catalogo_pdf)
        await updateCatalogoPdf(catalogo.id, null)
        await fetchCatalogos()

        success(`Catálogo de ${catalogo.marca} eliminado`)
    } catch (err) {
        notifyError(`Error al eliminar: ${err.message}`)
    }
}

onMounted(() => {
    fetchCatalogos()
})
</script>
