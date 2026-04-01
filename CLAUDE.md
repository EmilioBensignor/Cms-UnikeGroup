# CmsUnike

CMS multi-marca para Unike Group. Panel de administración que gestiona contenido de cuatro marcas: **Unike Group**, **Waterplast**, **Rohermet** y **Murallón**. Frontend-only SPA que se comunica directamente con Supabase (sin directorio `server/`, sin API routes).

## Tech Stack

- **Framework**: Nuxt 4.1.1, Vue 3.5.21
- **Estilos**: Tailwind CSS (config custom), fuente Outfit via @nuxt/fonts
- **Backend**: Supabase (auth, database, storage) via @nuxtjs/supabase
- **Iconos**: Tabler via @nuxt/icon — uso: `<Icon name="tabler:icon-name" />`
- **Imagenes**: @nuxt/image
- **Estado**: Composables con `ref()`/`reactive()` (Pinia instalado pero no se usa)

## Comandos

- `npm run dev` — servidor de desarrollo
- `npm run start` — pull develop + install + dev (workflow diario)
- `npm run build` — build de producción

## Estructura del Proyecto

```
app/
├── app.vue                    # NuxtLayout > NuxtPage
├── assets/css/main.css        # Reset CSS, grid layout (header/main/footer), fuente Outfit
├── layouts/
│   ├── default.vue            # Header + Main + Footer + NotificationContainer
│   └── auth.vue               # Layout para login/register/password
├── pages/                     # ~41 páginas, routing por archivo
│   ├── login, register, forgot-password, reset-password (auth)
│   ├── blog/ (CRUD)
│   ├── opiniones/ (CRUD)
│   ├── distribuidores/ (CRUD)
│   ├── waterplast/ (categorias, subcategorias, productos, imagenes-destacadas)
│   ├── rohermet/ (categorias, productos, imagenes-destacadas)
│   └── murallon/ (blog, inspiracion, productos)
├── components/
│   ├── form/                  # 16 campos reutilizables (TextField, Select, ImageField, MultiImageField, etc.)
│   ├── table/                 # Layout (tabla genérica con acciones), CellRenderer
│   ├── tabs/Layout.vue        # Navegación por pestañas
│   ├── notification/          # Container + Toast
│   ├── modal/Delete.vue       # Modal de confirmación para eliminar
│   ├── button/                # Gray, Primary
│   ├── heading/               # H1, H2
│   ├── default/               # Header, Footer, Main, Section (layout primitives)
│   ├── auth/Header.vue        # Header para páginas de auth
│   ├── nav/Drawer.vue         # Drawer de navegación
│   ├── waterplast/            # Forms: categoria, subcategoria, producto, imagen-destacada, CaracteristicasAdicionalesForm
│   ├── rohermet/              # Forms: categoria, producto, imagen-destacada
│   ├── murallon/              # Forms: blog, inspiracion, producto
│   └── unike/                 # Forms: distribuidor, opinion
├── composables/
│   ├── useNotification.js     # Toast global: success(), error(), warning(), info()
│   ├── useStorage.js          # Supabase Storage: upload, delete, URLs, validación 10MB
│   ├── useSupabaseCache.js    # Cache localStorage con TTL
│   ├── useDynamicForm.js      # Formularios schema-driven con validación automática
│   ├── useDebounce.js
│   ├── useBlog.js
│   ├── waterplast/            # useCategorias, useSubcategorias, useProductos, useImagenesDestacadas, useDistribuidores, useOpiniones
│   ├── rohermet/              # useCategorias, useProductos, useImagenesDestacadas
│   └── murallon/              # useBlog, useInspiracion, useProductos, useCategorias, useTiposAplicacion
├── utils/errorHandler.js      # handleSupabaseError() — errores Supabase → mensajes en español
├── constants/ROUTE_NAMES.js   # Rutas centralizadas, rutas dinámicas son funciones: (id) => `/path/${id}`
└── shared/waterplast/         # Datos estáticos (categorias, opiniones)
```

## Convenciones

### Idioma
- UI en **español** (labels, errores, notificaciones, placeholders, estados vacíos)
- Código en **inglés** (variables, funciones, archivos), pero términos de dominio en español: `categorias`, `productos`, `opiniones`, `distribuidores`, `imagenes-destacadas`

### Patrón Composable (capa de datos)
Cada entidad tiene un composable que retorna `{ loading, error, data, fetch*, create*, update*, delete* }`:
- Usa `useSupabaseClient()` directamente
- Naming composable: `use{Marca}{Entidad}` → `useWaterplastProductos`, `useRohermetCategorias`, `useMurallonBlog`
- Tablas Supabase: `{marca}-{entidad}` → `waterplast-productos`, `rohermet-categorias`, `blog-murallon`, `inspiracion-murallon`, `murallon-productos`
- Storage buckets: `{marca}-{entidad}/{carpeta-unica}/archivo.ext`

### Patrón de Páginas
- **Listado** (`index.vue`): DefaultSection > HeadingH1 > filtros opcionales > spinner | empty state | TableLayout
- **Crear** (`create.vue`): DefaultSection > HeadingH1 > Form del componente de marca > botones
- **Editar** (`edit/[id].vue`): igual que crear pero con prop `isEditing` y carga de datos
- Imports explícitos: `import { useWaterplastProductos } from '~/composables/waterplast/useProductos.js'`

### Componentes Form
- Todos aceptan `modelValue` + `error` como props, emiten `update:modelValue`
- Error se muestra en blur via ref `showError`
- Auto-import por directorio: `FormTextField`, `FormSelect`, `FormImageField`, `FormMultiImageField`, `FormDateField`, `FormSwitch`, `FormCheckboxField`, `FormTextarea`

### Auto-Import de Componentes (por directorio)
`FormTextField`, `ButtonPrimary`, `ButtonGray`, `HeadingH1`, `HeadingH2`, `DefaultSection`, `DefaultHeader`, `DefaultMain`, `DefaultFooter`, `TableLayout`, `TableCellRenderer`, `TabsLayout`, `ModalDelete`, `NotificationContainer`, `NotificationToast`, `NavDrawer`

### Tailwind Custom
- **Colores**: `primary` (#005CB9), `secondary` (#212C54), `terciary` (#3CB4E5), `light` (#FBF9F9), `dark` (#131313), `error` (#DE5E5E), `gray-light`, `gray-mid`, `gray-dark`
- **Breakpoints**: sm(480px), md(660px), lg(992px), xl(1280px), 2xl(1440px)

### Notificaciones
```js
const { success, error: notifyError } = useNotification()
success('Producto creado exitosamente')
notifyError('Error al crear el producto')
```

### Error Handling
```js
import { handleSupabaseError } from '~/utils/errorHandler.js'
// Retorna mensaje en español a partir del error de Supabase
```

### Rutas
```js
import { ROUTE_NAMES } from '~/constants/ROUTE_NAMES.js'
navigateTo(ROUTE_NAMES.WATERPLAST.PRODUCTOS)           // estática
navigateTo(ROUTE_NAMES.WATERPLAST.EDITAR_PRODUCTO(id))  // dinámica
```

## Git Workflow

- `main` = producción
- `develop` = desarrollo activo (branch por defecto)
- Commits descriptivos en español

## Notas Importantes

- **Sin directorio server/** — todo el acceso a datos es client-side via Supabase
- **Sin ESLint, Prettier, tests ni CI/CD**
- **Variables de entorno requeridas**: `SUPABASE_URL`, `SUPABASE_KEY` (no hay .env.example)
- **Sesión auth**: cookie de 8 horas con auto-refresh
- **Imágenes**: máximo 10MB, tipos permitidos: JPEG, PNG, WebP, GIF, SVG
- **Carpetas de storage únicas**: nombres normalizados (sin acentos, hyphens, max 20 chars), con verificación de colisión en DB
