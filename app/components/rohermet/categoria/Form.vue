<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormImageField v-model="formData.imagen" id="imagen" label="Imagen" :error="errors.imagen" required
                targetFolder="rohermet-categorias" @upload-start="handleImageStart"
                @upload-complete="handleImageComplete" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.nombre" label="Nombre" id="nombre" placeholder="Ingrese el nombre"
                required :error="errors.nombre" disabled />
            <FormTextField v-model="formData.slug" label="Slug" id="slug" placeholder="Slug automático"
                :error="errors.slug" disabled />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.orden" label="Número de Orden" id="orden" type="number"
                placeholder="Ingrese el número de orden" required :error="errors.orden" />
            <FormSwitch v-model="formData.estado" id="estado" label="Estado" required :error="errors.estado" />
        </FormFieldsContainer>

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

const formData = reactive({
    nombre: '',
    slug: '',
    orden: 0,
    imagen: null,
    estado: true,
})

const errors = reactive({
    nombre: '',
    slug: '',
    orden: '',
    imagen: '',
    estado: ''
})

watch(() => props.initialData, async (newData) => {
    if (props.isEditing && newData) {
        Object.assign(formData, {
            nombre: newData.nombre || '',
            slug: newData.slug || '',
            orden: newData.orden || 0,
            imagen: newData.imagen || null,
            estado: newData.estado !== false,
        })
    }
}, { immediate: true, deep: true })

const handleImageStart = (file) => {
    imagen.value = file
    errors.imagen = ''
}

const handleImageComplete = () => {
    errors.imagen = ''
}

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    if (!formData.nombre.trim()) {
        errors.nombre = 'El nombre es requerido'
        isValid = false
    }

    if (!formData.orden || formData.orden < 1) {
        errors.orden = 'El número de orden es requerido y debe ser mayor a 0'
        isValid = false
    }

    if (!imagen.value && !formData.imagen) {
        errors.imagen = 'La imagen es requerida'
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
            nombre: formData.nombre.trim(),
            orden: parseInt(formData.orden),
            estado: formData.estado,
        }

        if (props.isEditing) {
            if (!imagen.value) categoriaData.imagen = formData.imagen
        }

        emit('submit', {
            categoriaData,
            imagenes: {
                imagen: imagen.value
            }
        })

    } catch (error) {
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>
