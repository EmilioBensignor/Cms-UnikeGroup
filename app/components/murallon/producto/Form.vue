<template>
    <FormLayout @submit.prevent="handleSubmit">
        <FormFieldsContainer>
            <FormTextField v-model="formData.nombre" label="Nombre" id="nombre"
                placeholder="Ingrese el nombre del producto" required :error="errors.nombre" />
            <FormTextField v-model="formData.rendimiento" label="Rendimiento" id="rendimiento"
                placeholder="Ej: 10 - 16 m² / L" required :error="errors.rendimiento" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormSelect v-model="formData.categorias_id" label="Categoría" id="categorias_id"
                placeholder="Seleccione una categoría" :options="opcionesCategorias" required
                :error="errors.categorias_id" />
            <FormSelect v-model="formData.tipos_aplicacion_id" label="Tipo de Aplicación" id="tipos_aplicacion_id"
                placeholder="Seleccione un tipo de aplicación" :options="opcionesTiposAplicacion" required
                :error="errors.tipos_aplicacion_id" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormImageField v-model="imagePreview" id="imagen_principal" label="Imagen Principal"
                :error="errors.imagen_principal" required targetFolder="murallon-productos"
                @upload-start="handleImageStart" @upload-complete="handleImageComplete" />
            <FormFileField v-model="formData.ficha_tecnica" id="ficha_tecnica" label="Ficha Técnica (PDF)"
                :acceptedTypes="['pdf']" targetFolder="murallon-productos" @upload-start="handleFichaTecnicaStart"
                @upload-complete="handleFichaTecnicaComplete" @file-removed="() => removedFiles.fichaTecnica = true" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormCheckboxGroupField v-model="formData.uso" label="Uso" id="uso" :options="usoOptions" required
                :error="errors.uso" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormCheckboxGroupField v-model="formData.tamanos_disponibles" label="Tamaños Disponibles"
                id="tamanos_disponibles" :options="tamanosOptions" required :error="errors.tamanos_disponibles" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormSwitch v-model="formData.destacado" label="Destacado" id="destacado" />
            <FormTextField v-model="formData.codigo_color_card" label="Código de color Card HEX (sin el #)"
                id="codigo_color_card" placeholder="Ej: 62CBC9" required :error="errors.codigo_color_card" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.descripcion" label="Descripción" id="descripcion"
                placeholder="Descripción del producto" required :error="errors.descripcion" :show-formatting="true"
                :rows="4" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormMultiImageField v-model="galeriaImages" id="galeria" label="Galería de Imágenes"
                targetFolder="murallon-productos" @images-changed="handleGaleriaChanged" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.usos" label="Usos" id="usos" placeholder="Descripción de usos del producto"
                :show-formatting="true" :rows="4" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.colores" label="Colores" id="colores" placeholder="Colores disponibles"
                :show-formatting="true" :rows="3" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormTextField v-model="formData.acabado" label="Acabado" id="acabado" placeholder="Tipo de acabado" />
            <FormTextField v-model="formData.peso_especifico" label="Peso Específico" id="peso_especifico"
                placeholder="Peso específico" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormTextField v-model="formData.poder_cubritivo" label="Poder Cubritivo" id="poder_cubritivo"
                placeholder="Poder cubritivo" />
            <FormTextField v-model="formData.consistencia_o_viscocidad" label="Consistencia o Viscosidad"
                id="consistencia_o_viscocidad" placeholder="Consistencia o viscosidad" />
        </FormFieldsContainer>
        <FormFieldsContainer>
            <FormTextarea v-model="formData.rendimiento_caracteristicas" label="Rendimiento (Características)"
                id="rendimiento_caracteristicas" placeholder="Rendimiento del producto" :show-formatting="true"
                :rows="3" />
            <FormTextarea v-model="formData.secado" label="Secado" id="secado" placeholder="Tiempos de secado"
                :show-formatting="true" :rows="3" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.modo_de_empleo" label="Modo de Empleo" id="modo_de_empleo"
                placeholder="Instrucciones de uso" :show-formatting="true" :rows="5" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.aplicacion" label="Aplicación" id="aplicacion"
                placeholder="Métodos de aplicación" :show-formatting="true" :rows="5" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.recomendaciones_generales" label="Recomendaciones Generales"
                id="recomendaciones_generales" placeholder="Recomendaciones generales" :show-formatting="true"
                :rows="5" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.recomendaciones_seguridad" label="Recomendaciones de Seguridad"
                id="recomendaciones_seguridad" placeholder="Recomendaciones de seguridad" :show-formatting="true"
                :rows="5" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.notas_legales" label="Notas Legales" id="notas_legales"
                placeholder="Notas legales" :show-formatting="true" :rows="5" />
        </FormFieldsContainer>

        <div v-if="showButtons" class="w-full flex flex-col lg:flex-row items-center gap-5 mt-8">
            <ButtonPrimary @click="$emit('cancel')" type="button" class="!bg-gray-mid !text-dark">
                Cancelar
            </ButtonPrimary>

            <ButtonPrimary type="submit" :disabled="submitting">
                <Icon v-if="submitting" name="tabler:loader-2" class="w-4 h-4 animate-spin mr-2" />
                {{ submitting ? (isEditing ? 'Actualizando...' : 'Creando...') : (isEditing ? 'Actualizar Producto' :
                    'Crear Producto') }}
            </ButtonPrimary>
        </div>
    </FormLayout>
</template>

<script setup>
import { useMurallonCategorias } from '~/composables/murallon/useCategorias.js'
import { useMurallonTiposAplicacion } from '~/composables/murallon/useTiposAplicacion.js'

const { error: showValidationError } = useNotification()

const props = defineProps({
    isEditing: {
        type: Boolean,
        default: false
    },
    initialData: {
        type: Object,
        default: () => ({})
    },
    showButtons: {
        type: Boolean,
        default: true
    }
})

const emit = defineEmits(['submit', 'cancel'])

const { categorias, fetchCategorias } = useMurallonCategorias()
const { tiposAplicacion, fetchTiposAplicacion } = useMurallonTiposAplicacion()

const submitting = ref(false)
const imagen = ref(null)
const imagePreview = ref(null)
const galeriaImages = ref([])
const removedGaleriaImages = ref([])
const fichaTecnicaFile = ref(null)
const removedFiles = reactive({ fichaTecnica: false })

const usoOptions = [
    { value: 'Interior', label: 'Interior' },
    { value: 'Exterior', label: 'Exterior' }
]

const tamanosOptions = [
    { value: '1 L', label: '1 L' },
    { value: '4 L', label: '4 L' },
    { value: '10 L', label: '10 L' },
    { value: '20 L', label: '20 L' }
]

const formData = reactive({
    nombre: '',
    categorias_id: '',
    tipos_aplicacion_id: '',
    uso: [],
    tamanos_disponibles: [],
    rendimiento: '',
    destacado: false,
    codigo_color_card: '',
    descripcion: '',
    ficha_tecnica: '',
    usos: '',
    colores: '',
    acabado: '',
    poder_cubritivo: '',
    rendimiento_caracteristicas: '',
    consistencia_o_viscocidad: '',
    secado: '',
    peso_especifico: '',
    modo_de_empleo: '',
    aplicacion: '',
    recomendaciones_generales: '',
    recomendaciones_seguridad: '',
    notas_legales: '',
})

const errors = reactive({
    nombre: '',
    imagen_principal: '',
    categorias_id: '',
    tipos_aplicacion_id: '',
    rendimiento: '',
    uso: '',
    tamanos_disponibles: '',
    codigo_color_card: '',
    descripcion: '',
})

const opcionesCategorias = computed(() => {
    const opciones = [{ value: '', label: 'Seleccione una categoría' }]
    if (categorias.value) {
        categorias.value.forEach(cat => {
            opciones.push({ value: cat.id, label: cat.nombre })
        })
    }
    return opciones
})

const opcionesTiposAplicacion = computed(() => {
    const opciones = [{ value: '', label: 'Seleccione un tipo de aplicación' }]
    if (tiposAplicacion.value) {
        tiposAplicacion.value.forEach(tipo => {
            opciones.push({ value: tipo.id, label: tipo.nombre })
        })
    }
    return opciones
})

onMounted(async () => {
    await Promise.all([
        fetchCategorias(),
        fetchTiposAplicacion()
    ])

    if (props.isEditing && props.initialData) {
        Object.assign(formData, {
            nombre: props.initialData.nombre || '',
            categorias_id: props.initialData.categorias_id || '',
            tipos_aplicacion_id: props.initialData.tipos_aplicacion_id || '',
            uso: props.initialData.uso || [],
            tamanos_disponibles: props.initialData.tamanos_disponibles || [],
            rendimiento: props.initialData.rendimiento || '',
            destacado: props.initialData.destacado || false,
            codigo_color_card: props.initialData.codigo_color_card || '',
            descripcion: props.initialData.descripcion || '',
            ficha_tecnica: props.initialData.ficha_tecnica || '',
            usos: props.initialData.usos || '',
            colores: props.initialData.colores || '',
            acabado: props.initialData.acabado || '',
            poder_cubritivo: props.initialData.poder_cubritivo || '',
            rendimiento_caracteristicas: props.initialData.rendimiento_caracteristicas || '',
            consistencia_o_viscocidad: props.initialData.consistencia_o_viscocidad || '',
            secado: props.initialData.secado || '',
            peso_especifico: props.initialData.peso_especifico || '',
            modo_de_empleo: props.initialData.modo_de_empleo || '',
            aplicacion: props.initialData.aplicacion || '',
            recomendaciones_generales: props.initialData.recomendaciones_generales || '',
            recomendaciones_seguridad: props.initialData.recomendaciones_seguridad || '',
            notas_legales: props.initialData.notas_legales || '',
        })

        if (props.initialData.imagen_principal) {
            imagePreview.value = props.initialData.imagen_principal
        }

        if (props.initialData.galeria && Array.isArray(props.initialData.galeria)) {
            galeriaImages.value = props.initialData.galeria
        }
    }
})

const handleImageStart = (file) => {
    imagen.value = file
    errors.imagen_principal = ''
}

const handleImageComplete = (imageUrl) => {
    imagePreview.value = imageUrl
    errors.imagen_principal = ''
}

const handleFichaTecnicaStart = (file) => {
    fichaTecnicaFile.value = file
}

const handleFichaTecnicaComplete = (fileUrl) => {
    formData.ficha_tecnica = fileUrl
}

const handleGaleriaChanged = (images) => {
    const removed = galeriaImages.value
        .filter(img => img.isExisting && !images.find(i => i.id === img.id))
        .map(img => img.storagePath)
        .filter(Boolean)

    if (removed.length > 0) {
        removedGaleriaImages.value.push(...removed)
    }

    galeriaImages.value = images
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

    if (!formData.categorias_id) {
        errors.categorias_id = 'La categoría es requerida'
        isValid = false
    }

    if (!formData.tipos_aplicacion_id) {
        errors.tipos_aplicacion_id = 'El tipo de aplicación es requerido'
        isValid = false
    }

    if (!formData.rendimiento.trim()) {
        errors.rendimiento = 'El rendimiento es requerido'
        isValid = false
    }

    if (!formData.uso || formData.uso.length === 0) {
        errors.uso = 'Debe seleccionar al menos un uso'
        isValid = false
    }

    if (!formData.tamanos_disponibles || formData.tamanos_disponibles.length === 0) {
        errors.tamanos_disponibles = 'Debe seleccionar al menos un tamaño'
        isValid = false
    }

    if (!formData.codigo_color_card.trim()) {
        errors.codigo_color_card = 'El código de color es requerido'
        isValid = false
    }

    if (!formData.descripcion.trim()) {
        errors.descripcion = 'La descripción es requerida'
        isValid = false
    }

    if (!props.isEditing) {
        if (!imagen.value && !imagePreview.value) {
            errors.imagen_principal = 'La imagen es requerida'
            isValid = false
        }
    }

    return isValid
}

const handleSubmit = async () => {
    if (!validateForm()) {
        showValidationError('Por favor, completa todos los campos requeridos', {
            title: 'Validación incompleta'
        })
        return
    }

    submitting.value = true

    try {
        const productoData = {
            nombre: formData.nombre.trim(),
            categorias_id: formData.categorias_id,
            tipos_aplicacion_id: formData.tipos_aplicacion_id,
            uso: formData.uso,
            tamanos_disponibles: formData.tamanos_disponibles,
            rendimiento: formData.rendimiento.trim(),
            destacado: formData.destacado,
            codigo_color_card: formData.codigo_color_card.trim(),
            descripcion: formData.descripcion.trim(),
            usos: formData.usos.trim(),
            colores: formData.colores.trim(),
            acabado: formData.acabado.trim(),
            poder_cubritivo: formData.poder_cubritivo.trim(),
            rendimiento_caracteristicas: formData.rendimiento_caracteristicas.trim(),
            consistencia_o_viscocidad: formData.consistencia_o_viscocidad.trim(),
            secado: formData.secado.trim(),
            peso_especifico: formData.peso_especifico.trim(),
            modo_de_empleo: formData.modo_de_empleo.trim(),
            aplicacion: formData.aplicacion.trim(),
            recomendaciones_generales: formData.recomendaciones_generales.trim(),
            recomendaciones_seguridad: formData.recomendaciones_seguridad.trim(),
            notas_legales: formData.notas_legales.trim(),
        }

        if (props.isEditing) {
            productoData.imagen_principal_path = props.initialData?.imagen_principal_path || null
        }

        emit('submit', {
            productoData,
            imagen: imagen.value,
            fichaTecnica: fichaTecnicaFile.value,
            removedFiles: { ...removedFiles },
            galeria: galeriaImages.value,
            removedImages: removedGaleriaImages.value
        })
    } catch (error) {
        console.error('Error al procesar el formulario:', error)
    } finally {
        submitting.value = false
    }
}

defineExpose({
    handleSubmit
})
</script>
