export const useBlog = () => {
    const supabase = useSupabaseClient()
    const {
        uploadBlogImage,
        deleteBlogImage,
        getBlogImageUrl
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
                .from('blog')
                .select('*')
                .order('fecha', { ascending: false })

            if (supabaseError) throw supabaseError

            const blogsWithUrls = (data || []).map(blog => ({
                ...blog,
                imagen_principal: blog.imagen_principal ? getBlogImageUrl(blog.imagen_principal) : null,
                id: blog.Id || blog.id
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
                .from('blog')
                .select('*')
                .eq('Id', id)
                .single()

            if (supabaseError) throw supabaseError

            currentBlog.value = {
                ...data,
                imagen_principal: data.imagen_principal ? getBlogImageUrl(data.imagen_principal) : null,
                id: data.Id || data.id
            }
        } catch (err) {
            error.value = err.message
        } finally {
            loading.value = false
        }
    }

    const createBlog = async (blogData, imagenFile) => {
        loading.value = true
        error.value = null

        try {
            let imagenPath = null

            if (imagenFile) {
                imagenPath = await uploadBlogImage(imagenFile, blogData.titulo)
            }

            const { data, error: supabaseError } = await supabase
                .from('blog')
                .insert([{
                    titulo: blogData.titulo,
                    imagen_principal: imagenPath,
                    contenido: blogData.contenido,
                    fecha: blogData.fecha || new Date().toISOString().split('T')[0],
                    creado_por: blogData.creado_por
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
                .from('blog')
                .select('imagen_principal')
                .eq('Id', id)
                .single()

            if (fetchError) throw fetchError

            let imagenPath = dataBlog.imagen_principal

            if (imagenFile) {
                if (dataBlog.imagen_principal) {
                    try {
                        await deleteBlogImage(dataBlog.imagen_principal)
                    } catch (err) {
                        console.warn('Error al borrar imagen anterior:', err)
                    }
                }

                imagenPath = await uploadBlogImage(imagenFile, blogData.titulo)
            }

            const { data, error: supabaseError } = await supabase
                .from('blog')
                .update({
                    titulo: blogData.titulo,
                    imagen_principal: imagenPath,
                    contenido: blogData.contenido,
                    fecha: blogData.fecha,
                    creado_por: blogData.creado_por
                })
                .eq('Id', id)
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
                .from('blog')
                .select('imagen_principal, titulo')
                .eq('Id', id)
                .single()

            if (fetchError) throw fetchError

            if (dataBlog.imagen_principal) {
                try {
                    await deleteBlogImage(dataBlog.imagen_principal)
                } catch (err) {
                    console.warn('Error al borrar imagen:', err)
                }
            }

            const { error: supabaseError } = await supabase
                .from('blog')
                .delete()
                .eq('Id', id)

            if (supabaseError) throw supabaseError

            blogs.value = blogs.value.filter(blog => (blog.id || blog.Id) !== id)
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