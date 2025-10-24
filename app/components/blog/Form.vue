<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.titulo" label="Título" id="titulo" placeholder="Ingrese el título del blog"
                required :error="errors.titulo" />
            <FormImageField v-model="formData.imagen" id="imagen" label="Imagen Principal" :error="errors.imagen"
                required targetFolder="blog" @upload-start="handleImageStart" @upload-complete="handleImageComplete" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormTextField v-model="formData.fecha" label="Fecha" id="fecha" type="date" required
                :error="errors.fecha" />
            <FormTextField v-model="formData.creado_por" label="Creado por" id="creado_por"
                placeholder="Ingrese el nombre de quien crea el blog" required :error="errors.creado_por" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormTextarea v-model="formData.contenido" label="Contenido" id="contenido"
                placeholder="Ingrese el contenido del blog" required :error="errors.contenido"
                :show-formatting="true" />
        </FormFieldsContainer>
        <div class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Blog' :
                    'Crear Blog') }}
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
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
const imagen = ref(null)
const imagePreview = ref(null)

const formData = reactive({
    titulo: '',
    imagen: null,
    contenido: '',
    fecha: new Date().toISOString().split('T')[0],
    creado_por: '',
})

const errors = reactive({
    titulo: '',
    imagen: '',
    contenido: '',
    fecha: '',
    creado_por: ''
})

onMounted(() => {
    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            titulo: props.initialData.titulo || '',
            imagen: props.initialData.imagen_principal || null,
            contenido: props.initialData.contenido || '',
            fecha: props.initialData.fecha || new Date().toISOString().split('T')[0],
            creado_por: props.initialData.creado_por || '',
        })

        if (props.initialData.imagen_principal) {
            imagePreview.value = props.initialData.imagen_principal
        }
    }
})

const handleImageStart = (file) => {
    imagen.value = file
    errors.imagen = ''
}

const handleImageComplete = (imageUrl) => {
    imagePreview.value = imageUrl
    errors.imagen = ''
}

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    if (!formData.titulo.trim()) {
        errors.titulo = 'El título es requerido'
        isValid = false
    } else if (formData.titulo.trim().length < 3) {
        errors.titulo = 'El título debe tener al menos 3 caracteres'
        isValid = false
    }

    if (!formData.contenido.trim()) {
        errors.contenido = 'El contenido es requerido'
        isValid = false
    } else if (formData.contenido.trim().length < 10) {
        errors.contenido = 'El contenido debe tener al menos 10 caracteres'
        isValid = false
    }

    if (!formData.fecha) {
        errors.fecha = 'La fecha es requerida'
        isValid = false
    }

    if (!formData.creado_por.trim()) {
        errors.creado_por = 'El nombre de quién crea es requerido'
        isValid = false
    } else if (formData.creado_por.trim().length < 2) {
        errors.creado_por = 'El nombre debe tener al menos 2 caracteres'
        isValid = false
    }

    if (!props.isEditing && !imagen.value) {
        errors.imagen = 'La imagen es requerida'
        isValid = false
    } else if (props.isEditing && !imagen.value && !imagePreview.value) {
        errors.imagen = 'La imagen es requerida'
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
        const blogData = {
            titulo: formData.titulo.trim(),
            contenido: formData.contenido.trim(),
            fecha: formData.fecha,
            creado_por: formData.creado_por.trim(),
        }

        if (props.isEditing && !imagen.value) {
            blogData.imagen_principal = formData.imagen
        }

        emit('submit', {
            blogData,
            imagen: imagen.value
        })

    } catch (error) {
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>