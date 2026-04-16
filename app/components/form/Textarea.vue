<template>
    <div class="w-full flex flex-col gap-2" data-textarea>
        <FormLabel :id="id" :required="required" v-if="label">{{ label }}</FormLabel>
        <textarea ref="textareaElement" :id="inputId" :placeholder="placeholder" :value="internalDisplay"
            :required="required" :rows="rows" @input="handleInput" @blur="handleBlur" @focus="handleFocus"
            @select="handleSelection"
            class="min-h-[120px] bg-light border border-dark rounded-[5px] outline-none lg:text-xl font-light text-dark lg:placeholder:text-xl placeholder:font-light placeholder:text-gray-dark py-3 px-[0.875rem] resize-none" />
        <div class="flex gap-2" v-if="showFormatting">
            <button type="button" @click="applyFormat('bold')"
                class="w-12 h-12 rounded border bg-light border-dark text-xl hover:bg-gray-100 transition-colors duration-200"
                title="Negrita (**texto**)">
                <strong>B</strong>
            </button>
            <button type="button" @click="applyFormat('italic')"
                class="w-12 h-12 rounded border bg-light border-dark text-xl hover:bg-gray-100 transition-colors duration-200"
                title="Itálica (_texto_)">
                <em>I</em>
            </button>
            <button type="button" @click="applyFormat('underline')"
                class="w-12 h-12 rounded border bg-light border-dark text-xl hover:bg-gray-100 transition-colors duration-200"
                title="Subrayado (~texto~)">
                <u>U</u>
            </button>
            <button type="button" @click="applyFormat('list')"
                class="w-12 h-12 rounded border bg-light border-dark text-xl hover:bg-gray-100 transition-colors duration-200"
                title="Lista">
                <Icon name="tabler:list" class="w-5 h-5" />
            </button>
        </div>
        <FormError v-if="error && showError">{{ error }}</FormError>
    </div>
</template>

<script setup>
const props = defineProps({
    modelValue: {
        type: String,
        default: ''
    },
    label: {
        type: String,
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    error: {
        type: String,
        default: ''
    },
    required: {
        type: Boolean,
        default: false
    },
    id: {
        type: String,
        required: true,
    },
    rows: {
        type: Number,
        default: 4
    },
    showFormatting: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['update:modelValue', 'blur', 'focus'])

const textareaElement = ref(null)
const showError = ref(false)
const selectionStart = ref(0)
const selectionEnd = ref(0)

const internalDisplay = ref('')

const inputId = computed(() => props.id)

const htmlToDisplay = (html) => {
    if (!html) return ''
    let text = html
    text = text.replace(/<b>(.*?)<\/b>/g, '**$1**')
    text = text.replace(/<i>(.*?)<\/i>/g, '_$1_')
    text = text.replace(/<u>(.*?)<\/u>/g, '~$1~')
    text = text.replace(/<br\s*\/?>/g, '\n')
    text = text.replace(/<ul>/g, '')
    text = text.replace(/<\/ul>/g, '')
    text = text.replace(/<li>(.*?)<\/li>/g, '• $1\n')
    text = text.replace(/\n$/, '')
    return text
}

const displayToHtml = (text) => {
    if (!text) return ''

    const convertInline = (line) => {
        return line
            .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
            .replace(/_(.*?)_/g, '<i>$1</i>')
            .replace(/~(.*?)~/g, '<u>$1</u>')
    }

    const lines = text.split('\n')
    let result = ''
    let inList = false
    let listItems = []

    for (const line of lines) {
        if (line.startsWith('• ')) {
            if (!inList) {
                inList = true
                listItems = []
            }
            listItems.push(convertInline(line.substring(2)))
        } else {
            if (inList) {
                result += '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>'
                inList = false
                listItems = []
            }
            result += convertInline(line) + '\n'
        }
    }

    if (inList) {
        result += '<ul>' + listItems.map(item => `<li>${item}</li>`).join('') + '</ul>'
    }

    result = result.replace(/\n$/, '')
    result = result.replace(/\n/g, '<br>')

    return result
}

watch(() => props.modelValue, (newVal) => {
    if (!props.showFormatting) {
        internalDisplay.value = newVal || ''
        return
    }
    const currentHtml = displayToHtml(internalDisplay.value)
    if (newVal !== currentHtml) {
        internalDisplay.value = htmlToDisplay(newVal)
    }
}, { immediate: true })

const handleInput = (event) => {
    const display = event.target.value
    internalDisplay.value = display

    if (props.showFormatting) {
        emit('update:modelValue', displayToHtml(display))
    } else {
        emit('update:modelValue', display)
    }

    if (showError.value) {
        showError.value = false
    }
}

const handleBlur = (event) => {
    if (props.error) {
        showError.value = true
    }
    emit('blur', event)
}

const handleFocus = (event) => {
    emit('focus', event)
}

const handleSelection = () => {
    if (textareaElement.value) {
        selectionStart.value = textareaElement.value.selectionStart
        selectionEnd.value = textareaElement.value.selectionEnd
    }
}

const applyFormat = (format) => {
    if (!textareaElement.value) return

    const currentDisplay = internalDisplay.value
    const start = selectionStart.value
    const end = selectionEnd.value

    const updateDisplay = (newDisplay, selStart, selEnd) => {
        internalDisplay.value = newDisplay
        emit('update:modelValue', displayToHtml(newDisplay))
        nextTick(() => {
            if (textareaElement.value) {
                textareaElement.value.setSelectionRange(selStart, selEnd)
                textareaElement.value.focus()
            }
        })
    }

    if (format === 'list') {
        if (start !== end) {
            const selectedText = currentDisplay.substring(start, end)
            const lines = selectedText.split('\n')
            const bulletLines = lines.map(line => {
                const trimmed = line.trim()
                if (!trimmed) return line
                if (trimmed.startsWith('• ')) return trimmed.substring(2)
                return '• ' + trimmed
            }).join('\n')

            const newDisplay = currentDisplay.substring(0, start) + bulletLines + currentDisplay.substring(end)
            updateDisplay(newDisplay, start, start + bulletLines.length)
        } else {
            const beforeCursor = currentDisplay.substring(0, start)
            const afterCursor = currentDisplay.substring(start)
            const lastNewline = beforeCursor.lastIndexOf('\n')
            const lineStart = lastNewline + 1
            const currentLine = beforeCursor.substring(lineStart)

            if (currentLine.startsWith('• ')) {
                const newDisplay = currentDisplay.substring(0, lineStart) + currentLine.substring(2) + afterCursor
                updateDisplay(newDisplay, start - 2, start - 2)
            } else {
                const newDisplay = currentDisplay.substring(0, lineStart) + '• ' + currentLine + afterCursor
                updateDisplay(newDisplay, start + 2, start + 2)
            }
        }
        return
    }

    if (start === end) return

    const beforeText = currentDisplay.substring(0, start)
    const afterText = currentDisplay.substring(end)
    const selectedText = currentDisplay.substring(start, end)

    const markers = {
        bold: { open: '**', close: '**' },
        italic: { open: '_', close: '_' },
        underline: { open: '~', close: '~' }
    }

    const marker = markers[format]

    if (selectedText.startsWith(marker.open) && selectedText.endsWith(marker.close)) {
        const unwrapped = selectedText.slice(marker.open.length, -marker.close.length)
        const newDisplay = beforeText + unwrapped + afterText
        updateDisplay(newDisplay, start, start + unwrapped.length)
        return
    }

    const formattedText = `${marker.open}${selectedText}${marker.close}`
    const newDisplay = beforeText + formattedText + afterText
    updateDisplay(newDisplay, start, start + formattedText.length)
}

watchEffect(() => {
    if (props.error) {
        showError.value = true
    }
})

const focus = () => {
    if (textareaElement.value) {
        textareaElement.value.focus()
    }
}

defineExpose({
    focus
})
</script>
