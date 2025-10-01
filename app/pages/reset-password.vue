<template>
    <DefaultSection>
        <HeadingH1>Restablecer contraseña</HeadingH1>

        <FormLayout @submit.prevent="handleResetPassword">
            <FormFieldsContainer>
                <FormPasswordField v-model="form.password" label="Nueva contraseña" id="password"
                    placeholder="Ingresa tu nueva contraseña" :error="errors.password" required
                    @blur="validatePassword" />

                <FormPasswordField v-model="form.confirmPassword" label="Confirmar contraseña" id="confirmPassword"
                    placeholder="Confirma tu nueva contraseña" :error="errors.confirmPassword" required
                    @blur="validateConfirmPassword" />
            </FormFieldsContainer>

            <FormError v-if="errorMsg">
                {{ errorMsg }}
            </FormError>

            <ButtonPrimary type="submit">
                <span v-if="!loading">Actualizar contraseña</span>
                <span v-else class="flex justify-center items-center gap-2">
                    <Icon name="tabler:loader-2" class="animate-spin" />
                    Actualizando...
                </span>
            </ButtonPrimary>
        </FormLayout>
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

const form = reactive({
    password: '',
    confirmPassword: ''
})

const errors = reactive({
    password: '',
    confirmPassword: ''
})

const loading = ref(false)
const errorMsg = ref('')
const passwordUpdateAttempted = ref(false)

const isValid = computed(() => {
    return form.password.length > 0 &&
        form.confirmPassword.length > 0 &&
        !errors.password &&
        !errors.confirmPassword &&
        form.password === form.confirmPassword
})

onMounted(async () => {
    try {
        // Verificar que el usuario llegó con un token de recuperación válido
        const { data: { session }, error } = await client.auth.getSession()

        if (error) {
            console.error('Error al verificar sesión:', error)
            errorMsg.value = 'El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.'
            setTimeout(() => {
                router.push(ROUTE_NAMES.FORGOT_PASSWORD)
            }, 3000)
            return
        }

        // Verificar que existe una sesión activa (significa que el token fue válido)
        if (!session) {
            errorMsg.value = 'No tienes una sesión de recuperación activa. Por favor solicita un nuevo enlace de recuperación.'
            setTimeout(() => {
                router.push(ROUTE_NAMES.FORGOT_PASSWORD)
            }, 3000)
            return
        }

        // Verificar que la sesión es de tipo recovery
        const accessToken = session.access_token
        if (accessToken) {
            try {
                // Decodificar el JWT para verificar el tipo de sesión
                const payload = JSON.parse(atob(accessToken.split('.')[1]))
                if (payload.aal !== 'aal1' && !payload.recovery) {
                    console.warn('Sesión no es de tipo recovery')
                }
            } catch (e) {
                console.error('Error al decodificar token:', e)
            }
        }

    } catch (error) {
        console.error('Error al inicializar recuperación:', error)
        errorMsg.value = 'Ha ocurrido un error al verificar el enlace de recuperación.'
        setTimeout(() => {
            router.push(ROUTE_NAMES.FORGOT_PASSWORD)
        }, 3000)
    }
})

const validatePassword = () => {
    if (!form.password) {
        errors.password = 'La contraseña es requerida'
    } else if (form.password.length < 8) {
        errors.password = 'La contraseña debe tener al menos 8 caracteres'
    } else {
        errors.password = ''
    }

    if (form.confirmPassword) {
        validateConfirmPassword()
    }
}

const validateConfirmPassword = () => {
    if (!form.confirmPassword) {
        errors.confirmPassword = 'Debe confirmar la contraseña'
    } else if (form.password !== form.confirmPassword) {
        errors.confirmPassword = 'Las contraseñas no coinciden'
    } else {
        errors.confirmPassword = ''
    }
}

const handleResetPassword = async () => {
    if (passwordUpdateAttempted.value) {
        errorMsg.value = 'El proceso de actualización ya está en curso. Por favor espere.'
        return
    }

    loading.value = true
    errorMsg.value = ''
    passwordUpdateAttempted.value = true

    validatePassword()
    validateConfirmPassword()

    if (errors.password || errors.confirmPassword) {
        loading.value = false
        passwordUpdateAttempted.value = false
        return
    }

    try {
        // Verificar nuevamente la sesión antes de actualizar
        const { data: { session } } = await client.auth.getSession()

        if (!session) {
            errorMsg.value = 'Tu sesión de recuperación ha expirado. Por favor solicita un nuevo enlace.'
            setTimeout(() => {
                router.push(ROUTE_NAMES.FORGOT_PASSWORD)
            }, 3000)
            return
        }

        const { error } = await client.auth.updateUser({
            password: form.password
        })

        if (error) {
            // Manejar errores específicos
            if (error.message?.includes('session') || error.message?.includes('expired')) {
                errorMsg.value = 'Tu sesión de recuperación ha expirado. Por favor solicita un nuevo enlace.'
                setTimeout(() => {
                    router.push(ROUTE_NAMES.FORGOT_PASSWORD)
                }, 3000)
            } else {
                errorMsg.value = handleSupabaseError(error)
            }
            passwordUpdateAttempted.value = false
        } else {
            form.password = ''
            form.confirmPassword = ''

            success('¡Contraseña actualizada exitosamente!', {
                title: 'Contraseña cambiada',
                duration: 7000
            })

            // Cerrar la sesión de recuperación y redirigir al login
            await client.auth.signOut()
            await router.push(ROUTE_NAMES.LOGIN)
        }

    } catch (error) {
        console.error('Error al restablecer contraseña:', error)
        errorMsg.value = 'Error al restablecer la contraseña. Por favor intenta nuevamente.'
        passwordUpdateAttempted.value = false
    } finally {
        loading.value = false
    }
}

watch(() => form.password, () => {
    if (errors.password) errors.password = ''
})

watch(() => form.confirmPassword, () => {
    if (errors.confirmPassword) errors.confirmPassword = ''
})
</script>