```markdown
# Chat App — Documentación del proyecto

Aplicación móvil de chat construida con React Native (Expo) y Supabase. Permite autenticación, gestión de perfiles, creación de chats y mensajería en tiempo real.

---

## Índice
- [Descripción](#descripción)
- [Características principales](#características-principales)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Pantallas y navegación](#pantallas-y-navegación)
- [Conexión con Supabase](#conexión-con-supabase)
- [Esquema de la base de datos (Supabase)](#esquema-de-la-base-de-datos-supabase)
- [Dependencias principales](#dependencias-principales)
- [Seguridad](#seguridad)
- [Flujo de la aplicación](#flujo-de-la-aplicación)

---

## Descripción
Aplicación móvil para comunicación entre usuarios mediante chats individuales o grupales. Implementa autenticación, perfiles de usuario y mensajería en tiempo real usando Supabase.

---

## Características principales
- Registro e inicio de sesión de usuarios (Supabase Auth).
- Perfiles de usuario con avatar.
- Lista de chats y creación de nuevos chats.
- Mensajería en tiempo real dentro de cada chat.
- Soporte para chats grupales e individuales.

---

## Estructura del proyecto

chat-app/
│
├── App.js
├── index.js
├── package.json
├── app.json
├── .gitignore
│
├── assets/
│   └── Recursos gráficos (iconos, imágenes)
│
└── src/
    ├── lib/
    │   └── supabaseClient.js       # Configuración de Supabase
    ├── navigations/
    │   └── AppNavigator.js         # Navegación entre pantallas
    └── screens/
        ├── ChatListScreen.js       # Lista de chats del usuario
        ├── ChatScreen.js           # Conversación en tiempo real
        ├── HomeScreen.js           # Información del usuario / cerrar sesión
        ├── LoginScreen.js          # Inicio de sesión
        ├── NewChatScreen.js        # Crear nuevo chat / buscar usuarios
        ├── RegisterScreen.js       # Registro de usuarios
        └── SplashScreen.js         # Revisa sesión activa

---

## Pantallas y navegación
La navegación se maneja desde `AppNavigator.js` usando `@react-navigation/native-stack`. Dependiendo del estado de autenticación se muestran pantallas de login/registro o pantalla principales de chat.

Descripción breve:
- LoginScreen / RegisterScreen: autenticación.
- HomeScreen: datos del usuario y salida.
- ChatListScreen: listado de chats.
- ChatScreen: mensajería en tiempo real.
- NewChatScreen: crear o buscar chats.
- SplashScreen: revisión de sesión al iniciar la app.

---

## Conexión con Supabase
Crear `src/lib/supabaseClient.js` y configurar la conexión usando variables de entorno.

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL; // o REACT_NATIVE_APP_...
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

Variables de entorno:
- EXPO_PUBLIC_SUPABASE_URL=https://proyecto.supabase.co
- EXPO_PUBLIC_SUPABASE_ANON_KEY=clave_anon

---

## Esquema de la base de datos (Supabase)

Tablas principales y campos:

### 1. perfiles
Guarda datos básicos del usuario (vinculado con Auth).

| Campo       | Tipo         | Descripción                                |
|-------------|--------------|--------------------------------------------|
| id          | uuid (PK)    | Id del usuario (vinculado con Auth)       |
| nombre      | text         | Nombre del usuario                         |
| avatar_url  | text         | URL del avatar                             |
| created_at  | timestamp    | Fecha de creación                          |

### 2. chats
Información general de cada chat (grupal o individual).

| Campo       | Tipo         | Descripción                                |
|-------------|--------------|--------------------------------------------|
| id          | uuid (PK)    | Identificador del chat                     |
| nombre      | text         | Nombre del chat (para grupos)              |
| es_grupal   | boolean      | Indica si es grupal                        |
| creado_por  | uuid         | Usuario que creó el chat                   |
| created_at  | timestamp    | Fecha de creación                          |

### 3. chat_participantes
Relaciona usuarios con chats (muchos a muchos).

| Campo       | Tipo         | Descripción                                |
|-------------|--------------|--------------------------------------------|
| id          | serial (PK)  | Identificador                              |
| chat_id     | uuid (FK)    | Chat al que pertenece                      |
| usuario_id  | uuid (FK)    | Usuario participante                       |
| joined_at   | timestamp    | Fecha en que se unió                       |

### 4. mensajes
Mensajes enviados por los usuarios.

| Campo        | Tipo         | Descripción                               |
|--------------|--------------|-------------------------------------------|
| id           | serial (PK)  | Identificador                             |
| chat_id      | uuid (FK)    | Chat al que pertenece                     |
| remitente_id | uuid (FK)    | Usuario que envió el mensaje              |
| contenido    | text         | Texto del mensaje                         |
| created_at   | timestamp    | Fecha y hora de envío                     |

Relaciones:
- Un usuario puede participar en varios chats (N:M via chat_participantes).
- Un chat puede tener muchos mensajes.
- Cada mensaje pertenece a un solo remitente y un solo chat.

---

## Cómo ejecutar la app (local)

1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/chat-app.git
cd chat-app
```

2. Instalar dependencias
```bash
npm install
# o
yarn install
```

3. Ejecutar la app
```bash
npx expo start
```
Luego usar Expo Go en el teléfono o emulador para probar.

---

## Dependencias principales
- React Native / Expo
- @react-navigation/native-stack (React Navigation)
- React Native Paper (UI)
- @supabase/supabase-js (SDK de Supabase)

---

## Seguridad
- Revisar reglas de RLS (Row Level Security) en Supabase para proteger datos.

---

## Flujo de la aplicación
1. SplashScreen verifica si hay sesión activa.
2. Si no hay sesión → mostrar Login/Register.
3. Si hay sesión → cargar Home y lista de chats (ChatListScreen).
4. Al entrar a un chat (ChatScreen) se suscribe a actualizaciones en tiempo real (canales de Supabase) para recibir y enviar mensajes.
5. La gestión de perfiles (creación/actualización) se realiza automáticamente si el usuario no tiene perfil en la DB al iniciar sesión.

---

```
