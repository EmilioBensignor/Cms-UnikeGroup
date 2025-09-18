<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.color" label="Color" id="color"
                placeholder="Ingresa el color (ej: #FFFFFF)" required :error="errors.color" />
            <FormImageField v-model="formData.imagenPrincipal" id="imagenPrincipal" label="Imagen Principal"
                :error="errors.imagenPrincipal" required targetFolder="waterplast-categorias"
                @upload-start="handleImageStart" @upload-complete="handleImageComplete" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormSwitch v-model="formData.estado" id="estado" label="Estado" required :error="errors.estado" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica1" label="Característica 1" id="caracteristica1"
                placeholder="Ingresa la primera característica" required :error="errors.caracteristica1" />

            <FormImageField v-model="formData.icono1" id="icono1" label="Icono 1" :error="errors.icono1" required
                targetFolder="waterplast-categorias" @upload-start="handleIconStart1"
                @upload-complete="handleIconComplete1" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica2" label="Característica 2" id="caracteristica2"
                placeholder="Ingresa la segunda característica" required :error="errors.caracteristica2" />

            <FormImageField v-model="formData.icono2" id="icono2" label="Icono 2" :error="errors.icono2" required
                targetFolder="waterplast-categorias" @upload-start="handleIconStart2"
                @upload-complete="handleIconComplete2" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica3" label="Característica 3" id="caracteristica3"
                placeholder="Ingresa la tercera característica" required :error="errors.caracteristica3" />

            <FormImageField v-model="formData.icono3" id="icono3" label="Icono 3" :error="errors.icono3" required
                targetFolder="waterplast-categorias" @upload-start="handleIconStart3"
                @upload-complete="handleIconComplete3" />
        </FormFieldsContainer>

        <MultiImageField v-model="formData.imagenesRedes" id="imagenesRedes" label="Imágenes para Redes (mínimo 1)"
            :error="errors.imagenesRedes" required targetFolder="waterplast-categorias"
            @upload-start="handleImagenesRedesStart" @upload-complete="handleImagenesRedesComplete" />

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
const imagenPrincipal = ref(null)
const icono1 = ref(null)
const icono2 = ref(null)
const icono3 = ref(null)
const imagenesRedes = ref([])

const formData = reactive({
    color: '',
    imagenPrincipal: null,
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
    imagenPrincipal: '',
    caracteristica1: '',
    icono1: '',
    caracteristica2: '',
    icono2: '',
    caracteristica3: '',
    icono3: '',
    imagenesRedes: '',
    estado: ''
})

onMounted(() => {
    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            color: props.initialData.color || '',
            imagenPrincipal: props.initialData.imagen || null,
            caracteristica1: props.initialData.caracteristica1 || '',
            icono1: props.initialData.icono1 || null,
            caracteristica2: props.initialData.caracteristica2 || '',
            icono2: props.initialData.icono2 || null,
            caracteristica3: props.initialData.caracteristica3 || '',
            icono3: props.initialData.icono3 || null,
            imagenesRedes: props.initialData.imagenes_redes || [],
            estado: props.initialData.estado !== false,
        })
    }
})

const handleImageStart = (file) => {
    imagenPrincipal.value = file
    errors.imagenPrincipal = ''
}

const handleImageComplete = () => {
    errors.imagenPrincipal = ''
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

    if (!imagenPrincipal.value && !formData.imagenPrincipal) {
        errors.imagenPrincipal = 'La imagen principal es requerida'
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
            caracteristica1: formData.caracteristica1.trim(),
            caracteristica2: formData.caracteristica2.trim(),
            caracteristica3: formData.caracteristica3.trim(),
            estado: formData.estado,
        }

        if (props.isEditing) {
            if (!imagenPrincipal.value) categoriaData.imagen = formData.imagenPrincipal
            if (!icono1.value) categoriaData.icono1 = formData.icono1
            if (!icono2.value) categoriaData.icono2 = formData.icono2
            if (!icono3.value) categoriaData.icono3 = formData.icono3
            if (imagenesRedes.value.length === 0) categoriaData.imagenes_redes = formData.imagenesRedes
        }

        emit('submit', {
            categoriaData,
            imagenPrincipal: imagenPrincipal.value,
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