# 🚀 Configuración Rápida de Gemini

## Paso 1: Obtener tu API Key

1. Ve a: **https://makersuite.google.com/app/apikey**
2. Inicia sesión con tu cuenta de Google
3. Haz clic en **"Create API Key"** (Crear API Key)
4. Copia la API key que se genera (será algo como: `AIzaSy...`)

## Paso 2: Configurar la API Key

1. En la carpeta `backend/`, crea un archivo llamado `.env` (sin nombre, solo extensión)
2. Abre el archivo `.env` y escribe:
   ```
   GEMINI_API_KEY=tu_api_key_pegada_aqui
   ```
3. Reemplaza `tu_api_key_pegada_aqui` con la API key que copiaste
4. Guarda el archivo

## Paso 3: Instalar dependencias

Si aún no lo has hecho:
```bash
pip install -r requirements.txt
```

## ¡Listo! 🎉

Ahora cuando ejecutes el servidor con `uvicorn main:app --reload`, la aplicación usará Gemini para responder las preguntas sobre viajes.

