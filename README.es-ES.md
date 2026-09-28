

# ExoGen

> Una aplicación de escritorio para generar imágenes con IA de forma local utilizando modelos de Stable Diffusion de HuggingFace

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

https://github.com/user-attachments/assets/909182ce-e921-4b94-a653-add58d5717d9

## Acerca de

ExoGen es una aplicación de escritorio centrada en la privacidad que te permite generar imágenes con IA completamente sin conexión en tu propia máquina. Descarga modelos de HuggingFace, configura los parámetros de generación y crea imágenes impresionantes sin enviar tus datos a la nube.

**¿Por qué ExoGen?**

- 🔒 **100 % Privado** - Todo se ejecuta localmente, tus prompts e imágenes nunca salen de tu computadora
- 💰 **Gratis para siempre** - Sin costos de API, sin suscripciones, completamente gratuito y de código abierto
- 🚀 **Potente** - Compatible con diversos modelos de Stable Diffusion de HuggingFace
- ⚡ **Rápido** - Compatible con aceleración por GPU para una generación ultrarrápida
- 🎨 **Flexible** - Controles avanzados para ajustar al detalle tus generaciones

## Características

- 🎨 **Generación de imágenes con IA** - Crea imágenes a partir de prompts de texto utilizando modelos de Stable Diffusion
- 🤖 **Recomendaciones inteligentes de modelos** - Obtén sugerencias de modelos según las capacidades de tu hardware
- 🔍 **Integración con HuggingFace** - Explora y descarga modelos directamente desde HuggingFace
- 🎭 **Soporte para LoRA** - Aplica modelos LoRA para estilos y personajes ajustados con pesos configurables
- 🔎 **Escala a alta resolución** - Mejora las imágenes con Hires.fix utilizando escaladores con IA (Real-ESRGAN) o métodos tradicionales
- 📊 **Progreso en tiempo real** - Visualiza las fases de generación y el progreso de carga del modelo en tiempo real
- 🎨 **Sistema de estilos** - Busca, filtra y aplica estilos predefinidos con valores predeterminados automáticos para nuevos usuarios
- 📜 **Historial de generaciones** - Explora generaciones anteriores en un visor de fotos a pantalla completa con navegación
- 📝 **Registros del backend** - Transmite y monitorea los registros del backend en tiempo real
- 💾 **Configuración de memoria** - Configura la asignación de memoria GPU y RAM con vistas previas visuales
- 🔄 **Actualizaciones automáticas** - Recibe notificaciones e instala actualizaciones de forma fluida
- ⚙️ **Configuración avanzada**
  - Métodos de muestreo (Euler, DPM++, etc.)
  - Control de seed para resultados reproducibles
  - Soporte para generación por lotes
- 🖥️ **Totalmente sin conexión** - Funciona completamente offline después de la descarga inicial del modelo
- 🔒 **Centrado en la privacidad** - Todo el procesamiento ocurre localmente en tu máquina

## Requisitos previos

Antes de comenzar, asegúrate de tener lo siguiente instalado:

- **Python 3.11+** - Requerido para el backend de IA ([Descargar](https://www.python.org/downloads/))
- **CUDA** - Requerido para aceleración por GPU de Nvidia ([Descargar](https://developer.nvidia.com/cuda-downloads))

### Requisitos del sistema

- **RAM**: 8 GB mínimo (se recomiendan 16 GB para modelos más grandes)
- **GPU**: Recomendada para una generación más rápida (modo CPU disponible, pero más lento)
- **Almacenamiento**: 30 GB+ de espacio libre en disco para modelos
- **Sistema operativo**: Windows, macOS o Linux

## Instalación

1. Descarga la última versión para tu plataforma desde la página de [Lanzamientos](https://github.com/andyngdz/exogen/releases):
   - Windows: instalador `.exe`
   - macOS: instalador `.dmg`
   - Linux: paquete `.AppImage`, `.deb` o `.rpm`

2. Ejecuta el instalador y lanza ExoGen

La aplicación hará automáticamente lo siguiente:

1. Configurar el backend de Python
2. Instalar las dependencias de Python requeridas
3. Abrir la ventana de la aplicación

## Desarrollo

### Scripts disponibles

- **`pnpm run dev`** - Iniciar el servidor de desarrollo de Next.js con Turbopack
- **`pnpm run desktop`** - Ejecutar la aplicación de escritorio completa (Next.js + Electron + backend de Python)
- **`pnpm run desktop:local`** - Ejecutar solo el frontend (para desarrollo del backend de Python)
- **`pnpm test`** - Ejecutar la suite de pruebas
- **`pnpm run type-check`** - Ejecutar verificación de tipos de TypeScript
- **`pnpm run lint`** - Ejecutar ESLint
- **`pnpm run format`** - Formatear código con Prettier
- **`pnpm run build`** - Compilar para distribución en producción

### Flujo de trabajo de desarrollo

```bash
# Clonar el repositorio del backend
git clone https://github.com/andyngdz/exogen_backend.git

# Iniciar el backend (en el directorio exogen_backend)
cd exogen_backend
# Seguir las instrucciones de configuración del README del backend

# Iniciar el desarrollo del frontend (en el directorio exogen)
pnpm run desktop:local

# Ejecutar pruebas
pnpm test

# Ejecutar pruebas en modo observador
pnpm test -- --watch

# Ejecutar pruebas con cobertura
pnpm run test:coverage

# Verificar la calidad del código
pnpm run type-check
pnpm run lint
pnpm run format
```

## Compilación para producción

```bash
# Compilar la aplicación
pnpm run build
```

El resultado de la compilación estará en el directorio `dist/`:

- Windows: instalador `.exe`
- macOS: instalador `.dmg`
- Linux: paquetes `.AppImage`, `.deb` y `.rpm`

## Pruebas

ExoGen utiliza **Vitest** y **React Testing Library** para pruebas exhaustivas.

```bash
# Ejecutar todas las pruebas
pnpm test

# Ejecutar pruebas en modo observador
pnpm test -- --watch

# Ejecutar pruebas con informe de cobertura
pnpm run test:coverage

# Ejecutar un archivo de prueba específico
pnpm test -- path/to/test.tsx
```

Las pruebas se encuentran junto a los archivos fuente en directorios `__tests__/`.

## Contribuciones

¡Bienvenidas las contribuciones! Aquí te mostramos cómo puedes ayudar:

1. **Hacer un fork del repositorio**
2. **Crear una rama de funcionalidad** (`git checkout -b feat/amazing-feature`)
3. **Hacer commit de tus cambios** utilizando [Commits Convencionales](https://www.conventionalcommits.org/)
   - `feat:` para nuevas funcionalidades
   - `fix:` para correcciones de errores
   - `docs:` para cambios en la documentación
4. **Enviar a tu rama** (`git push origin feat/amazing-feature`)
5. **Abrir un Pull Request**

### Formato de mensajes de commit

```bash
feat(generadores): agregar nuevo método de muestreo
fix(búsqueda-de-modelos): resolver problema de tiempo de espera en la descarga
docs: actualizar instrucciones de instalación
```

## Agradecimientos

- Construido con [Next.js](https://nextjs.org/)
- Escritorio impulsado por [Electron](https://www.electronjs.org/)
- Modelos de [HuggingFace](https://huggingface.co/)
- Componentes de UI de [HeroUI](https://www.heroui.com/)
- Animaciones por [Framer Motion](https://www.framer.com/motion/)

## Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la página de [Problemas](https://github.com/andyngdz/exogen/issues)
2. Abre un nuevo problema con información detallada

---

⭐ **Marca con una estrella este repositorio** si te resulta útil!
