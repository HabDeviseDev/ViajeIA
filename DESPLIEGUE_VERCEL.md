# 🚀 Guía Completa: Desplegar ViajeIA en Vercel (GRATIS)

Esta guía te ayudará a subir tu aplicación ViajeIA a internet usando Vercel de forma **100% gratuita**.

## 📋 Tabla de Contenidos

1. [Preparación](#preparación)
2. [Desplegar Frontend en Vercel](#desplegar-frontend-en-vercel)
3. [Desplegar Backend en Render](#desplegar-backend-en-render)
4. [Configurar Variables de Entorno](#configurar-variables-de-entorno)
5. [Conectar Frontend y Backend](#conectar-frontend-y-backend)
6. [Verificar que Todo Funciona](#verificar-que-todo-funciona)

---

## 📦 Preparación

### Paso 1: Crear cuenta en Vercel

1. Ve a https://vercel.com
2. Haz clic en **"Sign Up"**
3. Regístrate con tu cuenta de **GitHub** (recomendado) o email
4. Confirma tu email si es necesario

### Paso 2: Crear cuenta en Render (para el backend)

1. Ve a https://render.com
2. Haz clic en **"Get Started for Free"**
3. Regístrate con tu cuenta de **GitHub**
4. Confirma tu email

### Paso 3: Subir tu código a GitHub

Si no tienes tu código en GitHub, sigue estos pasos:

```bash
# En la carpeta raíz de tu proyecto ViajeIA
git init
git add .
git commit -m "Initial commit: ViajeIA proyecto completo"

# Ve a GitHub.com y crea un nuevo repositorio
# Luego conecta tu repositorio local:
git remote add origin https://github.com/TU_USUARIO/viajeia.git
git branch -M main
git push -u origin main
```

**Importante**: Asegúrate de que `.env` esté en `.gitignore` (ya debería estarlo).

---

## 🌐 Paso 1: Desplegar Frontend en Vercel

### Opción A: Desde la interfaz web de Vercel (Más fácil)

1. **Ve a tu panel de Vercel**: https://vercel.com/dashboard

2. **Haz clic en "Add New" → "Project"**

3. **Importa tu repositorio de GitHub**:
   - Selecciona el repositorio donde está tu código
   - Si no aparece, haz clic en "Adjust GitHub App Permissions" y autoriza Vercel

4. **Configura el proyecto**:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (debería estar automático)
   - **Output Directory**: `build`

5. **Configura Variables de Entorno** (Por ahora déjala vacía, la configuraremos después):
   - `REACT_APP_API_URL` (lo agregaremos más tarde)

6. **Haz clic en "Deploy"**

7. **Espera a que termine el despliegue** (2-3 minutos)

8. **¡Listo!** Tu frontend estará disponible en una URL como: `https://viajeia.vercel.app`

### Opción B: Desde la terminal (Para desarrolladores)

```bash
# Instalar Vercel CLI
npm install -g vercel

# En la carpeta raíz del proyecto
cd frontend

# Hacer login
vercel login

# Desplegar
vercel

# Seguir las instrucciones en pantalla
# - ¿Quieres crear un nuevo proyecto? → Sí
# - ¿Cuál es el nombre? → viajeia (o el que prefieras)
# - ¿En qué directorio está tu código? → ./
```

---

## ⚙️ Paso 2: Desplegar Backend en Render

**Nota**: Vercel puede alojar Python, pero Render es más simple para FastAPI. Render tiene un plan gratuito que es perfecto para este proyecto.

### Paso 2.1: Preparar el backend para Render

1. **Crear archivo `render.yaml`** en la carpeta `backend/`:

```yaml
services:
  - type: web
    name: viajeia-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
```

2. **Actualizar `main.py` para usar el puerto de Render**:

El archivo ya debería estar configurado, pero verifica que uses variables de entorno para el puerto.

### Paso 2.2: Desplegar en Render

1. **Ve a tu panel de Render**: https://dashboard.render.com

2. **Haz clic en "New +" → "Web Service"**

3. **Conecta tu repositorio de GitHub**:
   - Selecciona el repositorio
   - Si no aparece, haz clic en "Configure account" y autoriza Render

4. **Configura el servicio**:
   - **Name**: `viajeia-backend`
   - **Region**: `Oregon (US West)` (o el más cercano a ti)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

5. **Haz clic en "Advanced"** y configura:
   - **Auto-Deploy**: `Yes` (para que se actualice automáticamente)

6. **Haz clic en "Create Web Service"**

7. **Render empezará a construir y desplegar tu backend** (5-10 minutos la primera vez)

8. **Obtén la URL de tu backend**: Se verá algo como `https://viajeia-backend.onrender.com`

---

## 🔐 Paso 3: Configurar Variables de Entorno

### En Render (Backend)

1. **En el panel de Render**, ve a tu servicio `viajeia-backend`

2. **Ve a "Environment"** en el menú lateral

3. **Agrega estas variables** (haz clic en "Add Environment Variable" para cada una):

```
GEMINI_API_KEY=tu_api_key_de_gemini
OPENWEATHER_API_KEY=tu_api_key_de_openweather
UNSPLASH_ACCESS_KEY=tu_api_key_de_unsplash
ALLOWED_ORIGINS=https://viajeia.vercel.app,https://viajeia.vercel.app
```

**Nota**: Reemplaza `viajeia.vercel.app` con la URL real que te dio Vercel.

4. **Haz clic en "Save Changes"**

5. **Render reiniciará automáticamente** tu servicio con las nuevas variables

### En Vercel (Frontend)

1. **En el panel de Vercel**, ve a tu proyecto

2. **Ve a "Settings" → "Environment Variables"**

3. **Agrega esta variable**:

```
REACT_APP_API_URL=https://viajeia-backend.onrender.com
```

**Nota**: Reemplaza `viajeia-backend.onrender.com` con la URL real que te dio Render.

4. **Selecciona los entornos**: Production, Preview, Development (marca los 3)

5. **Haz clic en "Save"**

6. **Vuelve a desplegar tu frontend**:
   - Ve a "Deployments"
   - Haz clic en los 3 puntos (...) del último despliegue
   - Selecciona "Redeploy"

---

## 🔗 Paso 4: Actualizar CORS en el Backend

Necesitamos asegurarnos de que el backend permita peticiones desde tu frontend de Vercel.

1. **Ve a Render** y edita la variable de entorno `ALLOWED_ORIGINS`

2. **Agrega la URL completa de tu frontend en Vercel**:

```
ALLOWED_ORIGINS=https://viajeia.vercel.app
```

3. **Guarda y espera a que Render reinicie**

---

## ✅ Paso 5: Verificar que Todo Funciona

### Verificar Backend

1. Abre en tu navegador: `https://viajeia-backend.onrender.com/docs`
2. Deberías ver la documentación de FastAPI (Swagger UI)
3. Esto confirma que tu backend está funcionando

### Verificar Frontend

1. Abre en tu navegador: `https://viajeia.vercel.app`
2. Deberías ver la interfaz de ViajeIA
3. Completa el formulario y prueba hacer una consulta
4. Si todo funciona, ¡felicidades! 🎉

---

## 🐛 Solución de Problemas

### Problema: "CORS error" en el navegador

**Solución**: 
- Verifica que `ALLOWED_ORIGINS` en Render incluya la URL exacta de tu frontend en Vercel
- Asegúrate de que no haya espacios en la URL

### Problema: "API URL not found"

**Solución**:
- Verifica que `REACT_APP_API_URL` esté configurada correctamente en Vercel
- Asegúrate de haber hecho "Redeploy" después de agregar la variable de entorno

### Problema: Backend no responde (502 error)

**Solución**:
- En Render, ve a "Logs" y revisa los errores
- Verifica que todas las API keys estén correctamente configuradas
- Asegúrate de que `requirements.txt` incluya todas las dependencias

### Problema: Render se "duerme" después de 15 minutos

**Solución**:
- Esto es normal en el plan gratuito de Render
- La primera petición puede tardar 30-60 segundos en "despertar" el servicio
- Considera usar un servicio de "ping" gratuito como https://uptimerobot.com para mantener el servicio activo

---

## 🎯 Resumen de URLs

Después de completar todos los pasos, tendrás:

- **Frontend**: `https://viajeia.vercel.app` (o la URL que te asignó Vercel)
- **Backend**: `https://viajeia-backend.onrender.com` (o la URL que te asignó Render)

---

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Render](https://render.com/docs)
- [Variables de Entorno en Vercel](https://vercel.com/docs/concepts/projects/environment-variables)
- [Variables de Entorno en Render](https://render.com/docs/environment-variables)

---

## 🎉 ¡Felicidades!

Tu aplicación ViajeIA ahora está disponible en internet de forma gratuita. Cualquier persona puede acceder desde cualquier lugar del mundo.

¿Tienes preguntas? Revisa la sección de solución de problemas o consulta la documentación oficial de Vercel y Render.

