export const useMurallonBlog = () => {
    const supabase = useSupabaseClient()
    const {
        uploadMurallonBlogImage,
        deleteMurallonBlogImage,
        getMurallonBlogImageUrl
    } = useStorage()
    const loading = ref(false)
    const blogs = ref([])
    const currentBlog = ref(null)
    const error = ref(null)

    const fetchBlogs = async () => {
        loading.value = true
        error.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('blog-murallon')
                .select('*')
                .order('fecha', { ascending: false })

            if (supabaseError) throw supabaseError

            const blogsWithUrls = (data || []).map(blog => ({
                ...blog,
                imagen_principal: blog.imagen_principal ? getMurallonBlogImageUrl(blog.imagen_principal) : null,
                imagen_principal_path: blog.imagen_principal
            }))

            blogs.value = blogsWithUrls
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const fetchBlogById = async (id) => {
        loading.value = true
        error.value = null
        currentBlog.value = null

        try {
            const { data, error: supabaseError } = await supabase
                .from('blog-murallon')
                .select('*')
                .eq('id', id)
                .single()

            if (supabaseError) throw supabaseError

            currentBlog.value = {
                ...data,
                imagen_principal: data.imagen_principal ? getMurallonBlogImageUrl(data.imagen_principal) : null,
                imagen_principal_path: data.imagen_principal
            }
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const generateSlug = (titulo) => {
        return titulo.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s]/g, '')
            .replace(/\s+/g, '-')
            .replace(/^-+|-+$/g, '')
    }

    const createBlog = async (blogData, imagenFile) => {
        loading.value = true
        error.value = null

        try {
            let imagenPath = null

            if (imagenFile) {
                imagenPath = await uploadMurallonBlogImage(imagenFile, blogData.titulo)
            }

            const slug = generateSlug(blogData.titulo)

            const { data, error: supabaseError } = await supabase
                .from('blog-murallon')
                .insert([{
                    titulo: blogData.titulo,
                    slug: slug,
                    imagen_principal: imagenPath,
                    contenido: blogData.contenido,
                    fecha: blogData.fecha || new Date().toISOString().split('T')[0]
                }])
                .select()

            if (supabaseError) throw supabaseError

            return data[0]
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const updateBlog = async (id, blogData, imagenFile) => {
        loading.value = true
        error.value = null

        try {
            const { data: dataBlog, error: fetchError } = await supabase
                .from('blog-murallon')
                .select('imagen_principal')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            let imagenPath = dataBlog.imagen_principal

            if (!imagenFile && !dataBlog.imagen_principal && !blogData.imagen_principal) {
                throw new Error('No se puede actualizar un blog sin imagen. El blog debe tener una imagen principal.')
            }

            if (imagenFile) {
                if (dataBlog.imagen_principal) {
                    try {
                        await deleteMurallonBlogImage(dataBlog.imagen_principal)
                    } catch (err) {
                        console.warn('Error al borrar imagen anterior:', err)
                    }
                }
                imagenPath = await uploadMurallonBlogImage(imagenFile, blogData.titulo)
            } else if (blogData.imagenFueEliminada === true) {
                throw new Error('No se puede actualizar un blog sin imagen. Debe proporcionar una imagen principal.')
            } else if (blogData.imagen_principal !== undefined && blogData.imagen_principal !== null) {
                imagenPath = blogData.imagen_principal
            } else {
                imagenPath = dataBlog.imagen_principal
            }

            const slug = generateSlug(blogData.titulo)

            const { data, error: supabaseError } = await supabase
                .from('blog-murallon')
                .update({
                    titulo: blogData.titulo,
                    slug: slug,
                    imagen_principal: imagenPath,
                    contenido: blogData.contenido,
                    fecha: blogData.fecha
                })
                .eq('id', id)
                .select()

            if (supabaseError) throw supabaseError

            return data[0]
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    const deleteBlog = async (id) => {
        loading.value = true
        error.value = null

        try {
            const { data: dataBlog, error: fetchError } = await supabase
                .from('blog-murallon')
                .select('imagen_principal, titulo')
                .eq('id', id)
                .single()

            if (fetchError) throw fetchError

            if (dataBlog.imagen_principal) {
                try {
                    await deleteMurallonBlogImage(dataBlog.imagen_principal)
                } catch (err) {
                    console.warn('Error al borrar imagen:', err)
                }
            }

            const { error: supabaseError } = await supabase
                .from('blog-murallon')
                .delete()
                .eq('id', id)

            if (supabaseError) throw supabaseError

            blogs.value = blogs.value.filter(blog => blog.id !== id)
        } catch (err) {
            error.value = err.message
            throw err
        } finally {
            loading.value = false
        }
    }

    return {
        loading: readonly(loading),
        blogs: readonly(blogs),
        currentBlog: readonly(currentBlog),
        error: readonly(error),
        fetchBlogs,
        fetchBlogById,
        createBlog,
        updateBlog,
        deleteBlog
    }
}
