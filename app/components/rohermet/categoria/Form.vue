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
                required targetFolder="rohermet-categorias" @upload-start="handleImageXLCategoriasStart"
                @upload-complete="handleImageXLCategoriasComplete" />
            <FormImageField v-model="formData.imagenLCategorias" id="imagenLCategorias"
                label="Imagen L Categorias (1080px x 700px)" :error="errors.imagenLCategorias"
                required targetFolder="rohermet-categorias" @upload-start="handleImageLCategoriasStart"
                @upload-complete="handleImageLCategoriasComplete" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormImageField v-model="formData.imagenMCategorias" id="imagenMCategorias"
                label="Imagen M Categorias (768px x 400px)" :error="errors.imagenMCategorias"
                required targetFolder="rohermet-categorias" @upload-start="handleImageMCategoriasStart"
                @upload-complete="handleImageMCategoriasComplete" />
            <FormImageField v-model="formData.imagenSCategorias" id="imagenSCategorias"
                label="Imagen S Categorias (320px x 385px)" :error="errors.imagenSCategorias"
                required targetFolder="rohermet-categorias" @upload-start="handleImageSCategoriasStart"
                @upload-complete="handleImageSCategoriasComplete" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica1" label="Caracteristica 1" id="caracteristica1"
                placeholder="Ingrese la primera caracteristica" required :error="errors.caracteristica1" />
            <FormImageField v-model="formData.icono1" id="icono1" label="Icono 1 (56px x 56px)" :error="errors.icono1"
                required targetFolder="rohermet-categorias" @upload-start="handleIconStart1"
                @upload-complete="handleIconComplete1" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica2" label="Caracteristica 2" id="caracteristica2"
                placeholder="Ingrese la segunda caracteristica" required :error="errors.caracteristica2" />
            <FormImageField v-model="formData.icono2" id="icono2" label="Icono 2 (56px x 56px)" :error="errors.icono2"
                required targetFolder="rohermet-categorias" @upload-start="handleIconStart2"
                @upload-complete="handleIconComplete2" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica3" label="Caracteristica 3" id="caracteristica3"
                placeholder="Ingrese la tercera caracteristica" required :error="errors.caracteristica3" />
            <FormImageField v-model="formData.icono3" id="icono3" label="Icono 3 (56px x 56px)" :error="errors.icono3"
                required targetFolder="rohermet-categorias" @upload-start="handleIconStart3"
                @upload-complete="handleIconComplete3" />
        </FormFieldsContainer>

        <MultiImageField v-model="formData.imagenesRedes" id="imagenesRedes"
            label="Imagenes para Redes (320px x 400px)" :error="errors.imagenesRedes"
            required targetFolder="rohermet-categorias" @upload-start="handleImagenesRedesStart"
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

const removedImages = reactive({
    imagen: false,
    imagenXLCategorias: false,
    imagenLCategorias: false,
    imagenMCategorias: false,
    imagenSCategorias: false,
    icono1: false,
    icono2: false,
    icono3: false,
})

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

watch(() => formData.imagen, (newVal, oldVal) => {
    if (newVal === '' && oldVal) removedImages.imagen = true
})
watch(() => formData.imagenXLCategorias, (newVal, oldVal) => {
    if (newVal === '' && oldVal) removedImages.imagenXLCategorias = true
})
watch(() => formData.imagenLCategorias, (newVal, oldVal) => {
    if (newVal === '' && oldVal) removedImages.imagenLCategorias = true
})
watch(() => formData.imagenMCategorias, (newVal, oldVal) => {
    if (newVal === '' && oldVal) removedImages.imagenMCategorias = true
})
watch(() => formData.imagenSCategorias, (newVal, oldVal) => {
    if (newVal === '' && oldVal) removedImages.imagenSCategorias = true
})
watch(() => formData.icono1, (newVal, oldVal) => {
    if (newVal === '' && oldVal) removedImages.icono1 = true
})
watch(() => formData.icono2, (newVal, oldVal) => {
    if (newVal === '' && oldVal) removedImages.icono2 = true
})
watch(() => formData.icono3, (newVal, oldVal) => {
    if (newVal === '' && oldVal) removedImages.icono3 = true
})

const handleImageXLCategoriasStart = (file) => {
    imagenXLCategorias.value = file
    removedImages.imagenXLCategorias = false
    errors.imagenXLCategorias = ''
}

const handleImageXLCategoriasComplete = () => {
    errors.imagenXLCategorias = ''
}

const handleImageLCategoriasStart = (file) => {
    imagenLCategorias.value = file
    removedImages.imagenLCategorias = false
    errors.imagenLCategorias = ''
}

const handleImageLCategoriasComplete = () => {
    errors.imagenLCategorias = ''
}

const handleImageMCategoriasStart = (file) => {
    imagenMCategorias.value = file
    removedImages.imagenMCategorias = false
    errors.imagenMCategorias = ''
}

const handleImageMCategoriasComplete = () => {
    errors.imagenMCategorias = ''
}

const handleImageSCategoriasStart = (file) => {
    imagenSCategorias.value = file
    removedImages.imagenSCategorias = false
    errors.imagenSCategorias = ''
}

const handleImageSCategoriasComplete = () => {
    errors.imagenSCategorias = ''
}

const handleIconStart1 = (file) => {
    icono1.value = file
    removedImages.icono1 = false
    errors.icono1 = ''
}

const handleIconComplete1 = () => {
    errors.icono1 = ''
}

const handleIconStart2 = (file) => {
    icono2.value = file
    removedImages.icono2 = false
    errors.icono2 = ''
}

const handleIconComplete2 = () => {
    errors.icono2 = ''
}

const handleIconStart3 = (file) => {
    icono3.value = file
    removedImages.icono3 = false
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

    if (!formData.caracteristica1.trim()) {
        errors.caracteristica1 = 'La caracteristica 1 es requerida'
        isValid = false
    }

    if (!formData.caracteristica2.trim()) {
        errors.caracteristica2 = 'La caracteristica 2 es requerida'
        isValid = false
    }

    if (!formData.caracteristica3.trim()) {
        errors.caracteristica3 = 'La caracteristica 3 es requerida'
        isValid = false
    }

    if (!imagenXLCategorias.value && !formData.imagenXLCategorias) {
        errors.imagenXLCategorias = 'La imagen XL de categorias es requerida'
        isValid = false
    }

    if (!imagenLCategorias.value && !formData.imagenLCategorias) {
        errors.imagenLCategorias = 'La imagen L de categorias es requerida'
        isValid = false
    }

    if (!imagenMCategorias.value && !formData.imagenMCategorias) {
        errors.imagenMCategorias = 'La imagen M de categorias es requerida'
        isValid = false
    }

    if (!imagenSCategorias.value && !formData.imagenSCategorias) {
        errors.imagenSCategorias = 'La imagen S de categorias es requerida'
        isValid = false
    }

    if (!icono1.value && !formData.icono1) {
        errors.icono1 = 'El icono 1 es requerido'
        isValid = false
    }

    if (!icono2.value && !formData.icono2) {
        errors.icono2 = 'El icono 2 es requerido'
        isValid = false
    }

    if (!icono3.value && !formData.icono3) {
        errors.icono3 = 'El icono 3 es requerido'
        isValid = false
    }

    if (!formData.imagenesRedes || formData.imagenesRedes.length === 0) {
        errors.imagenesRedes = 'Al menos una imagen para redes sociales es requerida'
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
            if (removedImages.imagenXLCategorias) {
                categoriaData.imagen_xl_categorias = null
            } else if (!imagenXLCategorias.value) {
                categoriaData.imagen_xl_categorias = formData.imagenXLCategorias
            }

            if (removedImages.imagenLCategorias) {
                categoriaData.imagen_l_categorias = null
            } else if (!imagenLCategorias.value) {
                categoriaData.imagen_l_categorias = formData.imagenLCategorias
            }

            if (removedImages.imagenMCategorias) {
                categoriaData.imagen_m_categorias = null
            } else if (!imagenMCategorias.value) {
                categoriaData.imagen_m_categorias = formData.imagenMCategorias
            }

            if (removedImages.imagenSCategorias) {
                categoriaData.imagen_s_categorias = null
            } else if (!imagenSCategorias.value) {
                categoriaData.imagen_s_categorias = formData.imagenSCategorias
            }

            if (removedImages.icono1) {
                categoriaData.icono1 = null
            } else if (!icono1.value) {
                categoriaData.icono1 = formData.icono1
            }

            if (removedImages.icono2) {
                categoriaData.icono2 = null
            } else if (!icono2.value) {
                categoriaData.icono2 = formData.icono2
            }

            if (removedImages.icono3) {
                categoriaData.icono3 = null
            } else if (!icono3.value) {
                categoriaData.icono3 = formData.icono3
            }
        }

        emit('submit', {
            categoriaData,
            imagenes: {
                imagen: removedImages.imagen ? null : formData.imagen,
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
            removedImages: { ...removedImages },
            imagenesRedes: formData.imagenesRedes
        })

    } catch (error) {
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>
