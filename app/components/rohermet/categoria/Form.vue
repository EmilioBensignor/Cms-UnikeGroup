<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.orden" label="Numero de Orden" id="orden" type="number"
                placeholder="Ingrese el numero de orden" required :error="errors.orden" />
            <FormImageField v-model="formData.imagen" label="Imagen de Categoria" id="imagen"
                :error="errors.imagen" :current-image="initialData?.imagen" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormImageField v-model="formData.imagenXLCategorias" id="imagenXLCategorias"
                label="Imagen XL Categorias (1512px x 800px)" :error="errors.imagenXLCategorias"
                targetFolder="rohermet-categorias" @upload-start="handleImageXLCategoriasStart"
                @upload-complete="handleImageXLCategoriasComplete" />
            <FormImageField v-model="formData.imagenLCategorias" id="imagenLCategorias"
                label="Imagen L Categorias (1080px x 700px)" :error="errors.imagenLCategorias"
                targetFolder="rohermet-categorias" @upload-start="handleImageLCategoriasStart"
                @upload-complete="handleImageLCategoriasComplete" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormImageField v-model="formData.imagenMCategorias" id="imagenMCategorias"
                label="Imagen M Categorias (768px x 400px)" :error="errors.imagenMCategorias"
                targetFolder="rohermet-categorias" @upload-start="handleImageMCategoriasStart"
                @upload-complete="handleImageMCategoriasComplete" />
            <FormImageField v-model="formData.imagenSCategorias" id="imagenSCategorias"
                label="Imagen S Categorias (320px x 385px)" :error="errors.imagenSCategorias"
                targetFolder="rohermet-categorias" @upload-start="handleImageSCategoriasStart"
                @upload-complete="handleImageSCategoriasComplete" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica1" label="Caracteristica 1" id="caracteristica1"
                placeholder="Ingrese la primera caracteristica" :error="errors.caracteristica1" />
            <FormImageField v-model="formData.icono1" id="icono1" label="Icono 1 (56px x 56px)" :error="errors.icono1"
                targetFolder="rohermet-categorias" @upload-start="handleIconStart1"
                @upload-complete="handleIconComplete1" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica2" label="Caracteristica 2" id="caracteristica2"
                placeholder="Ingrese la segunda caracteristica" :error="errors.caracteristica2" />
            <FormImageField v-model="formData.icono2" id="icono2" label="Icono 2 (56px x 56px)" :error="errors.icono2"
                targetFolder="rohermet-categorias" @upload-start="handleIconStart2"
                @upload-complete="handleIconComplete2" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica3" label="Caracteristica 3" id="caracteristica3"
                placeholder="Ingrese la tercera caracteristica" :error="errors.caracteristica3" />
            <FormImageField v-model="formData.icono3" id="icono3" label="Icono 3 (56px x 56px)" :error="errors.icono3"
                targetFolder="rohermet-categorias" @upload-start="handleIconStart3"
                @upload-complete="handleIconComplete3" />
        </FormFieldsContainer>

        <MultiImageField v-model="formData.imagenesRedes" id="imagenesRedes"
            label="Imagenes para Redes (320px x 400px)" :error="errors.imagenesRedes"
            targetFolder="rohermet-categorias" @upload-start="handleImagenesRedesStart"
            @upload-complete="handleImagenesRedesComplete" />

        <div class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? 'Actualizando...' : 'Actualizar Categoria' }}
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
import MultiImageField from '~/components/form/MultiImageField.vue'

const { error: showValidationError } = useNotification()

const props = defineProps({
    isEditing: {
        type: Boolean,
        default: false
    },
    initialData: {
        type: Object,
        default: () => ({})
    }
})

const emit = defineEmits(['submit', 'cancel'])

const submitting = ref(false)
const imagenXLCategorias = ref(null)
const imagenLCategorias = ref(null)
const imagenMCategorias = ref(null)
const imagenSCategorias = ref(null)
const icono1 = ref(null)
const icono2 = ref(null)
const icono3 = ref(null)

const formData = reactive({
    orden: 0,
    imagen: null,
    imagenXLCategorias: null,
    imagenLCategorias: null,
    imagenMCategorias: null,
    imagenSCategorias: null,
    caracteristica1: '',
    icono1: null,
    caracteristica2: '',
    icono2: null,
    caracteristica3: '',
    icono3: null,
    imagenesRedes: [],
})

const errors = reactive({
    orden: '',
    imagen: '',
    imagenXLCategorias: '',
    imagenLCategorias: '',
    imagenMCategorias: '',
    imagenSCategorias: '',
    caracteristica1: '',
    icono1: '',
    caracteristica2: '',
    icono2: '',
    caracteristica3: '',
    icono3: '',
    imagenesRedes: ''
})

watch(() => props.initialData, async (newData) => {
    if (props.isEditing && newData) {
        const processedImagenes = newData.imagenes_redes && Array.isArray(newData.imagenes_redes)
            ? newData.imagenes_redes.map((img, index) => {
                const storagePathValue = img.storagePath || null
                return {
                    id: img.id || `existing-${index}`,
                    name: img.name || `imagen-${index + 1}.jpg`,
                    url: img.url,
                    preview: img.url,
                    isExisting: true,
                    filename: img.name || `imagen-${index + 1}.jpg`,
                    file: null,
                    orden: index + 1,
                    es_principal: index === 0,
                    storagePath: storagePathValue,
                    file_size: 0,
                    mime_type: 'image/jpeg'
                }
            }) : []

        Object.assign(formData, {
            orden: newData.orden || 0,
            imagen: null,
            imagenXLCategorias: newData.imagen_xl_categorias || null,
            imagenLCategorias: newData.imagen_l_categorias || null,
            imagenMCategorias: newData.imagen_m_categorias || null,
            imagenSCategorias: newData.imagen_s_categorias || null,
            caracteristica1: newData.caracteristica1 || '',
            icono1: newData.icono1 || null,
            caracteristica2: newData.caracteristica2 || '',
            icono2: newData.icono2 || null,
            caracteristica3: newData.caracteristica3 || '',
            icono3: newData.icono3 || null,
        })

        await nextTick()
        formData.imagenesRedes = processedImagenes
    }
}, { immediate: true, deep: true })

const handleImageXLCategoriasStart = (file) => {
    imagenXLCategorias.value = file
    errors.imagenXLCategorias = ''
}

const handleImageXLCategoriasComplete = () => {
    errors.imagenXLCategorias = ''
}

const handleImageLCategoriasStart = (file) => {
    imagenLCategorias.value = file
    errors.imagenLCategorias = ''
}

const handleImageLCategoriasComplete = () => {
    errors.imagenLCategorias = ''
}

const handleImageMCategoriasStart = (file) => {
    imagenMCategorias.value = file
    errors.imagenMCategorias = ''
}

const handleImageMCategoriasComplete = () => {
    errors.imagenMCategorias = ''
}

const handleImageSCategoriasStart = (file) => {
    imagenSCategorias.value = file
    errors.imagenSCategorias = ''
}

const handleImageSCategoriasComplete = () => {
    errors.imagenSCategorias = ''
}

const handleIconStart1 = (file) => {
    icono1.value = file
    errors.icono1 = ''
}

const handleIconComplete1 = () => {
    errors.icono1 = ''
}

const handleIconStart2 = (file) => {
    icono2.value = file
    errors.icono2 = ''
}

const handleIconComplete2 = () => {
    errors.icono2 = ''
}

const handleIconStart3 = (file) => {
    icono3.value = file
    errors.icono3 = ''
}

const handleIconComplete3 = () => {
    errors.icono3 = ''
}

const handleImagenesRedesStart = () => {
    errors.imagenesRedes = ''
}

const handleImagenesRedesComplete = () => {
    errors.imagenesRedes = ''
}

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    if (!formData.orden || formData.orden < 1) {
        errors.orden = 'El numero de orden es requerido y debe ser mayor a 0'
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) {
        showValidationError('Por favor, completa todos los campos requeridos', {
            title: 'Validacion incompleta'
        })
        return
    }

    submitting.value = true

    try {
        const categoriaData = {
            orden: parseInt(formData.orden),
            caracteristica1: formData.caracteristica1.trim() || null,
            caracteristica2: formData.caracteristica2.trim() || null,
            caracteristica3: formData.caracteristica3.trim() || null,
        }

        if (props.isEditing) {
            if (!imagenXLCategorias.value) categoriaData.imagen_xl_categorias = formData.imagenXLCategorias
            if (!imagenLCategorias.value) categoriaData.imagen_l_categorias = formData.imagenLCategorias
            if (!imagenMCategorias.value) categoriaData.imagen_m_categorias = formData.imagenMCategorias
            if (!imagenSCategorias.value) categoriaData.imagen_s_categorias = formData.imagenSCategorias
            if (!icono1.value) categoriaData.icono1 = formData.icono1
            if (!icono2.value) categoriaData.icono2 = formData.icono2
            if (!icono3.value) categoriaData.icono3 = formData.icono3
        }

        emit('submit', {
            categoriaData,
            imagenes: {
                imagen: formData.imagen,
                imagenXLCategorias: imagenXLCategorias.value,
                imagenLCategorias: imagenLCategorias.value,
                imagenMCategorias: imagenMCategorias.value,
                imagenSCategorias: imagenSCategorias.value
            },
            iconos: {
                icono1: icono1.value,
                icono2: icono2.value,
                icono3: icono3.value
            },
            imagenesRedes: formData.imagenesRedes
        })

    } catch (error) {
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>
