export const useStorage = () => {
    const supabase = useSupabaseClient()
    const config = useRuntimeConfig()

    const uploading = ref(false)
    const uploadProgress = ref(0)
    const error = ref(null)

    const validateImageFile = (file) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']
        const maxSize = 10 * 1024 * 1024

        if (!file || !file.type) {
            throw new Error('Archivo inválido o sin tipo')
        }

        if (!allowedTypes.includes(file.type)) {
            throw new Error('Tipo de archivo no permitido. Solo se permiten: JPEG, PNG, WebP, GIF, SVG')
        }

        if (file.size > maxSize) {
            throw new Error('El archivo es demasiado grande. Máximo 10MB')
        }

        return true
    }

    const cleanCategoryName = (name) => {
        return name.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/bio-?360/g, 'bio360')
            .substring(0, 20)
    }

    const generateUniqueProductFolderName = async (productoNombre, capacidadLts = null, marca = 'waterplast') => {
        const bucketName = `${marca}-productos`
        const tableName = `${marca}-productos`

        let baseName = productoNombre.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 20)

        if (capacidadLts && capacidadLts > 0) {
            baseName = `${baseName}-${Math.floor(capacidadLts)}`
        }

        let folderName = baseName
        let counter = 2
        let folderExists = true

        while (folderExists) {
            try {
                const { data: storageData, error: storageError } = await supabase.storage
                    .from(bucketName)
                    .list(folderName, {
                        limit: 1
                    })

                const existsInStorage = !storageError && storageData && storageData.length > 0

                const { data: dbData, error: dbError } = await supabase
                    .from(tableName)
                    .select('id')
                    .or(`imagen.like.${folderName}/%,render_3d.like.${folderName}/%,ficha_tecnica.like.${folderName}/%,manual_instalacion.like.${folderName}/%,archivo_html.like.${folderName}/%,icono1.like.${folderName}/%,icono2.like.${folderName}/%,icono3.like.${folderName}/%`)
                    .limit(1)

                const existsInDatabase = !dbError && dbData && dbData.length > 0

                if (!existsInStorage && !existsInDatabase) {
                    folderExists = false
                } else {
                    folderName = `${baseName}-${counter}`
                    counter++
                }
            } catch (err) {
                folderExists = false
            }
        }

        return folderName
    }

    const uploadOpinionImage = async (file, opinionData) => {
        try {
            uploading.value = true
            uploadProgress.value = 0
            error.value = null

            validateImageFile(file)

            const cleanName = opinionData.nombre.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 20)

            const extension = file.name.split('.').pop().toLowerCase()
            const randomNum = Math.floor(1000 + Math.random() * 9000)

            const fileName = `opinion-waterplast-${cleanName}-${randomNum}.${extension}`

            const { data, error: uploadError } = await supabase.storage
                .from('waterplast-opiniones')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) throw uploadError

            uploadProgress.value = 100
            return data.path

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const deleteOpinionImage = async (storagePath) => {
        try {
            error.value = null

            const { error: deleteError } = await supabase.storage
                .from('waterplast-opiniones')
                .remove([storagePath])

            if (deleteError) throw deleteError

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const getOpinionImageUrl = (storagePath, cacheBust = false) => {
        if (!storagePath) return null
        let url = `${config.public.supabase.url}/storage/v1/object/public/waterplast-opiniones/${storagePath}`

        if (cacheBust) {
            const timestamp = Date.now()
            url += `?v=${timestamp}`
        }

        return url
    }

    const uploadCategoriaImage = async (file, categoriaNombre, marca = 'waterplast') => {
        try {
            uploading.value = true
            uploadProgress.value = 0
            error.value = null

            validateImageFile(file)

            const extension = file.name.split('.').pop().toLowerCase()
            const bucketName = `${marca}-categorias`

            if (categoriaNombre.includes('-xl-categorias')) {
                const baseName = cleanCategoryName(categoriaNombre.replace('-xl-categorias', ''))
                const fileName = `${baseName}/pagina-categoria/imagen-xl.${extension}`

                const { data, error: uploadError } = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true
                    })

                if (uploadError) throw uploadError
                uploadProgress.value = 100
                return data.path

            } else if (categoriaNombre.includes('-l-categorias')) {
                const baseName = cleanCategoryName(categoriaNombre.replace('-l-categorias', ''))
                const fileName = `${baseName}/pagina-categoria/imagen-l.${extension}`

                const { data, error: uploadError } = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true
                    })

                if (uploadError) throw uploadError
                uploadProgress.value = 100
                return data.path

            } else if (categoriaNombre.includes('-m-categorias')) {
                const baseName = cleanCategoryName(categoriaNombre.replace('-m-categorias', ''))
                const fileName = `${baseName}/pagina-categoria/imagen-m.${extension}`

                const { data, error: uploadError } = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true
                    })

                if (uploadError) throw uploadError
                uploadProgress.value = 100
                return data.path

            } else if (categoriaNombre.includes('-s-categorias')) {
                const baseName = cleanCategoryName(categoriaNombre.replace('-s-categorias', ''))
                const fileName = `${baseName}/pagina-categoria/imagen-s.${extension}`

                const { data, error: uploadError } = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true
                    })

                if (uploadError) throw uploadError
                uploadProgress.value = 100
                return data.path

            } else if (categoriaNombre.includes('-menu')) {
                const baseName = cleanCategoryName(categoriaNombre.replace('-menu', ''))
                const fileName = `${baseName}/imagen-menu.${extension}`

                const { data, error: uploadError } = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true
                    })

                if (uploadError) throw uploadError
                uploadProgress.value = 100
                return data.path

            } else if (categoriaNombre.includes('-hero')) {
                const baseName = cleanCategoryName(categoriaNombre.replace('-hero', ''))
                const fileName = `${baseName}/imagen-hero.${extension}`

                const { data, error: uploadError } = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true
                    })

                if (uploadError) throw uploadError
                uploadProgress.value = 100
                return data.path

            } else {
                const cleanName = cleanCategoryName(categoriaNombre)
                const fileName = `${cleanName}/imagen-principal.${extension}`

                const { data, error: uploadError } = await supabase.storage
                    .from(bucketName)
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: true
                    })

                if (uploadError) throw uploadError
                uploadProgress.value = 100
                return data.path
            }

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const uploadCategoriaIcon = async (file, categoriaNombre, iconoNumero) => {
        try {
            uploading.value = true
            uploadProgress.value = 0
            error.value = null

            validateImageFile(file)

            const cleanName = cleanCategoryName(categoriaNombre)

            const extension = file.name.split('.').pop().toLowerCase()

            const fileName = `${cleanName}/iconos/icono-${iconoNumero}.${extension}`

            const { data, error: uploadError } = await supabase.storage
                .from('waterplast-categorias')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) throw uploadError

            uploadProgress.value = 100
            return data.path

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const uploadCategoriaImagenesRedes = async (files, categoriaNombre) => {
        try {
            uploading.value = true
            error.value = null

            const cleanName = cleanCategoryName(categoriaNombre)

            const uploadPromises = files.map(async (imageObj, index) => {
                uploadProgress.value = Math.round((index / files.length) * 100)

                const actualFile = imageObj.file || imageObj

                validateImageFile(actualFile)

                const extension = actualFile.name.split('.').pop().toLowerCase()
                const timestamp = Date.now()
                const randomNum = Math.floor(1000 + Math.random() * 9000)
                const fileName = `${cleanName}/imagenes-redes/red-${timestamp}-${randomNum}-${index}.${extension}`

                const { data, error: uploadError } = await supabase.storage
                    .from('waterplast-categorias')
                    .upload(fileName, actualFile, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (uploadError) throw uploadError

                return data.path
            })

            const paths = await Promise.all(uploadPromises)
            uploadProgress.value = 100

            return paths

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const deleteCategoriaImage = async (storagePath, marca = 'waterplast') => {
        try {
            error.value = null

            const bucketName = `${marca}-categorias`
            const { error: deleteError } = await supabase.storage
                .from(bucketName)
                .remove([storagePath])

            if (deleteError) throw deleteError

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const deleteCategoriaIcon = async (storagePath) => {
        try {
            error.value = null

            const { error: deleteError } = await supabase.storage
                .from('waterplast-categorias')
                .remove([storagePath])

            if (deleteError) throw deleteError

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const deleteCategoriaImagenRed = async (storagePath) => {
        try {
            error.value = null

            const { error: deleteError } = await supabase.storage
                .from('waterplast-categorias')
                .remove([storagePath])

            if (deleteError) throw deleteError

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const getCategoriaImageUrl = (storagePath, marca = 'waterplast', cacheBust = false) => {
        if (!storagePath) return null
        let url = `${config.public.supabase.url}/storage/v1/object/public/${marca}-categorias/${storagePath}`

        if (cacheBust) {
            const timestamp = Date.now()
            url += `?v=${timestamp}`
        }

        return url
    }

    const getCategoriaIconUrl = (storagePath, cacheBust = false) => {
        if (!storagePath) return null
        let url = `${config.public.supabase.url}/storage/v1/object/public/waterplast-categorias/${storagePath}`

        if (cacheBust) {
            const timestamp = Date.now()
            url += `?v=${timestamp}`
        }

        return url
    }

    const getCategoriaImagenRedUrl = (storagePath, cacheBust = false) => {
        if (!storagePath) return null
        let url = `${config.public.supabase.url}/storage/v1/object/public/waterplast-categorias/${storagePath}`

        if (cacheBust) {
            const timestamp = Date.now()
            url += `?v=${timestamp}`
        }

        return url
    }

    const uploadImagenDestacadaChica = async (dataUrl, imagenType) => {
        try {
            uploading.value = true
            uploadProgress.value = 0
            error.value = null

            const response = await fetch(dataUrl)
            const blob = await response.blob()
            const file = new File([blob], 'image.png', { type: blob.type })

            validateImageFile(file)

            const extension = file.type.split('/')[1] || 'png'
            const fileName = `${imagenType}/imagen-chica-waterplast.${extension}`

            const { data, error: uploadError } = await supabase.storage
                .from('waterplast-imagenes-destacadas')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) {
                throw uploadError
            }

            uploadProgress.value = 100
            return data.path

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const uploadImagenDestacadaMediana = async (dataUrl, imagenType) => {
        try {
            uploading.value = true
            uploadProgress.value = 0
            error.value = null

            const response = await fetch(dataUrl)
            const blob = await response.blob()
            const file = new File([blob], 'image.png', { type: blob.type })

            validateImageFile(file)

            const extension = file.type.split('/')[1] || 'png'
            const fileName = `${imagenType}/imagen-mediana-waterplast.${extension}`

            const { data, error: uploadError } = await supabase.storage
                .from('waterplast-imagenes-destacadas')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) throw uploadError

            uploadProgress.value = 100
            return data.path

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const uploadImagenDestacadaGrande = async (dataUrl, imagenType) => {
        try {
            uploading.value = true
            uploadProgress.value = 0
            error.value = null

            const response = await fetch(dataUrl)
            const blob = await response.blob()
            const file = new File([blob], 'image.png', { type: blob.type })

            validateImageFile(file)

            const extension = file.type.split('/')[1] || 'png'
            const fileName = `${imagenType}/imagen-grande-waterplast.${extension}`

            const { data, error: uploadError } = await supabase.storage
                .from('waterplast-imagenes-destacadas')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) throw uploadError

            uploadProgress.value = 100
            return data.path

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const deleteImagenDestacada = async (storagePath) => {
        try {
            error.value = null

            const { error: deleteError } = await supabase.storage
                .from('waterplast-imagenes-destacadas')
                .remove([storagePath])

            if (deleteError) throw deleteError

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const getImagenDestacadaUrl = (storagePath, cacheBust = false) => {
        if (!storagePath) return null
        let url = `${config.public.supabase.url}/storage/v1/object/public/waterplast-imagenes-destacadas/${storagePath}`

        if (cacheBust) {
            const timestamp = Date.now()
            url += `?v=${timestamp}`
        }

        return url
    }

    const uploadProductoImage = async (file, productoNombre, capacidadLts = null, marca = 'waterplast', folderName = null) => {
        try {
            uploading.value = true
            uploadProgress.value = 0
            error.value = null

            validateImageFile(file)

            const folder = folderName || await generateUniqueProductFolderName(productoNombre, capacidadLts, marca)

            const extension = file.name.split('.').pop().toLowerCase()
            const fileName = `${folder}/imagen-principal.${extension}`
            const bucketName = `${marca}-productos`

            const { data, error: uploadError} = await supabase.storage
                .from(bucketName)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) throw uploadError

            uploadProgress.value = 100
            return data.path

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const uploadProductoFile = async (file, fileName, capacidadLts = null, marca = 'waterplast', folderName = null) => {
        try {
            uploading.value = true
            uploadProgress.value = 0
            error.value = null

            const parts = fileName.split('-')
            const productoNombre = parts[0]
            const sufijo = parts.slice(1).join('-') || 'archivo'

            const folder = folderName || await generateUniqueProductFolderName(productoNombre, capacidadLts, marca)

            const extension = file.name.split('.').pop().toLowerCase()
            const bucketName = `${marca}-productos`

            let finalFileName
            if (extension === 'zip') {
                finalFileName = `${folder}/images/${sufijo}.${extension}`
            } else {
                finalFileName = `${folder}/${sufijo}.${extension}`
            }

            const { data, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(finalFileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) throw uploadError

            uploadProgress.value = 100
            return data.path

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const uploadProductoIcon = async (file, productoNombre, iconoNumero, capacidadLts = null, marca = 'waterplast', folderName = null) => {
        try {
            uploading.value = true
            uploadProgress.value = 0
            error.value = null

            validateImageFile(file)

            const folder = folderName || await generateUniqueProductFolderName(productoNombre, capacidadLts, marca)

            const extension = file.name.split('.').pop().toLowerCase()
            const fileName = `${folder}/iconos/icono-${iconoNumero}.${extension}`
            const bucketName = `${marca}-productos`

            const { data, error: uploadError } = await supabase.storage
                .from(bucketName)
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) throw uploadError

            uploadProgress.value = 100
            return data.path

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const uploadProductoGaleriaImagenes = async (files, productoNombre, marca = 'rohermet') => {
        try {
            uploading.value = true
            error.value = null

            const cleanName = productoNombre.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 20)

            const uploadPromises = files.map(async (imageObj, index) => {
                uploadProgress.value = Math.round((index / files.length) * 100)

                const actualFile = imageObj.file || imageObj

                validateImageFile(actualFile)

                const extension = actualFile.name.split('.').pop().toLowerCase()
                const timestamp = Date.now()
                const randomNum = Math.floor(1000 + Math.random() * 9000)
                const fileName = `${cleanName}/galeria/galeria-${timestamp}-${randomNum}-${index}.${extension}`

                const { data, error: uploadError } = await supabase.storage
                    .from(`${marca}-productos`)
                    .upload(fileName, actualFile, {
                        cacheControl: '3600',
                        upsert: false
                    })

                if (uploadError) throw uploadError

                return data.path
            })

            const paths = await Promise.all(uploadPromises)

            uploadProgress.value = 100
            return paths

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const deleteProductoGaleriaImagen = async (storagePath, marca = 'rohermet') => {
        try {
            error.value = null

            const bucketName = `${marca}-productos`
            const { error: deleteError } = await supabase.storage
                .from(bucketName)
                .remove([storagePath])

            if (deleteError) throw deleteError

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const getProductoGaleriaImageUrl = (storagePath, marca = 'rohermet', cacheBust = false) => {
        if (!storagePath) return null
        let url = `${config.public.supabase.url}/storage/v1/object/public/${marca}-productos/${storagePath}`

        if (cacheBust) {
            const timestamp = Date.now()
            url += `?v=${timestamp}`
        }

        return url
    }

    const deleteProductoImage = async (storagePath, marca = 'waterplast') => {
        try {
            error.value = null

            const bucketName = `${marca}-productos`
            const { error: deleteError } = await supabase.storage
                .from(bucketName)
                .remove([storagePath])

            if (deleteError) throw deleteError

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const deleteProductoFile = async (storagePath, marca = 'waterplast') => {
        try {
            error.value = null

            const bucketName = `${marca}-productos`
            const { error: deleteError } = await supabase.storage
                .from(bucketName)
                .remove([storagePath])

            if (deleteError) throw deleteError

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const deleteProductoIcon = async (storagePath) => {
        try {
            error.value = null

            const { error: deleteError } = await supabase.storage
                .from('waterplast-productos')
                .remove([storagePath])

            if (deleteError) throw deleteError

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const getProductoImageUrl = (storagePath, marca = 'waterplast', cacheBust = false) => {
        if (!storagePath) return null
        let url = `${config.public.supabase.url}/storage/v1/object/public/${marca}-productos/${storagePath}`

        if (cacheBust) {
            const timestamp = Date.now()
            url += `?v=${timestamp}`
        }

        return url
    }

    const getProductoFileUrl = (storagePath, marca = 'waterplast', cacheBust = false) => {
        if (!storagePath) return null
        let url = `${config.public.supabase.url}/storage/v1/object/public/${marca}-productos/${storagePath}`

        if (cacheBust) {
            const timestamp = Date.now()
            url += `?v=${timestamp}`
        }

        return url
    }

    const getProductoIconUrl = (storagePath, cacheBust = false) => {
        if (!storagePath) return null
        let url = `${config.public.supabase.url}/storage/v1/object/public/waterplast-productos/${storagePath}`

        if (cacheBust) {
            const timestamp = Date.now()
            url += `?v=${timestamp}`
        }

        return url
    }

    const uploadCaracteristicaImage = async (file, productoNombre, caracteristicaId) => {
        try {
            uploading.value = true
            uploadProgress.value = 0
            error.value = null

            validateImageFile(file)

            const cleanName = productoNombre.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 20)

            const extension = file.name.split('.').pop().toLowerCase()
            const fileName = `${cleanName}/caracteristicas/caracteristica-${caracteristicaId}.${extension}`

            const { data, error: uploadError } = await supabase.storage
                .from('waterplast-productos-caracteristicas')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: true
                })

            if (uploadError) throw uploadError

            uploadProgress.value = 100
            return data.path

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const deleteCaracteristicaImage = async (storagePath) => {
        try {
            error.value = null

            const { error: deleteError } = await supabase.storage
                .from('waterplast-productos-caracteristicas')
                .remove([storagePath])

            if (deleteError) throw deleteError

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const getCaracteristicaImageUrl = (storagePath, cacheBust = false) => {
        if (!storagePath) return null
        let url = `${config.public.supabase.url}/storage/v1/object/public/waterplast-productos-caracteristicas/${storagePath}`

        if (cacheBust) {
            const timestamp = Date.now()
            url += `?v=${timestamp}`
        }

        return url
    }

    const deleteProductoRender3d = async (storagePath, productoNombre, marca = 'waterplast') => {
        try {
            error.value = null

            const bucketName = `${marca}-productos`

            const { error: deleteZipError } = await supabase.storage
                .from(bucketName)
                .remove([storagePath])

            if (deleteZipError) throw deleteZipError

            const cleanName = productoNombre.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 20)

            const imagesPath = `${cleanName}/images`

            const { data: files, error: listError } = await supabase.storage
                .from(bucketName)
                .list(imagesPath, {
                    limit: 1000,
                    sortBy: { column: 'name', order: 'asc' }
                })

            if (!listError && files && files.length > 0) {
                const allPaths = []

                const getFilesRecursively = async (folderPath = '') => {
                    const fullPath = folderPath ? `${imagesPath}/${folderPath}` : imagesPath

                    const { data: items, error: subListError } = await supabase.storage
                        .from(bucketName)
                        .list(fullPath, {
                            limit: 1000,
                            sortBy: { column: 'name', order: 'asc' }
                        })

                    if (subListError || !items) return

                    for (const item of items) {
                        const itemPath = folderPath ? `${folderPath}/${item.name}` : item.name
                        const fullItemPath = `${imagesPath}/${itemPath}`

                        if (item.metadata) {
                            allPaths.push(fullItemPath)
                        } else {
                            await getFilesRecursively(itemPath)
                        }
                    }
                }

                await getFilesRecursively()

                if (allPaths.length > 0) {
                    const { error: deleteError } = await supabase.storage
                        .from(bucketName)
                        .remove(allPaths)

                    if (deleteError) {
                        console.warn('Error deleting images folder contents:', deleteError)
                    }
                }
            }

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const deleteProductoFolder = async (productoNombre, marca = 'waterplast') => {
        try {
            error.value = null

            const cleanName = productoNombre.toLowerCase()
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 20)

            const bucketName = `${marca}-productos`

            const { data: files, error: listError } = await supabase.storage
                .from(bucketName)
                .list(cleanName, {
                    limit: 1000,
                    sortBy: { column: 'name', order: 'asc' }
                })

            if (listError) {
                return
            }

            if (files && files.length > 0) {
                const allPaths = []

                const getFilesRecursively = async (folderPath = '') => {
                    const fullPath = folderPath ? `${cleanName}/${folderPath}` : cleanName

                    const { data: items, error: subListError } = await supabase.storage
                        .from(bucketName)
                        .list(fullPath, {
                            limit: 1000,
                            sortBy: { column: 'name', order: 'asc' }
                        })

                    if (subListError || !items) return

                    for (const item of items) {
                        const itemPath = folderPath ? `${folderPath}/${item.name}` : item.name
                        const fullItemPath = `${cleanName}/${itemPath}`

                        if (item.metadata) {
                            allPaths.push(fullItemPath)
                        } else {
                            await getFilesRecursively(itemPath)
                        }
                    }
                }

                await getFilesRecursively()

                if (allPaths.length > 0) {
                    const { error: deleteError } = await supabase.storage
                        .from(bucketName)
                        .remove(allPaths)

                    if (deleteError) {
                        console.warn('Error deleting some files:', deleteError)
                    }
                }

                const commonFolders = [
                    `${cleanName}/iconos/`,
                    `${cleanName}/caracteristicas/`,
                    `${cleanName}/images/`
                ]

                for (const folderPath of commonFolders) {
                    try {
                        await supabase.storage
                            .from(bucketName)
                            .remove([folderPath])
                    } catch (error) {
                    }
                }
            }

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const uploadBlogImage = async (file, blogTitulo) => {
        try {
            uploading.value = true
            uploadProgress.value = 0
            error.value = null

            validateImageFile(file)

            const cleanName = blogTitulo.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s]/g, '')
                .replace(/\s+/g, '-')
                .substring(0, 30)

            const extension = file.name.split('.').pop().toLowerCase()
            const randomNum = Math.floor(1000 + Math.random() * 9000)
            const fileName = `${cleanName}-Blog-Unike-Group-${randomNum}.${extension}`

            const { data, error: uploadError } = await supabase.storage
                .from('blog')
                .upload(fileName, file, {
                    cacheControl: '3600',
                    upsert: false
                })

            if (uploadError) throw uploadError

            uploadProgress.value = 100
            return data.path

        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            uploading.value = false
        }
    }

    const deleteBlogImage = async (storagePath) => {
        try {
            error.value = null

            const { error: deleteError } = await supabase.storage
                .from('blog')
                .remove([storagePath])

            if (deleteError) throw deleteError

        } catch (err) {
            error.value = err.message
            throw err
        }
    }

    const getBlogImageUrl = (storagePath, cacheBust = false) => {
        if (!storagePath) return null
        let url = `${config.public.supabase.url}/storage/v1/object/public/blog/${storagePath}`

        if (cacheBust) {
            const timestamp = Date.now()
            url += `?v=${timestamp}`
        }

        return url
    }

    return {
        uploading: readonly(uploading),
        uploadProgress: readonly(uploadProgress),
        error: readonly(error),

        uploadOpinionImage,
        deleteOpinionImage,
        getOpinionImageUrl,

        uploadCategoriaImage,
        uploadCategoriaIcon,
        uploadCategoriaImagenesRedes,
        deleteCategoriaImage,
        deleteCategoriaIcon,
        deleteCategoriaImagenRed,
        getCategoriaImageUrl,
        getCategoriaIconUrl,
        getCategoriaImagenRedUrl,

        uploadImagenDestacadaChica,
        uploadImagenDestacadaMediana,
        uploadImagenDestacadaGrande,
        deleteImagenDestacada,
        getImagenDestacadaUrl,

        generateUniqueProductFolderName,
        uploadProductoImage,
        uploadProductoFile,
        uploadProductoIcon,
        uploadProductoGaleriaImagenes,
        deleteProductoImage,
        deleteProductoFile,
        deleteProductoIcon,
        deleteProductoGaleriaImagen,
        deleteProductoRender3d,
        getProductoImageUrl,
        getProductoFileUrl,
        getProductoIconUrl,
        getProductoGaleriaImageUrl,

        uploadCaracteristicaImage,
        deleteCaracteristicaImage,
        getCaracteristicaImageUrl,

        deleteProductoFolder,

        uploadBlogImage,
        deleteBlogImage,
        getBlogImageUrl,

        validateImageFile,
        cleanCategoryName
    }
}