<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormImageField v-model="formData.imagen_chica" label="Imagen Chica (340px x 180px)" id="imagen_chica"
                required :error="errors.imagen_chica" :current-image="initialData?.imagen_chica" />

            <FormImageField v-model="formData.imagen_mediana" label="Imagen Mediana (280px x 290px)" id="imagen_mediana"
                required :error="errors.imagen_mediana" :current-image="initialData?.imagen_mediana" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormImageField v-model="formData.imagen_grande" label="Imagen Grande (645px x 290px)" id="imagen_grande"
                required :error="errors.imagen_grande" :current-image="initialData?.imagen_grande" />
        </FormFieldsContainer>

        <div class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Imagen Destacada' :
                    'Crear Imagen Destacada') }}
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

const formData = reactive({
    imagen_chica: null,
    imagen_mediana: null,
    imagen_grande: null,
})

const errors = reactive({
    imagen_chica: '',
    imagen_mediana: '',
    imagen_grande: ''
})

onMounted(() => {
    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            imagen_chica: null,
            imagen_mediana: null,
            imagen_grande: null,
        })
    }
})

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    if (!props.isEditing) {
        if (!formData.imagen_chica) {
            errors.imagen_chica = 'La imagen chica es requerida'
            isValid = false
        }

        if (!formData.imagen_mediana) {
            errors.imagen_mediana = 'La imagen mediana es requerida'
            isValid = false
        }

        if (!formData.imagen_grande) {
            errors.imagen_grande = 'La imagen grande es requerida'
            isValid = false
        }
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) {
        return
    }

    submitting.value = true

    try {
        const imagenDestacadaData = {}

        if (formData.imagen_chica) {
            imagenDestacadaData.imagen_chica = formData.imagen_chica
        }

        if (formData.imagen_mediana) {
            imagenDestacadaData.imagen_mediana = formData.imagen_mediana
        }

        if (formData.imagen_grande) {
            imagenDestacadaData.imagen_grande = formData.imagen_grande
        }

        emit('submit', imagenDestacadaData)

    } catch (error) {
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}
</script>