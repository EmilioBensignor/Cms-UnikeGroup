<template>
    <div class="w-full flex flex-col gap-6">
        <div v-for="(caracteristica, index) in caracteristicas" :key="caracteristica.localId || caracteristica.id" class="w-full">
            <div class="overflow-hidden border-b border-terciary pb-6">
                <div @click="toggleAccordion(caracteristica.localId || caracteristica.id)"
                    class="flex items-center justify-between cursor-pointer">
                    <div class="flex items-center gap-3 bg-gray-mid rounded-md p-1.5">
                        <button @click.stop="removeCaracteristica(caracteristica.localId || caracteristica.id)" type="button"
                            class="flex justify-center items-center text-error">
                            <Icon name="tabler:x" class="w-4 h-4" />
                        </button>
                        <p class="lg:text-xl">Característica: <span class="font-bold">{{ index + 1 }}</span></p>
                    </div>
                    <Icon name="tabler:chevron-down" class="w-5 h-5 text-secondary transition-transform duration-200"
                        :class="caracteristica.isOpen ? 'rotate-180' : ''" />
                </div>

                <Transition
                    enter-active-class="transition-all duration-300 ease-out"
                    leave-active-class="transition-all duration-300 ease-in"
                    enter-from-class="max-h-0 opacity-0 overflow-hidden"
                    enter-to-class="max-h-96 opacity-100"
                    leave-from-class="max-h-96 opacity-100"
                    leave-to-class="max-h-0 opacity-0 overflow-hidden">
                    <div v-show="caracteristica.isOpen" class="pt-3">
                        <FormFieldsContainer>
                            <FormImageField v-model="caracteristica.imagen" :id="`imagen_${caracteristica.localId || caracteristica.id}`"
                                label="Imagen (72px x 72px)" :error="caracteristica.errors.imagen" required :acceptedTypes="['webp', 'svg']"
                                targetFolder="waterplast-productos-caracteristicas"
                                @upload-start="(file) => handleImagenStart(caracteristica.localId || caracteristica.id, file)"
                                @upload-complete="(dataUrl) => handleImagenComplete(caracteristica.localId || caracteristica.id, dataUrl)" />

                            <FormTextarea v-model="caracteristica.descripcion" :id="`descripcion_${caracteristica.localId || caracteristica.id}`"
                                label="Descripción" placeholder="Ingrese la descripción de la característica"
                                :error="caracteristica.errors.descripcion" required />
                        </FormFieldsContainer>
                    </div>
                </Transition>
            </div>
        </div>

        <ButtonPrimary @click="addCaracteristica" type="button" class="w-max flex items-center gap-2">
            <Icon name="tabler:plus" class="w-5 h-5" />
            Agregar Característica
        </ButtonPrimary>
    </div>
</template>

<script setup>
const emit = defineEmits(['update'])

const caracteristicas = ref([])
let nextId = 1

const loadCaracteristicas = (existingCaracteristicas) => {
    caracteristicas.value = existingCaracteristicas.map((c, index) => ({
        ...c,
        localId: nextId + index,
        dbId: c.id,
        imageFile: null
    }))

    if (existingCaracteristicas.length > 0) {
        nextId = nextId + existingCaracteristicas.length
    }

    emitUpdate()
}

const addCaracteristica = () => {
    const newCaracteristica = {
        localId: nextId++,
        id: null,
        imagen: null,
        imageFile: null,
        descripcion: '',
        isOpen: true,
        errors: {
            imagen: '',
            descripcion: ''
        }
    }

    caracteristicas.value.forEach(c => c.isOpen = false)

    caracteristicas.value.push(newCaracteristica)
    emitUpdate()
}

const removeCaracteristica = (id) => {
    caracteristicas.value = caracteristicas.value.filter(c => (c.localId || c.id) !== id)
    emitUpdate()
}

const toggleAccordion = (id) => {
    const caracteristica = caracteristicas.value.find(c => (c.localId || c.id) === id)
    if (caracteristica) {
        caracteristica.isOpen = !caracteristica.isOpen
    }
}

const handleImagenStart = (id, file) => {
    const caracteristica = caracteristicas.value.find(c => (c.localId || c.id) === id)
    if (caracteristica) {
        caracteristica.errors.imagen = ''
        caracteristica.imageFile = file
    }
    emitUpdate()
}

const handleImagenComplete = (id, dataUrl) => {
    const caracteristica = caracteristicas.value.find(c => (c.localId || c.id) === id)
    if (caracteristica) {
        caracteristica.errors.imagen = ''
        if (caracteristica.imageFile) {
            caracteristica.imagen = dataUrl
        }
    }
    emitUpdate()
}

const validateCaracteristicas = () => {
    let isValid = true

    caracteristicas.value.forEach(caracteristica => {
        caracteristica.errors.imagen = ''
        caracteristica.errors.descripcion = ''

        if (!caracteristica.imagen) {
            caracteristica.errors.imagen = 'La imagen es requerida'
            isValid = false
        }

        if (!caracteristica.descripcion.trim()) {
            caracteristica.errors.descripcion = 'La descripción es requerida'
            isValid = false
        }
    })

    return isValid
}

const emitUpdate = () => {
    const caracteristicasData = caracteristicas.value.map(c => ({
        id: c.id,
        dbId: c.dbId,
        imagen: c.imageFile || c.imagen,
        descripcion: c.descripcion.trim()
    }))

    emit('update', caracteristicasData)
}

watch(() => caracteristicas.value, () => {
    caracteristicas.value.forEach(caracteristica => {
        if (caracteristica.descripcion) {
            caracteristica.errors.descripcion = ''
        }
    })
    emitUpdate()
}, { deep: true })

defineExpose({
    validateCaracteristicas,
    caracteristicas,
    loadCaracteristicas
})
</script>