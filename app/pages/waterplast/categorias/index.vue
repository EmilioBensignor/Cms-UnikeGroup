<template>
    <DefaultSection>
        <HeadingH1>Categorías</HeadingH1>

        <div v-if="loading" class="flex justify-center items-center py-12">
            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>

        <div v-else-if="categorias.length === 0" class="text-center py-12">
            <Icon name="tabler:category" class="w-16 h-16" />
            <p class="text-dark text-lg">No hay categorías disponibles</p>
        </div>

        <TableLayout v-else :data="categorias" :columns="tabla.columns" :empty-state-text="`No hay categorías creadas`"
            table-name="categorias" :show-actions="true" :show-delete="false" @edit="handleEdit" />
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
import { useWaterplastCategorias } from '~/composables/waterplast/useCategorias.js'

const { categorias, loading, fetchCategorias } = useWaterplastCategorias()

const tabla = {
    columns: [
        {
            key: 'orden',
            label: 'Orden',
            type: 'number'
        },
        {
            key: 'nombre',
            label: 'Nombre',
        },
        {
            key: 'color',
            label: 'Color',
            type: 'color'
        },
        {
            key: 'imagen_menu',
            label: 'Img Menú',
            type: 'image'
        },
        {
            key: 'imagen_hero_home',
            label: 'Img Hero',
            type: 'image'
        },
        {
            key: 'imagen_pagina_categorias',
            label: 'Img Categorías',
            type: 'image'
        },
        {
            key: 'caracteristica1',
            label: 'Caract. 1',
        },
        {
            key: 'icono1',
            label: 'Icono 1',
            type: 'image'
        },
        {
            key: 'caracteristica2',
            label: 'Caract. 2',
        },
        {
            key: 'icono2',
            label: 'Icono 2',
            type: 'image'
        },
        {
            key: 'caracteristica3',
            label: 'Caract. 3',
        },
        {
            key: 'icono3',
            label: 'Icono 3',
            type: 'image'
        },
        {
            key: 'imagenes_redes_count',
            label: 'Redes',
            type: 'text'
        },
        {
            key: 'estado',
            label: 'Estado',
            type: 'boolean'
        }
    ]
}

onMounted(async () => {
    try {
        await fetchCategorias()
    } catch (err) {
        console.error('Error loading categorias:', err)
    }
})

const handleEdit = (categoria) => {
    navigateTo(ROUTE_NAMES.WATERPLAST.EDITAR_CATEGORIA(categoria.id))
}
</script>