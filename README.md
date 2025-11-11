# Documentación de Estructura — chat-app

Este proyecto es una aplicación móvil desarrollada con **React Native** (usando Expo), que implementa un sistema de chat moderno e intuitivo. Utiliza **Supabase** como backend para la gestión de base de datos y autenticación de usuarios.

## Estructura de Carpetas y Archivos

```plaintext
chat-app/
│
├── App.js
├── index.js
├── package.json
├── package-lock.json
├── app.json
├── .gitignore
│
├── assets/
│   └── ...           # Imágenes, iconos y recursos gráficos
│
└── src/
    ├── lib/
    │   └── supabaseClient.js    # Inicialización y configuración del cliente Supabase
    ├── navigations/
    │   └── AppNavigator.js      # Navegador principal de pantallas
    └── screens/
        ├── ChatListScreen.js    # Listado de chats del usuario
        ├── ChatScreen.js        # Pantalla de chat individual/grupal
        ├── HomeScreen.js        # Pantalla de bienvenida y logout
        ├── LoginScreen.js       # Inicio de sesión
        ├── NewChatScreen.js     # Crear nuevo chat y seleccionar usuarios
        ├── RegisterScreen.js    # Registro de nuevos usuarios
        └── SplashScreen.js      # Pantalla de carga/arranque
```

---

## Uso de Supabase

El archivo `src/lib/supabaseClient.js` crea el cliente de Supabase con las credenciales de tu proyecto.
```js
import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = '<tu_url>';
const SUPABASE_ANON_KEY = '<tu_key>';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```
Este cliente se importa en todos los componentes que requieren interacción con la base de datos o autenticación.

### Funcionalidades habilitadas con Supabase

- **Autenticación de usuarios:**  
  En las pantallas de registro (`RegisterScreen.js`) y login (`LoginScreen.js`) se utiliza Supabase para crear cuentas de usuario, iniciar sesión, y gestionar el perfil.
- **Gestión de perfiles:**  
  Al registrarse o loguearse, si el perfil no existe en la tabla `perfiles`, se crea automáticamente.
- **Chats y mensajes:**  
  Las tablas `chats`, `chat_participantes` y `mensajes` gestionan la información necesaria para los chats individuales y grupales.  
  - El usuario puede crear nuevos chats, invitar a otros (por búsqueda), y enviar mensajes.
  - Los mensajes se actualizan en tiempo real utilizando canales de Supabase (`ChatScreen.js`).

---

## Pantallas principales

- **LoginScreen y RegisterScreen:**  
  Gestionan la autenticación usando supabase.auth. También generan el perfil en la tabla `perfiles` si no existe.

- **HomeScreen:**  
  Muestra información del usuario autenticado y permite cerrar sesión.

- **ChatListScreen:**  
  Listado de chats donde el usuario es participante. Permite crear nuevos chats.

- **ChatScreen:**  
  Comunicación en tiempo real dentro de un chat (individual o grupal). Los mensajes se sincronizan automáticamente usando funcionalidades de Supabase en tiempo real.

- **NewChatScreen:**  
  Permite buscar usuarios y crear nuevos chats, agregando participantes seleccionados.

- **SplashScreen:**  
  Verifica automáticamente si hay una sesión activa y redirige a la pantalla correcta.

---

## Navegación

La navegación global está gestionada desde `AppNavigator.js` utilizando `@react-navigation/native-stack`.  
Dependiendo del estado de autenticación (usuario logueado o no), muestra las pantallas correspondientes de autenticación o las pantallas del chat.

---

## Dependencias principales del proyecto

- React Native / Expo
- React Native Paper (UI)
- React Navigation
- Supabase JS SDK

Todas detalladas en el archivo `package.json`.

---

## ¿Cómo conecta todo esto?

1. El usuario inicia la app → `SplashScreen` valida la sesión.
2. Si está autenticado, puede ver los chats (`ChatListScreen`), crear nuevos `NewChatScreen`, o entrar a una conversación `ChatScreen`.
3. Para el backend, todas las interacciones (autenticación, lectura/escritura de datos, chat en tiempo real) pasan por Supabase, facilitando el desarrollo y mantenimiento.

---

## Seguridad

No compartas tu clave `anon key` de Supabase en entornos públicos o de producción sin restricciones. Considera variables de entorno y buenas prácticas.

---

¿Quieres que agregue sugerencias para las tablas o arquitectura de Supabase? ¿Incluimos diagramas de flujo o explicación de las relaciones?
