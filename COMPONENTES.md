# Caso: Componentes del Sistema R3Chat

Este documento describe los principales componentes de la arquitectura del sistema R3Chat, una aplicación de chat SaaS basada en microservicios.

---

## Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           R3CHAT SYSTEM                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│  │   Frontend   │────▶│   Gateway    │────▶│  Microserv.  │            │
│  │  (React)     │     │   (NestJS)   │     │  (NATS)      │            │
│  └──────────────┘     └──────────────┘     └──────┬───────┘            │
│         │                    │                    │                    │
│         ▼                    ▼                    ▼                    │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│  │  WebSocket   │     │   Auth       │     │    Users     │            │
│  │  (Realtime)  │     │   (OAuth)    │     │  (Profiles)  │            │
│  └──────────────┘     └──────────────┘     └──────────────┘            │
│                                                         │              │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐            │
│  │   Upload     │     │   Billing    │◀────│    Chat      │            │
│  │  (Images)    │     │  (PayPal)    │     │ (Messaging)  │            │
│  └──────────────┘     └──────────────┘     └──────────────┘            │
│                                │                                       │
│  ┌──────────────┐     ┌────────┴───────┐     ┌──────────────┐          │
│  │    Usage     │◀────│   Database     │     │    Redis     │          │
│  │ (Analytics)  │     │  (PostgreSQL)  │     │   (Cache)    │          │
│  └──────────────┘     └────────────────┘     └──────────────┘          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Tabla de Componentes

| Componente | Interfaz Propuesta | Responsabilidad |
|------------|-------------------|-----------------|
| **Autenticación** | `IAuthService` | Gestionar login, logout, OAuth (Google) y generación de tokens JWT. |
| **Usuarios** | `IUserManager` | CRUD de perfiles de usuario, gestión de roles y preferencias. |
| **Chat** | `IChatService` | Enviar/recibir mensajes, gestionar conversaciones y WebSocket. |
| **Facturación** | `IBillingService` | Procesar pagos (PayPal), gestionar suscripciones y planes. |
| **Uso/Usage** | `IUsageTracker` | Monitorear consumo de recursos, cuotas y límites del usuario. |
| **Upload** | `IFileUploader` | Subir imágenes/archivos a Cloudflare Images, generar URLs. |
| **Gateway** | `IAPIGateway` | Enrutar peticiones, autenticar requests y rate limiting. |
| **Notificaciones** | `INotifier` | Enviar notificaciones push, email o in-app a usuarios. |

---

## Detalle de Componentes

### 1. Autenticación (`IAuthService`)

```typescript
interface IAuthService {
  login(email: string, password: string): Promise<AuthToken>;
  logout(userId: string): Promise<void>;
  googleOAuth(code: string): Promise<AuthToken>;
  refreshToken(refreshToken: string): Promise<AuthToken>;
  validateToken(token: string): Promise<UserPayload>;
}
```

**Responsabilidades:**
- Autenticación con email/password
- OAuth con Google
- Generación y validación de JWT
- Refresh tokens
- Revocación de sesiones

---

### 2. Gestión de Usuarios (`IUserManager`)

```typescript
interface IUserManager {
  createUser(data: CreateUserDto): Promise<User>;
  getUserById(id: string): Promise<User>;
  updateProfile(id: string, data: UpdateProfileDto): Promise<User>;
  deleteUser(id: string): Promise<void>;
  listUsers(filters: UserFilters): Promise<User[]>;
}
```

**Responsabilidades:**
- CRUD de usuarios
- Gestión de perfiles (avatar, nombre, bio)
- Roles y permisos
- Soft delete de cuentas

---

### 3. Servicio de Chat (`IChatService`)

```typescript
interface IChatService {
  sendMessage(conversationId: string, content: string, senderId: string): Promise<Message>;
  getConversation(id: string): Promise<Conversation>;
  createConversation(participants: string[]): Promise<Conversation>;
  getMessages(conversationId: string, pagination: Pagination): Promise<Message[]>;
  markAsRead(conversationId: string, userId: string): Promise<void>;
}
```

**Responsabilidades:**
- Enviar y recibir mensajes
- Gestión de conversaciones (1:1 y grupales)
- WebSocket para tiempo real
- Estado de lectura (read receipts)
- Historial de mensajes con paginación

---

### 4. Facturación (`IBillingService`)

```typescript
interface IBillingService {
  createProduct(data: CreateProductDto): Promise<PayPalProduct>;
  createPlan(data: CreatePlanDto): Promise<PayPalPlan>;
  createSubscription(userId: string, planId: string): Promise<Subscription>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  getSubscription(id: string): Promise<Subscription>;
  handleWebhook(event: PayPalEvent): Promise<void>;
}
```

**Responsabilidades:**
- Integración con PayPal API
- Crear productos y planes de suscripción
- Procesar pagos recurrentes
- Webhooks para eventos de pago
- Cancelaciones y reembolsos

---

### 5. Tracking de Uso (`IUsageTracker`)

```typescript
interface IUsageTracker {
  recordUsage(userId: string, metric: string, value: number): Promise<void>;
  getUsage(userId: string, period: DateRange): Promise<UsageReport>;
  checkQuota(userId: string, metric: string): Promise<QuotaStatus>;
  getLimits(userId: string): Promise<UsageLimits>;
}
```

**Responsabilidades:**
- Registrar consumo de recursos (mensajes, tokens AI, storage)
- Verificar límites del plan del usuario
- Reportes de uso
- Alertas de aproximación a límites

---

### 6. Subida de Archivos (`IFileUploader`)

```typescript
interface IFileUploader {
  uploadImage(file: Buffer, userId: string): Promise<UploadedImage>;
  getImageUrls(imageId: string): Promise<ImageVariants>;
  deleteImage(imageId: string): Promise<void>;
  validateFile(file: Buffer): ValidationResult;
}
```

**Responsabilidades:**
- Subir imágenes a Cloudflare Images
- Generar URLs de diferentes tamaños (thumbnail, medium, large)
- Validar tipos de archivo y tamaño
- Eliminar imágenes

---

### 7. API Gateway (`IAPIGateway`)

```typescript
interface IAPIGateway {
  routeRequest(path: string, method: string, headers: Headers, body: any): Promise<Response>;
  authenticateRequest(token: string): Promise<AuthResult>;
  applyRateLimit(userId: string, endpoint: string): Promise<RateLimitStatus>;
  healthCheck(): Promise<HealthStatus>;
}
```

**Responsabilidades:**
- Enrutar peticiones a microservicios correspondientes
- Autenticación de requests (JWT validation)
- Rate limiting
- CORS handling
- Health checks

---

### 8. Notificaciones (`INotifier`)

```typescript
interface INotifier {
  sendPush(userId: string, notification: PushNotification): Promise<void>;
  sendEmail(to: string, template: EmailTemplate): Promise<void>;
  sendInApp(userId: string, notification: InAppNotification): Promise<void>;
  subscribeToTopic(userId: string, topic: string): Promise<void>;
}
```

**Responsabilidades:**
- Notificaciones push
- Emails transaccionales
- Notificaciones in-app
- Suscripciones a topics/eventos

---

## Interacciones entre Componentes

```
Usuario inicia sesión:
  Frontend ──▶ Gateway ──▶ Auth Service ──▶ Database
                                    └──▶ JWT Token

Usuario envía mensaje:
  Frontend ──▶ Gateway ──▶ Chat Service ──▶ Database
                                    └──▶ WebSocket ──▶ Destinatario
                                     
Usuario hace upgrade:
  Frontend ──▶ Gateway ──▶ Billing ──▶ PayPal API
                                └──▶ Webhook ──▶ Update User Plan
```

---

## Infraestructura de Soporte

| Servicio | Tecnología | Propósito |
|----------|-----------|-----------|
| **Base de Datos** | PostgreSQL | Persistencia de datos |
| **Cache** | Redis | Sesiones, rate limiting, cache |
| **Message Broker** | NATS | Comunicación entre microservicios |
| **Storage** | Cloudflare Images | Almacenamiento de imágenes |
| **Pagos** | PayPal API | Procesamiento de suscripciones |

---

## Consideraciones de Diseño

1. **Separación de Responsabilidades:** Cada microservicio tiene una única responsabilidad clara
2. **Comunicación Asíncrona:** Uso de NATS para desacoplar servicios
3. **Escalabilidad:** Cada componente puede escalar independientemente
4. **Resiliencia:** Health checks y graceful degradation
5. **Seguridad:** Autenticación centralizada en Gateway, tokens JWT

---

*Documento generado para el curso de Ingeniería de Software 2*
