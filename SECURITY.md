# Seguridad Local - Cifrado de Datos Sensibles

## ¿Qué se cifra?

El sistema cifra automáticamente los siguientes datos sensibles en `localStorage`:

- **`chat-storage`**: Conversaciones y mensajes del usuario
- **`model-storage`**: Configuraciones de modelos de IA
- **`selected_model`**: Modelo actualmente seleccionado

## ¿Qué NO se cifra?

- **`access_token`**: ✅ **SEGURO** - Se guarda solo en memoria del navegador (Zustand store), nunca en localStorage
- **`anonymous_fingerprint`**: Identificador anónimo para usuarios no registrados

## Cómo funciona

### 1. Cifrado opcional

- **Por defecto**: Los datos se guardan sin cifrar en localStorage
- **Opcional**: Puedes habilitar el cifrado desde la configuración de seguridad
- **Clave local**: Solo se usa en tu dispositivo y nunca se envía al servidor
- **Algoritmo**: AES-256-GCM (estándar militar)

### 2. Habilitar cifrado

- **Configuración**: Ve a Configuración → Seguridad
- **Habilitar**: Haz clic en "Habilitar Cifrado"
- **Clave**: Configura una clave de seguridad local
- **Aplicar**: La página se recargará para aplicar los cambios

### 3. Sesiones posteriores

- Si hay datos cifrados, aparece el modal pidiendo tu clave
- Sin la clave correcta, no puedes acceder a tus conversaciones anteriores
- La clave se mantiene en memoria hasta cerrar el navegador

### 4. Seguridad técnica

- **Algoritmo**: AES-256-GCM
- **Derivación de clave**: PBKDF2 con 100,000 iteraciones
- **Salt**: Único por sesión, almacenado con los datos cifrados
- **IV**: Vector de inicialización único por cada cifrado
- **Autenticación**: Cookies HttpOnly + tokens en memoria + blindaje extra en backend

## Limitaciones de seguridad

### ✅ Protege contra:

- Inspección casual de localStorage
- Dispositivos perdidos/robados
- Backups accidentales
- Compartir pantalla con datos visibles

### ❌ NO protege contra:

- **XSS activo**: Si hay código malicioso ejecutándose en tu navegador, puede usar la misma clave para descifrar
- **Keyloggers**: Software que registra las teclas que presionas
- **Acceso físico**: Si alguien tiene acceso a tu computadora desbloqueada

## Recomendaciones

### Para máxima seguridad:

1. **CSP estricta**: Configura Content Security Policy sin `unsafe-inline`
2. **Sanitización**: Usa `rehype-sanitize` para contenido HTML/Markdown
3. **HTTPS**: Siempre usa conexiones seguras
4. **Actualizaciones**: Mantén el navegador actualizado

### Para mejor UX:

1. **Clave memorable**: Usa una frase que puedas recordar fácilmente
2. **No compartir**: Nunca compartas tu clave de seguridad local
3. **Backup**: Considera exportar conversaciones importantes

## Recuperación de datos

### Si olvidas tu clave:

- **No hay recuperación automática**: Por diseño de seguridad
- **Opción 1**: Crear nueva sesión (se perderán datos locales)
- **Opción 2**: Si tienes conversaciones en el servidor, se sincronizarán automáticamente

### Si hay problemas técnicos:

- Limpia localStorage: `localStorage.clear()`
- Recarga la página para reiniciar el proceso de cifrado

## Implementación técnica

### Archivos principales:

- `src/stores/tokenStore.ts`: Store para tokens en memoria (Zustand)
- `src/utils/cryptoLocal.ts`: Utilidades de cifrado con Web Crypto API
- `src/utils/secureStorage.ts`: Storage cifrado para Zustand
- `src/components/ui/PassphraseModal.tsx`: Modal para solicitar clave
- `src/components/auth/SecureStorageInitializer.tsx`: Inicializador de seguridad
- `src/hooks/useSecureStorage.ts`: Hook para gestionar cifrado

### Integración con stores:

```typescript
// tokenStore.ts - Tokens en memoria
const useTokenStore = create<TokenStore>()(
  subscribeWithSelector((set, get) => ({
    accessToken: null,
    setToken: (token) => set({ accessToken: token }),
    clearToken: () => set({ accessToken: null }),
  }))
);

// chatStore.ts y modelStore.ts - Datos cifrados
storage: createJSONStorage(() => secureStorageManager.getStorage());
```

### Flujo de inicialización:

1. `SecureStorageInitializer` detecta si hay datos cifrados
2. Si hay datos cifrados → pide clave para descifrar
3. Si no hay datos → pide clave para cifrar nuevos datos
4. Una vez establecida la clave, la app funciona normalmente

## Configuración avanzada

### Cambiar algoritmo de cifrado:

Editar `src/utils/cryptoLocal.ts`:

```typescript
// Cambiar de AES-GCM a AES-CBC (menos seguro)
{ name: 'AES-CBC', length: 256 }
```

### Ajustar iteraciones PBKDF2:

```typescript
// Aumentar iteraciones (más seguro, más lento)
iterations: 200_000;
```

### Usar WebAuthn (futuro):

Para evitar passphrases, se puede implementar WebAuthn para envolver la clave de cifrado con autenticación biométrica.

## Troubleshooting

### Error: "No se pudo descifrar"

- Verifica que la clave sea correcta
- Asegúrate de que los datos no estén corruptos
- Intenta limpiar localStorage y empezar de nuevo

### Error: "Formato de cifrado no soportado"

- Los datos pueden ser de una versión anterior
- Limpia localStorage para migrar a la nueva versión

### La app no carga

- Verifica que el navegador soporte Web Crypto API
- Usa un navegador moderno (Chrome 37+, Firefox 34+, Safari 7+)

## Futuras mejoras

- [ ] WebAuthn para autenticación biométrica
- [ ] Migración automática de datos sin cifrar
- [ ] Exportación/importación de claves
- [ ] Múltiples claves por usuario
- [ ] Cifrado asimétrico para compartir datos
