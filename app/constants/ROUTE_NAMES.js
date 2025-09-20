
export const ROUTE_NAMES = {
    // No auth
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: "/forgot-password",
    FORGOT_PASSWORD_CONFIRMATION: "/forgot-password-confirmation",
    RESET_PASSWORD: "/reset-password",
    // Auth
    HOME: '/',
    WATERPLAST: {
        CATEGORIAS: "/waterplast/categorias",
        EDITAR_CATEGORIA: (id) => `/waterplast/categorias/edit/${id}`,
        PRODUCTOS: "/waterplast/productos",
        CREAR_PRODUCTO: "/waterplast/productos/create",
        EDITAR_PRODUCTO: (id) => `/waterplast/productos/edit/${id}`,
        OPINIONES: "/waterplast/opiniones",
        CREAR_OPINION: "/waterplast/opiniones/crear",
        EDITAR_OPINION: (id) => `/waterplast/opiniones/edit/${id}`,
        DISTRIBUIDORES: "/waterplast/distribuidores",
        CREAR_DISTRIBUIDOR: "/waterplast/distribuidores/crear",
        EDITAR_DISTRIBUIDOR: (id) => `/waterplast/distribuidores/edit/${id}`,
        IMAGENES_DESTACADAS: "/waterplast/imagenes-destacadas",
        EDITAR_IMAGEN_DESTACADA: (id) => `/waterplast/imagenes-destacadas/edit/${id}`,
    },
};