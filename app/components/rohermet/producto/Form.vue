<template>
    <FormLayout @submit.prevent="handleSubmit" class="w-full">
        <FormFieldsContainer>
            <FormTextField v-model="formData.nombre" label="Nombre" id="nombre"
                placeholder="Ingrese el nombre del producto" required :error="errors.nombre" />
            <FormSelect v-model="formData.categoria_id" label="Categoria" id="categoria_id" required
                :error="errors.categoria_id" :options="categoriasOptions" placeholder="Seleccione una categoria" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextarea v-model="formData.descripcion" label="Descripcion" id="descripcion"
                placeholder="Ingrese la descripcion del producto" required :error="errors.descripcion" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormImageField v-model="formData.imagen" id="imagen" label="Imagen principal (450px x 380px)" :error="errors.imagen"
                required targetFolder="rohermet-productos" @upload-start="handleImagenStart"
                @upload-complete="handleImagenComplete" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormFileField v-model="formData.ficha_tecnica" id="ficha_tecnica" label="Ficha Tecnica"
                :error="errors.ficha_tecnica" :acceptedTypes="['pdf']" targetFolder="rohermet-productos"
                @upload-start="handleFichaTecnicaStart" @upload-complete="handleFichaTecnicaComplete"
                @file-removed="() => removedFiles.fichaTecnica = true" />
            <FormFileField v-model="formData.manual_instalacion" id="manual_instalacion" label="Manual de Instalacion"
                :error="errors.manual_instalacion" :acceptedTypes="['pdf']" targetFolder="rohermet-productos"
                @upload-start="handleManualInstalacionStart" @upload-complete="handleManualInstalacionComplete"
                @file-removed="() => removedFiles.manualInstalacion = true" />
        </FormFieldsContainer>

        <MultiImageField v-model="formData.galeria" id="galeria"
            label="Galeria de imagenes del producto" :error="errors.galeria"
            targetFolder="rohermet-productos" @upload-start="handleGaleriaStart"
            @upload-complete="handleGaleriaComplete" />

        <FormFieldsContainer>
            <FormFileField v-model="formData.archivo_html" id="archivo_html" label="Archivo .html para 3D"
                :error="errors.archivo_html" :acceptedTypes="['html']" targetFolder="rohermet-productos"
                @upload-start="handleArchivoHtmlStart" @upload-complete="handleArchivoHtmlComplete"
                @file-removed="() => removedFiles.archivoHtml = true" />
            <FormFileField v-model="formData.render_3d" id="render_3d" label="Carpeta .zip con imagenes para 3D"
                :error="errors.render_3d" :acceptedTypes="['zip']" targetFolder="rohermet-productos"
                @upload-start="handleRender3dStart" @upload-complete="handleRender3dComplete"
                @file-removed="() => removedFiles.render3d = true" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormSwitch v-model="formData.estado" id="estado" label="Estado" required :error="errors.estado" />
            <FormSelect v-model="formData.opcion" label="Opcion" id="opcion" :error="errors.opcion"
                :options="opcionOptions" placeholder="Seleccione opcion" clearable />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.altura_cm" label="Altura (cm)" id="altura_cm" type="number"
                placeholder="Ingrese la altura en centimetros" :error="errors.altura_cm"
                @keydown="preventInvalidNumber" />
            <FormTextField v-model="formData.ancho_cm" label="Ancho (cm)" id="ancho_cm" type="number"
                placeholder="Ingrese el ancho en centimetros" :error="errors.ancho_cm"
                @keydown="preventInvalidNumber" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.largo_cm" label="Largo (cm)" id="largo_cm" type="number"
                placeholder="Ingrese el largo en centimetros" :error="errors.largo_cm"
                @keydown="preventInvalidNumber" />
            <FormTextField v-model="formData.diametro_cm" label="Diametro (cm)" id="diametro_cm" type="number"
                placeholder="Ingrese el diametro en centimetros" :error="errors.diametro_cm"
                @keydown="preventInvalidNumber" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.capacidad_lts" label="Capacidad (lts)" id="capacidad_lts" type="number"
                placeholder="Ingrese la capacidad en litros" :error="errors.capacidad_lts"
                @keydown="preventInvalidNumber" />
            <FormSelect v-model="formData.orientacion" label="Orientacion" id="orientacion" :error="errors.orientacion"
                :options="orientacionOptions" placeholder="Seleccione orientacion" clearable />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormSelect v-model="formData.color" label="Color" id="color" :error="errors.color" :options="colorOptions"
                placeholder="Seleccione color" clearable />
            <FormSelect v-model="formData.tecnologia" label="Tecnologia" id="tecnologia" :error="errors.tecnologia"
                :options="tecnologiaOptions" placeholder="Seleccione tecnologia" clearable />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica1" label="Caracteristica 1" id="caracteristica1"
                placeholder="Ingrese la primera caracteristica" :error="errors.caracteristica1" />
            <FormImageField v-model="formData.icono1" id="icono1" label="Icono 1 (48px x 48px)" :error="errors.icono1"
                targetFolder="rohermet-productos" @upload-start="handleIconStart1"
                @upload-complete="handleIconComplete1" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica2" label="Caracteristica 2" id="caracteristica2"
                placeholder="Ingrese la segunda caracteristica" :error="errors.caracteristica2" />
            <FormImageField v-model="formData.icono2" id="icono2" label="Icono 2 (48px x 48px)" :error="errors.icono2"
                targetFolder="rohermet-productos" @upload-start="handleIconStart2"
                @upload-complete="handleIconComplete2" />
        </FormFieldsContainer>

        <FormFieldsContainer>
            <FormTextField v-model="formData.caracteristica3" label="Caracteristica 3" id="caracteristica3"
                placeholder="Ingrese la tercera caracteristica" :error="errors.caracteristica3" />
            <FormImageField v-model="formData.icono3" id="icono3" label="Icono 3 (48px x 48px)" :error="errors.icono3"
                targetFolder="rohermet-productos" @upload-start="handleIconStart3"
                @upload-complete="handleIconComplete3" />
        </FormFieldsContainer>

        <div v-if="formData.categoria_id && productosRelacionados.length > 0" class="w-full flex flex-col gap-2">
            <FormLabel>Productos Relacionados</FormLabel>
            <FormCheckboxGroupField v-model="formData.productos_relacionados" id="productos_relacionados"
                :options="productosRelacionados" :error="errors.productos_relacionados" />
        </div>

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
import MultiImageField from '~/components/form/MultiImageField.vue'
import { useRohermetCategorias } from '~/composables/rohermet/useCategorias.js'
import { useRohermetProductos } from '~/composables/rohermet/useProductos.js'

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

const submitting = ref(false)
const imagen = ref(null)
const render3d = ref(null)
const archivoHtml = ref(null)
const fichaTecnica = ref(null)
const manualInstalacion = ref(null)
const icono1 = ref(null)
const icono2 = ref(null)
const icono3 = ref(null)

const removedFiles = reactive({
    render3d: false,
    archivoHtml: false,
    fichaTecnica: false,
    manualInstalacion: false
})

const { categorias, fetchCategorias } = useRohermetCategorias()
const { fetchProductosByCategoria } = useRohermetProductos()

const productosRelacionados = ref([])

const categoriasOptions = computed(() => {
    return categorias.value.map(categoria => ({
        value: categoria.id.toString(),
        label: categoria.nombre
    }))
})

const orientacionOptions = [
    { value: 'Vertical', label: 'Vertical' },
    { value: 'Horizontal', label: 'Horizontal' },
    { value: 'No aplica', label: 'No aplica' }
]

const colorOptions = [
    { value: 'Gris', label: 'Gris' },
    { value: 'Blanco', label: 'Blanco' },
    { value: 'Negro', label: 'Negro' },
    { value: 'Naranja', label: 'Naranja' }
]

const tecnologiaOptions = [
    { value: 'Soldadura', label: 'Soldadura' }
]

const opcionOptions = [
    { value: 'Para exteriores', label: 'Para exteriores' },
    { value: 'Para interiores', label: 'Para interiores' }
]

const formData = reactive({
    nombre: '',
    categoria_id: '',
    descripcion: '',
    imagen: null,
    galeria: [],
    render_3d: null,
    archivo_html: null,
    ficha_tecnica: null,
    manual_instalacion: null,
    estado: true,
    altura_cm: null,
    ancho_cm: null,
    largo_cm: null,
    diametro_cm: null,
    capacidad_lts: null,
    orientacion: '',
    color: '',
    tecnologia: '',
    opcion: '',
    caracteristica1: '',
    icono1: null,
    caracteristica2: '',
    icono2: null,
    caracteristica3: '',
    icono3: null,
    productos_relacionados: []
})

const errors = reactive({
    nombre: '',
    categoria_id: '',
    descripcion: '',
    imagen: '',
    galeria: '',
    render_3d: '',
    archivo_html: '',
    ficha_tecnica: '',
    manual_instalacion: '',
    estado: '',
    altura_cm: '',
    ancho_cm: '',
    largo_cm: '',
    diametro_cm: '',
    capacidad_lts: '',
    orientacion: '',
    color: '',
    tecnologia: '',
    opcion: '',
    caracteristica1: '',
    icono1: '',
    caracteristica2: '',
    icono2: '',
    caracteristica3: '',
    icono3: '',
    productos_relacionados: ''
})

watch(() => formData.categoria_id, async (newCategoriaId, oldCategoriaId) => {
    if (newCategoriaId) {
        try {
            const productos = await fetchProductosByCategoria(newCategoriaId)

            const filteredProductos = props.isEditing && props.initialData?.id
                ? productos.filter(p => p.id !== props.initialData.id)
                : productos

            productosRelacionados.value = filteredProductos.map(p => ({
                value: p.id,
                label: p.nombre
            }))

        } catch (error) {
            productosRelacionados.value = []
        }
    } else {
        productosRelacionados.value = []
        formData.productos_relacionados = []
    }
})

watch(() => props.initialData, async (newData) => {
    if (props.isEditing && newData) {
        const processedGaleria = newData.galeria && Array.isArray(newData.galeria)
            ? newData.galeria.map((img, index) => {
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
            nombre: newData.nombre || '',
            categoria_id: newData.categoria_id || '',
            descripcion: newData.descripcion || '',
            imagen: newData.imagen || null,
            render_3d: newData.render_3d || null,
            archivo_html: newData.archivo_html || null,
            ficha_tecnica: newData.ficha_tecnica || null,
            manual_instalacion: newData.manual_instalacion || null,
            estado: newData.estado !== false,
            altura_cm: newData.altura_cm ?? null,
            ancho_cm: newData.ancho_cm ?? null,
            largo_cm: newData.largo_cm ?? null,
            diametro_cm: newData.diametro_cm ?? null,
            capacidad_lts: newData.capacidad_lts ?? null,
            orientacion: newData.orientacion || '',
            color: newData.color || '',
            tecnologia: newData.tecnologia || '',
            opcion: newData.opcion || '',
            caracteristica1: newData.caracteristica1 || '',
            icono1: newData.icono1 || null,
            caracteristica2: newData.caracteristica2 || '',
            icono2: newData.icono2 || null,
            caracteristica3: newData.caracteristica3 || '',
            icono3: newData.icono3 || null,
            productos_relacionados: newData.productos_relacionados || []
        })

        await nextTick()
        formData.galeria = processedGaleria
    }
}, { immediate: true, deep: true })

onMounted(async () => {
    try {
        await fetchCategorias()
    } catch (error) {
        console.error('Error al cargar categorias:', error)
    }
})

const preventInvalidNumber = (event) => {
    if (event.key === '-' || event.key === '+' || event.key === 'e' || event.key === 'E') {
        event.preventDefault()
    }
}

const handleImagenStart = (file) => {
    imagen.value = file
    errors.imagen = ''
}

const handleImagenComplete = () => {
    errors.imagen = ''
}

const handleRender3dStart = (file) => {
    render3d.value = file
    errors.render_3d = ''
}

const handleRender3dComplete = () => {
    errors.render_3d = ''
}

const handleArchivoHtmlStart = (file) => {
    archivoHtml.value = file
    errors.archivo_html = ''
}

const handleArchivoHtmlComplete = () => {
    errors.archivo_html = ''
}

const handleFichaTecnicaStart = (file) => {
    fichaTecnica.value = file
    errors.ficha_tecnica = ''
}

const handleFichaTecnicaComplete = () => {
    errors.ficha_tecnica = ''
}

const handleManualInstalacionStart = (file) => {
    manualInstalacion.value = file
    errors.manual_instalacion = ''
}

const handleManualInstalacionComplete = () => {
    errors.manual_instalacion = ''
}

const handleGaleriaStart = () => {
    errors.galeria = ''
}

const handleGaleriaComplete = () => {
    errors.galeria = ''
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

const validateForm = () => {
    Object.keys(errors).forEach(key => {
        errors[key] = ''
    })

    let isValid = true

    if (!formData.nombre.trim()) {
        errors.nombre = 'El nombre es requerido'
        isValid = false
    }

    if (!formData.categoria_id) {
        errors.categoria_id = 'La categoria es requerida'
        isValid = false
    }

    if (!formData.descripcion.trim()) {
        errors.descripcion = 'La descripcion es requerida'
        isValid = false
    }

    if (!imagen.value && !formData.imagen) {
        errors.imagen = 'La imagen es requerida'
        isValid = false
    }

    if (typeof formData.estado !== 'boolean') {
        errors.estado = 'El estado debe ser valido'
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
        const productoData = {
            nombre: formData.nombre.trim(),
            categoria_id: formData.categoria_id,
            descripcion: formData.descripcion.trim(),
            estado: formData.estado,
            altura_cm: formData.altura_cm ? parseFloat(formData.altura_cm) : null,
            ancho_cm: formData.ancho_cm ? parseFloat(formData.ancho_cm) : null,
            largo_cm: formData.largo_cm ? parseFloat(formData.largo_cm) : null,
            diametro_cm: formData.diametro_cm ? parseFloat(formData.diametro_cm) : null,
            capacidad_lts: formData.capacidad_lts ? parseFloat(formData.capacidad_lts) : null,
            orientacion: formData.orientacion || null,
            color: formData.color || null,
            tecnologia: formData.tecnologia || null,
            opcion: formData.opcion || null,
            caracteristica1: formData.caracteristica1.trim() || null,
            caracteristica2: formData.caracteristica2.trim() || null,
            caracteristica3: formData.caracteristica3.trim() || null,
            productos_relacionados: formData.productos_relacionados || []
        }

        if (props.isEditing) {
            if (!imagen.value) productoData.imagen = formData.imagen

            if (removedFiles.render3d) {
                productoData.render_3d = null
            } else if (!render3d.value) {
                productoData.render_3d = formData.render_3d
            }

            if (removedFiles.archivoHtml) {
                productoData.archivo_html = null
            } else if (!archivoHtml.value) {
                productoData.archivo_html = formData.archivo_html
            }

            if (removedFiles.fichaTecnica) {
                productoData.ficha_tecnica = null
            } else if (!fichaTecnica.value) {
                productoData.ficha_tecnica = formData.ficha_tecnica
            }

            if (removedFiles.manualInstalacion) {
                productoData.manual_instalacion = null
            } else if (!manualInstalacion.value) {
                productoData.manual_instalacion = formData.manual_instalacion
            }

            if (!icono1.value) productoData.icono1 = formData.icono1
            if (!icono2.value) productoData.icono2 = formData.icono2
            if (!icono3.value) productoData.icono3 = formData.icono3
        }

        emit('submit', {
            productoData,
            archivos: {
                imagen: imagen.value,
                render3d: render3d.value,
                archivoHtml: archivoHtml.value,
                fichaTecnica: fichaTecnica.value,
                manualInstalacion: manualInstalacion.value
            },
            iconos: {
                icono1: icono1.value,
                icono2: icono2.value,
                icono3: icono3.value
            },
            galeria: formData.galeria
        })

    } catch (error) {
        errors.general = 'Error al procesar el formulario'
    } finally {
        submitting.value = false
    }
}

defineExpose({
    handleSubmit
})
</script>
