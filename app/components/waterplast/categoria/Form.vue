<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormImageField v-model="formData.imagenMenu" id="imagenMenu" label="Imagen Menú (295px x 280px)"
                :error="errors.imagenMenu" required targetFolder="waterplast-categorias"
                @upload-start="handleImageMenuStart" @upload-complete="handleImageMenuComplete" />
            <FormTextField v-model="formData.color" label="Color (Hex con #)" id="color"
                placeholder="Ingrese el color (ej: #FFFFFF)" required :error="errors.color" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormImageField v-model="formData.imagenHeroHome" id="imagenHeroHome"
                label="Imagen Hero Home (430px x 320px)" :error="errors.imagenHeroHome" required
                targetFolder="waterplast-categorias" @upload-start="handleImageHeroHomeStart"
                @upload-complete="handleImageHeroHomeComplete" />
            <FormImageField v-model="formData.imagenXLCategorias" id="imagenXLCategorias"
                label="Imagen XL Categorías (1512px x 800px)" required :error="errors.imagenXLCategorias"
                targetFolder="waterplast-categorias" @upload-start="handleImageXLCategoriasStart"
                @upload-complete="handleImageXLCategoriasComplete" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormImageField v-model="formData.imagenLCategorias" id="imagenLCategorias"
                label="Imagen L Categorías (1080px x 700px)" required :error="errors.imagenLCategorias"
                targetFolder="waterplast-categorias" @upload-start="handleImageLCategoriasStart"
                @upload-complete="handleImageLCategoriasComplete" />
            <FormImageField v-model="formData.imagenMCategorias" id="imagenMCategorias"
                label="Imagen M Categorías (768px x 400px)" required :error="errors.imagenMCategorias"
                targetFolder="waterplast-categorias" @upload-start="handleImageMCategoriasStart"
                @upload-complete="handleImageMCategoriasComplete" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormImageField v-model="formData.imagenSCategorias" id="imagenSCategorias"
                label="Imagen S Categorías (320px x 320px)" required :error="errors.imagenSCategorias"
                targetFolder="waterplast-categorias" @upload-start="handleImageSCategoriasStart"
                @upload-complete="handleImageSCategoriasComplete" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.orden" label="Número de Orden" id="orden" type="number"
                placeholder="Ingrese el número de orden" required :error="errors.orden" />
            <FormSwitch v-model="formData.estado" id="estado" label="Estado" required :error="errors.estado" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica1" label="Característica 1" id="caracteristica1"
                placeholder="Ingrese la primera característica" required :error="errors.caracteristica1" />

            <FormImageField v-model="formData.icono1" id="icono1" label="Icono 1 (56px x 56px)" :error="errors.icono1"
                targetFolder="waterplast-categorias" @upload-start="handleIconStart1"
                @upload-complete="handleIconComplete1" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica2" label="Característica 2" id="caracteristica2"
                placeholder="Ingrese la segunda característica" required :error="errors.caracteristica2" />

            <FormImageField v-model="formData.icono2" id="icono2" label="Icono 2 (56px x 56px)" :error="errors.icono2"
                targetFolder="waterplast-categorias" @upload-start="handleIconStart2"
                @upload-complete="handleIconComplete2" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica3" label="Característica 3" id="caracteristica3"
                placeholder="Ingrese la tercera característica" required :error="errors.caracteristica3" />

            <FormImageField v-model="formData.icono3" id="icono3" label="Icono 3 (56px x 56px)" :error="errors.icono3"
                targetFolder="waterplast-categorias" @upload-start="handleIconStart3"
                @upload-complete="handleIconComplete3" />
        </FormFieldsContainer>

        <MultiImageField v-model="formData.imagenesRedes" id="imagenesRedes"
            label="Imágenes para Redes (320px x 400px) - Mínimo 1, recomendado 4/5" :error="errors.imagenesRedes"
            required targetFolder="waterplast-categorias" @upload-start="handleImagenesRedesStart"
            @upload-complete="handleImagenesRedesComplete" />

        <div class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? 'Actualizando...' : 'Actualizar Categoría' }}
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
import MultiImageField from '~/components/form/MultiImageField.vue'
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
const imagenMenu = ref(null)
const imagenHeroHome = ref(null)
const imagenXLCategorias = ref(null)
const imagenLCategorias = ref(null)
const imagenMCategorias = ref(null)
const imagenSCategorias = ref(null)
const icono1 = ref(null)
const icono2 = ref(null)
const icono3 = ref(null)
const imagenesRedes = ref([])

const formData = reactive({
    color: '',
    orden: 0,
    imagenMenu: null,
    imagenHeroHome: null,
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
    estado: true,
})

const errors = reactive({
    color: '',
    orden: '',
    imagenMenu: '',
    imagenHeroHome: '',
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
    imagenesRedes: '',
    estado: ''
})

watch(() => props.initialData, async (newData) => {
    if (props.isEditing && newData) {
        const processedImagenes = newData.imagenes_redes && Array.isArray(newData.imagenes_redes)
            ? newData.imagenes_redes.map((img, index) => ({
                id: img.id || `existing-${index}`,
                name: img.name || `imagen-${index + 1}.jpg`,
                url: img.url,
                preview: img.url,
                isExisting: true,
                filename: img.name || `imagen-${index + 1}.jpg`,
                file: null,
                orden: index + 1,
                es_principal: index === 0
            })) : []

        Object.assign(formData, {
            color: newData.color || '',
            orden: newData.orden || 0,
            imagenMenu: newData.imagen_menu || null,
            imagenHeroHome: newData.imagen_hero_home || null,
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
            estado: newData.estado !== false,
        })

        await nextTick()
        formData.imagenesRedes = processedImagenes
    }
}, { immediate: true, deep: true })

const handleImageMenuStart = (file) => {
    imagenMenu.value = file
    errors.imagenMenu = ''
}

const handleImageMenuComplete = () => {
    errors.imagenMenu = ''
}

const handleImageHeroHomeStart = (file) => {
    imagenHeroHome.value = file
    errors.imagenHeroHome = ''
}

const handleImageHeroHomeComplete = () => {
    errors.imagenHeroHome = ''
}

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

const handleImagenesRedesStart = (files) => {
    imagenesRedes.value = files
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

    if (!formData.color.trim()) {
        errors.color = 'El color es requerido'
        isValid = false
    } else if (!/^#[0-9A-Fa-f]{6}$/.test(formData.color.trim())) {
        errors.color = 'El color debe ser un código hexadecimal válido (ej: #FF5733)'
        isValid = false
    }

    if (!formData.orden || formData.orden < 1) {
        errors.orden = 'El número de orden es requerido y debe ser mayor a 0'
        isValid = false
    }

    if (!formData.caracteristica1.trim()) {
        errors.caracteristica1 = 'La característica 1 es requerida'
        isValid = false
    }

    if (!formData.caracteristica2.trim()) {
        errors.caracteristica2 = 'La característica 2 es requerida'
        isValid = false
    }

    if (!formData.caracteristica3.trim()) {
        errors.caracteristica3 = 'La característica 3 es requerida'
        isValid = false
    }

    if (!imagenMenu.value && !formData.imagenMenu) {
        errors.imagenMenu = 'La imagen del menú es requerida'
        isValid = false
    }

    if (!imagenHeroHome.value && !formData.imagenHeroHome) {
        errors.imagenHeroHome = 'La imagen hero home es requerida'
        isValid = false
    }

    if (!imagenXLCategorias.value && !formData.imagenXLCategorias) {
        errors.imagenXLCategorias = 'La imagen XL de categorías es requerida'
        isValid = false
    }

    if (!imagenLCategorias.value && !formData.imagenLCategorias) {
        errors.imagenLCategorias = 'La imagen L de categorías es requerida'
        isValid = false
    }

    if (!imagenMCategorias.value && !formData.imagenMCategorias) {
        errors.imagenMCategorias = 'La imagen M de categorías es requerida'
        isValid = false
    }

    if (!imagenSCategorias.value && !formData.imagenSCategorias) {
        errors.imagenSCategorias = 'La imagen S de categorías es requerida'
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

    if (imagenesRedes.value.length === 0 && (!formData.imagenesRedes || formData.imagenesRedes.length === 0)) {
        errors.imagenesRedes = 'Al menos una imagen para redes sociales es requerida'
        isValid = false
    }

    if (typeof formData.estado !== 'boolean') {
        errors.estado = 'El estado debe ser válido'
        isValid = false
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }

    submitting.value = true

    try {
        const categoriaData = {
            color: formData.color.trim(),
            orden: parseInt(formData.orden),
            caracteristica1: formData.caracteristica1.trim(),
            caracteristica2: formData.caracteristica2.trim(),
            caracteristica3: formData.caracteristica3.trim(),
            estado: formData.estado,
        }

        if (props.isEditing) {
            if (!imagenMenu.value) categoriaData.imagen_menu = formData.imagenMenu
            if (!imagenHeroHome.value) categoriaData.imagen_hero_home = formData.imagenHeroHome
            if (!imagenXLCategorias.value) categoriaData.imagen_xl_categorias = formData.imagenXLCategorias
            if (!imagenLCategorias.value) categoriaData.imagen_l_categorias = formData.imagenLCategorias
            if (!imagenMCategorias.value) categoriaData.imagen_m_categorias = formData.imagenMCategorias
            if (!imagenSCategorias.value) categoriaData.imagen_s_categorias = formData.imagenSCategorias
            if (!icono1.value) categoriaData.icono1 = formData.icono1
            if (!icono2.value) categoriaData.icono2 = formData.icono2
            if (!icono3.value) categoriaData.icono3 = formData.icono3
            if (imagenesRedes.value.length === 0) categoriaData.imagenes_redes = formData.imagenesRedes
        }

        emit('submit', {
            categoriaData,
            imagenes: {
                imagenMenu: imagenMenu.value,
                imagenHeroHome: imagenHeroHome.value,
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
            imagenesRedes: imagenesRedes.value
        })

    } catch (error) {
        console.error('Error in form submission:', error)
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>