<template>
    <DefaultSection>
        <div class="flex flex-col items-center gap-4">
            <Icon name="tabler:loader-2" size="3rem" class="animate-spin text-primary" />
            <p class="text-dark text-xl">Procesando...</p>
        </div>
    </DefaultSection>
</template>

<script setup>
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'

definePageMeta({
    layout: "auth",
});

const client = useSupabaseClient()
const router = useRouter()
const route = useRoute()

onMounted(async () => {
    try {
        // Obtener el hash de la URL que contiene el token
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const type = hashParams.get('type')
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        // Si es un recovery (reset password)
        if (type === 'recovery' && accessToken) {
            // Establecer la sesión con los tokens del hash
            const { error } = await client.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
            })

            if (error) {
                console.error('Error al establecer sesión:', error)
                error('El enlace de recuperación es inválido o ha expirado', {
                    title: 'Error',
                    duration: 5000
                })
                await router.push(ROUTE_NAMES.FORGOT_PASSWORD)
                return
            }

            // Redirigir a reset-password
            await router.push(ROUTE_NAMES.RESET_PASSWORD)
            return
        }

        // Si es confirmación de email u otro tipo
        if (type === 'signup' || type === 'email_change' || type === 'invite') {
            if (accessToken) {
                const { error } = await client.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken || ''
                })

                if (error) {
                    console.error('Error al verificar email:', error)
                    error('Error al verificar el correo electrónico', {
                        title: 'Error',
                        duration: 5000
                    })
                    await router.push(ROUTE_NAMES.LOGIN)
                    return
                }

                success('¡Correo electrónico verificado exitosamente!', {
                    title: 'Verificación exitosa',
                    duration: 5000
                })
                await router.push(ROUTE_NAMES.LOGIN)
                return
            }
        }

        // Si no hay tipo reconocido, redirigir al login
        await router.push(ROUTE_NAMES.LOGIN)

    } catch (err) {
        console.error('Error en callback:', err)
        await router.push(ROUTE_NAMES.LOGIN)
    }
})
</script>