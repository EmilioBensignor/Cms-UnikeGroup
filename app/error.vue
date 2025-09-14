<template>
    <DefaultMain>
        <DefaultSection class="h-screen justify-center lg:!gap-9">
            <HeadingH1>¡Ups! Página no encontrada</HeadingH1>
            <p class="max-w-[27.5rem] lg:max-w-[33.75rem] text-center lg:text-xl">
                Parece que has tomado un desvío inesperado. La página que buscas no está disponible o ha cambiado de
                dirección.
            </p>
            <ButtonPrimary :to="ROUTE_NAMES.HOME" class="lg:">
                Volver al inicio
            </ButtonPrimary>
        </DefaultSection>
    </DefaultMain>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES'

const props = defineProps({
    error: Object
})

if (props.error?.statusCode !== 404) {
    console.error('❗️Nuxt captured error:', props.error)
}

useHead({
    title: '404 - Página no encontrada',
    meta: [{ name: 'robots', content: 'noindex, nofollow' }]
})
</script>

<style scoped>
@media (width >=992px) {
    a {
        width: max-content;
    }
}
</style>