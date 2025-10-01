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
        const hashParams = new URLSearchParams(window.location.hash.substring(1))
        const type = hashParams.get('type')
        const accessToken = hashParams.get('access_token')
        const refreshToken = hashParams.get('refresh_token')

        if (type === 'recovery' && accessToken) {
            const { error: sessionError } = await client.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || ''
            })

            if (sessionError) {
                console.error('Error al establecer sesión:', sessionError)
                errorMsg.value = 'El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.'
                setTimeout(() => {
                    router.push(ROUTE_NAMES.FORGOT_PASSWORD)
                }, 3000)
                return
            }

            window.history.replaceState(null, '', window.location.pathname)
            console.log('✅ Sesión de recuperación establecida correctamente')
            return
        }

        const { data: { session }, error } = await client.auth.getSession()

        if (error) {
            console.error('Error al verificar sesión:', error)
            errorMsg.value = 'El enlace de recuperación es inválido o ha expirado. Por favor solicita uno nuevo.'
            setTimeout(() => {
                router.push(ROUTE_NAMES.FORGOT_PASSWORD)
            }, 3000)
            return
        }

        if (!session) {
            errorMsg.value = 'No tienes una sesión de recuperación activa. Por favor usa el enlace que te enviamos por correo.'
            setTimeout(() => {
                router.push(ROUTE_NAMES.FORGOT_PASSWORD)
            }, 3000)
            return
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