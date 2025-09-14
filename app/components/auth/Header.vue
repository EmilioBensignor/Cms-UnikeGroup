<template>
    <header class="flex justify-center bg-secondary py-4 px-5 lg:py-6 lg:px-24">
        <NuxtLink :to="ROUTE_NAMES.LOGIN">
            <NuxtImg src="/images/Logo-Unike-Group.svg" alt="Logo Unike Group" class="h-10 lg:h-[3.25rem]" />
        </NuxtLink>
    </header>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES';
</script>