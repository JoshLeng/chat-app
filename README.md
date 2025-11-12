Documentación del Proyecto — Chat App

Este proyecto es una aplicación móvil creada con React Native (utilizando Expo). Su objetivo es permitir la comunicación entre usuarios a través de un sistema de chat moderno, simple y funcional. Para manejar toda la parte del backend (base de datos, autenticación y mensajes en tiempo real) se utiliza Supabase, lo que facilita el trabajo con usuarios, perfiles, chats y mensajes sin necesidad de montar un servidor propio.

Estructura general del proyecto.

El proyecto está organizado de la siguiente manera:

chat-app/
│
├── App.js
├── index.js
├── package.json
├── app.json
├── .gitignore
│
├── assets/
│   └── Recursos gráficos como iconos o imágenes
│
└── src/
    ├── lib/
    │   └── supabaseClient.js       # Aquí se configura la conexión con Supabase
    ├── navigations/
    │   └── AppNavigator.js         # Controla la navegación entre pantallas
    └── screens/
        ├── ChatListScreen.js       # Muestra todos los chats del usuario
        ├── ChatScreen.js           # Pantalla donde se envían y reciben mensajes
        ├── HomeScreen.js           # Pantalla principal con información del usuario
        ├── LoginScreen.js          # Inicio de sesión
        ├── NewChatScreen.js        # Permite crear un nuevo chat
        ├── RegisterScreen.js       # Registro de usuarios nuevos
        └── SplashScreen.js         # Pantalla de carga que revisa si hay sesión activa

Conexión con Supabase

El archivo src/lib/supabaseClient.js es el encargado de conectar la app con Supabase.
Ahí se colocan la URL del proyecto y la clave anon que genera Supabase.
Ejemplo:

import { createClient } from '@supabase/supabase-js';
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'tu_clave_anon';
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


Esta conexión se usa en toda la app para iniciar sesión, registrar usuarios, guardar perfiles, crear chats y enviar mensajes.

Funciones principales que usa Supabase

Autenticación: se utiliza para registrar y loguear usuarios desde las pantallas de RegisterScreen y LoginScreen.

Gestión de perfiles: al iniciar sesión, si el usuario no tiene un perfil en la base de datos, se crea automáticamente.

Chats y mensajes: las tablas chats, chat_participantes y mensajes guardan toda la información del chat. Los mensajes se actualizan en tiempo real gracias a los canales de Supabase.

Descripción de las pantallas

LoginScreen y RegisterScreen: permiten crear cuenta o iniciar sesión.

HomeScreen: muestra los datos del usuario y la opción de cerrar sesión.

ChatListScreen: lista de los chats en los que participa el usuario.

ChatScreen: permite conversar en tiempo real con otros usuarios.

NewChatScreen: sirve para crear un nuevo chat o buscar usuarios.

SplashScreen: revisa si el usuario ya tiene sesión iniciada y redirige automáticamente.

Navegación entre pantallas

Toda la navegación se maneja desde AppNavigator.js usando la librería @react-navigation/native-stack.
Dependiendo si el usuario está logueado o no, muestra las pantallas de autenticación o las de chat.

Dependencias que utiliza el proyecto

React Native / Expo

React Navigation (para moverse entre pantallas)

React Native Paper (para los componentes visuales)

Supabase JS SDK (para conectar la app con la base de datos)

Cómo funciona todo en conjunto

El usuario abre la app y la SplashScreen verifica si hay una sesión activa.

Si está autenticado, puede ver sus chats (ChatListScreen) o crear nuevos (NewChatScreen).

Cuando entra a un chat (ChatScreen), los mensajes se actualizan en tiempo real gracias a Supabase.

Todo el manejo de usuarios, autenticación, mensajes y datos pasa por Supabase, lo cual simplifica el mantenimiento.

Seguridad

Es importante no compartir la clave pública (anon key) en lugares públicos o en repositorios abiertos.
Lo ideal es usar variables de entorno para mayor seguridad.

Guía para ejecutar la app

Clonar el proyecto:

git clone https://github.com/tu-usuario/chat-app.git
cd chat-app


Instalar dependencias:

npm install


Configurar Supabase:

Crear un nuevo proyecto en https://supabase.com
.

Copiar la URL y la clave anon.

Pegar esos valores en el archivo supabaseClient.js.

Ejecutar la app:

npx expo start


Luego, desde tu teléfono, abrir la app Expo Go y escanear el código QR.

Base de datos en Supabase

La app usa varias tablas para manejar la información. Estas son las principales:

1. Tabla perfiles

Guarda los datos básicos de cada usuario.

Campo	Tipo	Descripción
id	uuid (PK)	Id del usuario (vinculado con la autenticación)
nombre	text	Nombre del usuario
avatar_url	text	Imagen o avatar
created_at	timestamp	Fecha en que se creó
2. Tabla chats

Guarda la información general de cada chat.

Campo	Tipo	Descripción
id	uuid (PK)	Identificador del chat
nombre	text	Nombre del chat (en caso de grupos)
es_grupal	boolean	Indica si es un chat grupal o individual
creado_por	uuid	Usuario que lo creó
created_at	timestamp	Fecha de creación
3. Tabla chat_participantes

Relaciona a los usuarios con los chats.

Campo	Tipo	Descripción
id	serial (PK)	Identificador
chat_id	uuid (FK)	Chat al que pertenece
usuario_id	uuid (FK)	Usuario participante
joined_at	timestamp	Fecha en que se unió
4. Tabla mensajes

Guarda los mensajes enviados por los usuarios.

Campo	Tipo	Descripción
id	serial (PK)	Identificador
chat_id	uuid (FK)	Chat al que pertenece
remitente_id	uuid (FK)	Usuario que envió el mensaje
contenido	text	Texto del mensaje
created_at	timestamp	Fecha y hora en que se envió
Relaciones entre tablas

Un usuario puede estar en varios chats (relación muchos a muchos).

Un chat puede tener varios mensajes.

Cada mensaje pertenece a un solo usuario y a un solo chat.
