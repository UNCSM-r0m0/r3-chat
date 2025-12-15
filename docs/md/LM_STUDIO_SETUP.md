# Configuración de LM Studio en el Backend Go

## 🔍 Problema

El modelo `openai/gpt-oss-20b` de LM Studio no aparece en el frontend, aunque está corriendo en `http://192.168.1.13:1234`.

## ✅ Solución

El backend Go necesita detectar modelos de LM Studio usando el endpoint `GET /v1/models` y exponerlos en `/api/models/public`.

## 📋 Pasos para el Backend Go

### 1. Verificar que LM Studio esté accesible

```bash
# Probar que LM Studio responde
curl http://192.168.1.13:1234/v1/models
```

Deberías ver una respuesta JSON con los modelos disponibles, por ejemplo:

```json
{
  "data": [
    {
      "id": "openai/gpt-oss-20b",
      "object": "model",
      "created": 1234567890,
      "owned_by": "lmstudio"
    }
  ]
}
```

### 2. Configurar el backend para detectar LM Studio

El backend debe:

1. **Hacer polling periódico** a `http://192.168.1.13:1234/v1/models`
2. **Combinar modelos** de:
   - Ollama (ya funcionando)
   - LM Studio (necesita configuración)
3. **Exponer todos los modelos** en `GET /api/models/public`

### 3. Estructura esperada de respuesta

El endpoint `/api/models/public` debe devolver:

```json
{
  "success": true,
  "models": [
    {
      "id": "qwen2.5-coder:7b",
      "name": "Qwen2.5 Coder 7B",
      "provider": "ollama",
      "isAvailable": true,
      "isPremium": false,
      ...
    },
    {
      "id": "openai/gpt-oss-20b",
      "name": "GPT-OSS 20B",
      "provider": "lmstudio",
      "isAvailable": true,
      "isPremium": false,
      ...
    }
  ]
}
```

## 🔧 Implementación en Go

### Ejemplo de código para detectar modelos de LM Studio

```go
// internal/service/lmstudio_service.go
package service

import (
    "encoding/json"
    "fmt"
    "net/http"
    "time"
)

type LMStudioModel struct {
    ID      string `json:"id"`
    Object  string `json:"object"`
    Created int64  `json:"created"`
    OwnedBy string `json:"owned_by"`
}

type LMStudioModelsResponse struct {
    Data []LMStudioModel `json:"data"`
}

type LMStudioService struct {
    baseURL    string
    httpClient *http.Client
    models     []LMStudioModel
    lastUpdate time.Time
}

func NewLMStudioService(baseURL string) *LMStudioService {
    return &LMStudioService{
        baseURL: baseURL,
        httpClient: &http.Client{
            Timeout: 5 * time.Second,
        },
        models: []LMStudioModel{},
    }
}

func (s *LMStudioService) FetchModels() ([]LMStudioModel, error) {
    url := fmt.Sprintf("%s/v1/models", s.baseURL)

    resp, err := s.httpClient.Get(url)
    if err != nil {
        return nil, fmt.Errorf("error fetching LM Studio models: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("LM Studio returned status %d", resp.StatusCode)
    }

    var response LMStudioModelsResponse
    if err := json.NewDecoder(resp.Body).Decode(&response); err != nil {
        return nil, fmt.Errorf("error decoding response: %w", err)
    }

    s.models = response.Data
    s.lastUpdate = time.Now()

    return response.Data, nil
}

func (s *LMStudioService) GetModels() []LMStudioModel {
    // Si los modelos son muy antiguos (más de 1 minuto), refrescar
    if time.Since(s.lastUpdate) > 1*time.Minute {
        go s.FetchModels()
    }
    return s.models
}

// Iniciar polling periódico
func (s *LMStudioService) StartPolling(interval time.Duration) {
    ticker := time.NewTicker(interval)
    go func() {
        for range ticker.C {
            s.FetchModels()
        }
    }()
}
```

### Integración en el handler de modelos

```go
// internal/handler/model_handler.go
func (h *ModelHandler) GetPublicModels(c *gin.Context) {
    // Obtener modelos de Ollama
    ollamaModels := h.ollamaService.GetModels()

    // Obtener modelos de LM Studio
    lmstudioModels := h.lmstudioService.GetModels()

    // Convertir y combinar modelos
    allModels := []ModelResponse{}

    // Agregar modelos de Ollama
    for _, model := range ollamaModels {
        allModels = append(allModels, ModelResponse{
            ID:          model.ID,
            Name:        model.Name,
            Provider:    "ollama",
            IsAvailable: true,
            IsPremium:   false,
            // ... otros campos
        })
    }

    // Agregar modelos de LM Studio
    for _, model := range lmstudioModels {
        allModels = append(allModels, ModelResponse{
            ID:          model.ID,
            Name:        formatModelName(model.ID), // "openai/gpt-oss-20b" -> "GPT-OSS 20B"
            Provider:    "lmstudio",
            IsAvailable: true,
            IsPremium:   false,
            // ... otros campos
        })
    }

    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "models": allModels,
    })
}
```

### Configuración en main.go

```go
// main.go
func main() {
    // ... configuración existente

    // Configurar LM Studio
    lmstudioURL := os.Getenv("LMSTUDIO_URL")
    if lmstudioURL == "" {
        lmstudioURL = "http://192.168.1.13:1234" // Default
    }

    lmstudioService := service.NewLMStudioService(lmstudioURL)

    // Iniciar polling cada 30 segundos
    lmstudioService.StartPolling(30 * time.Second)

    // Fetch inicial
    go lmstudioService.FetchModels()

    // ... resto de la configuración
}
```

## 🔐 Variables de Entorno

Agregar en `.env` o configuración del servidor:

```env
LMSTUDIO_URL=http://192.168.1.13:1234
LMSTUDIO_POLLING_INTERVAL=30s
```

## 🧪 Pruebas

1. **Verificar que LM Studio responde:**

   ```bash
   curl http://192.168.1.13:1234/v1/models
   ```

2. **Verificar que el backend expone los modelos:**

   ```bash
   curl http://localhost:3000/api/models/public
   # o en producción:
   curl https://api.r0lm0.dev/api/models/public
   ```

3. **Verificar en el frontend:**
   - Abrir DevTools → Network
   - Recargar la página
   - Verificar que `GET /api/models/public` incluye `openai/gpt-oss-20b`

## 📝 Notas

- **Polling**: El backend debe hacer polling periódico porque LM Studio puede cargar/descargar modelos dinámicamente
- **Timeout**: Configurar timeout corto (5s) para no bloquear si LM Studio no está disponible
- **Fallback**: Si LM Studio no está disponible, el backend debe seguir funcionando con modelos de Ollama
- **Formato de ID**: Los modelos de LM Studio usan formato `provider/model-name`, mantener este formato en el ID

## 🐛 Troubleshooting

### El modelo no aparece

1. Verificar que LM Studio esté corriendo:

   ```bash
   curl http://192.168.1.13:1234/v1/models
   ```

2. Verificar logs del backend Go para ver si hay errores al conectar con LM Studio

3. Verificar que el backend esté haciendo polling correctamente

4. Verificar que el formato de respuesta del backend incluya el modelo

### Error de conexión

- Verificar que la IP `192.168.1.13` sea accesible desde el servidor del backend
- Verificar firewall/red
- Considerar usar `localhost` si el backend corre en la misma máquina que LM Studio
