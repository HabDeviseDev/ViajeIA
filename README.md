# ViajeIA - Tu Asistente Personal de Viajes

Aplicación web moderna para planificación de viajes con arquitectura frontend/backend separada.

## Estructura del Proyecto

```
ViajeIA/
├── backend/          # API Python con FastAPI
│   ├── main.py      # Servidor principal
│   └── requirements.txt
└── frontend/        # Aplicación React
    ├── public/
    ├── src/
    └── package.json
```

## Instalación y Configuración

### Backend (Python)

1. Crear un entorno virtual (recomendado):
```bash
cd backend
python -m venv venv
```

2. Activar el entorno virtual:
- Windows:
```bash
venv\Scripts\activate
```
- Linux/Mac:
```bash
source venv/bin/activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. **Configurar API Key de Gemini** (IMPORTANTE):
   
   Para obtener tu API key de Google Gemini:
   - Ve a https://makersuite.google.com/app/apikey
   - Inicia sesión con tu cuenta de Google
   - Crea una nueva API key
   - Copia la API key generada
   
   Luego crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:
   ```
   GEMINI_API_KEY=tu_api_key_aqui
   OPENWEATHER_API_KEY=tu_openweather_api_key
   UNSPLASH_ACCESS_KEY=tu_unsplash_access_key
   ```
   
   Reemplaza `tu_api_key_aqui` con la API key de Gemini que copiaste.
   
   Para obtener tus API keys:
   - **OpenWeatherMap** (clima): Ver `backend/INSTRUCCIONES_OPENWEATHER.md`
   - **Unsplash** (fotos): Ver `backend/INSTRUCCIONES_UNSPLASH.md`

5. Ejecutar el servidor:
```bash
uvicorn main:app --reload --port 8000
```

El servidor estará disponible en: http://localhost:8000

### Frontend (React)

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Ejecutar la aplicación:
```bash
npm start
```

La aplicación estará disponible en: http://localhost:3000

## Uso

1. Inicia el servidor backend en una terminal
2. Inicia el servidor frontend en otra terminal
3. Abre tu navegador en http://localhost:3000
4. Escribe tu pregunta sobre viajes y haz clic en "Planificar mi viaje"

## Tecnologías Utilizadas

- **Backend**: Python, FastAPI, Google Gemini AI
- **Frontend**: React, CSS3
- **IA**: Google Gemini Pro para generar respuestas inteligentes sobre viajes
- **Seguridad**: Rate limiting, validación de entrada, sanitización, CORS configurado
- **Estilo**: Diseño moderno con colores azules y blancos

## Seguridad

Esta aplicación incluye múltiples medidas de seguridad:

- ✅ Validación y sanitización de entrada
- ✅ Rate limiting (10 solicitudes/minuto por IP)
- ✅ Protección contra inyección de prompts
- ✅ Configuración CORS segura
- ✅ Manejo seguro de errores
- ✅ Variables de entorno para credenciales

Ver `backend/SEGURIDAD.md` para más detalles.

## Características

- Interfaz moderna y responsiva
- Campo de texto para preguntas
- Botón interactivo para enviar consultas
- Área de respuestas con diseño atractivo
- **Integración con Google Gemini AI** para respuestas inteligentes sobre viajes
- Comunicación entre frontend y backend vía API REST

## Nota Importante

⚠️ **Necesitas una API key de Google Gemini** para que la aplicación funcione. Sigue las instrucciones en la sección de configuración del backend para obtenerla y configurarla.

