# PWA (Progressive Web App)

## Visão Geral

O ChatIA Flow possui uma implementação completa de **Progressive Web App (PWA)**, permitindo que a aplicação seja instalada em dispositivos móveis e desktops, funcione offline e envie notificações push.

**Status Atual:** O Service Worker está **DESABILITADO** por padrão no ambiente de produção.

```javascript
// src/index.js:23
serviceworker.unregister(); // ❌ Desabilitado por padrão
```

**Para habilitar o PWA:**
```javascript
// src/index.js:23
serviceworker.register(); // ✅ Habilitar PWA
```

---

## Service Worker

### Arquivos

```
frontend/
├── src/
│   └── serviceWorker.js         # Funções register/unregister
└── public/
    └── service-worker.js        # Implementação do SW
```

### 1. Implementação Completa

**Arquivo:** `/frontend/public/service-worker.js` (99 linhas)

#### 1.1 Controle de Versão de Cache

```javascript
// Nomes dos caches para controle de versão
const STATIC_CACHE = "mf-static-v1";
const RUNTIME_CACHE = "mf-runtime-v1";
```

**Como atualizar o cache:**
```javascript
// Incrementar versão força limpeza do cache antigo
const STATIC_CACHE = "mf-static-v2"; // ← Nova versão
const RUNTIME_CACHE = "mf-runtime-v2";
```

#### 1.2 Precache de Arquivos Essenciais

```javascript
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png"
];
```

**Arquivos cacheados durante a instalação:**
- Arquivos essenciais para funcionamento offline
- Shell da aplicação (HTML + ícones)
- Manifest para metadados do PWA

#### 1.3 Eventos do Ciclo de Vida

**INSTALL - Instalação do Service Worker**

```javascript
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()) // Força ativação imediata
  );
});
```

**Fluxo:**
1. Abre o cache estático
2. Adiciona todos os arquivos essenciais
3. `skipWaiting()` força a ativação do novo SW sem esperar abas fecharem

**ACTIVATE - Ativação do Service Worker**

```javascript
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    // Limpa caches antigos para evitar conflitos
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(name => ![STATIC_CACHE, RUNTIME_CACHE].includes(name))
        .map(name => caches.delete(name))
    );
    await self.clients.claim(); // Assume controle de todas as páginas
  })());
});
```

**Fluxo:**
1. Lista todos os caches existentes
2. Remove caches com versões antigas
3. `clients.claim()` assume controle imediato de todas as abas abertas

---

### 2. Push Notifications

#### 2.1 BroadcastChannel para Comunicação

```javascript
let broadcastChannel;
try {
  broadcastChannel = new BroadcastChannel("pwa-events");
} catch (e) {
  console.error("Broadcast Channel não é suportado.");
}
```

**Finalidade:**
- Comunicação bidirecional entre Service Worker e aplicação
- Atualização em tempo real quando notificação é recebida
- Sincronização de estado entre abas

#### 2.2 Evento PUSH

```javascript
self.addEventListener("push", event => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch (e) {
    payload = { title: "Notificação", body: event.data.text() };
  }

  const title = payload.title || "ChatIA";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/android-chrome-192x192.png",
    badge: payload.badge || "/android-chrome-192x192.png",
    tag: payload.tag || "default-tag",
    data: {
      url: payload.url || "/",
      ...payload.data
    },
    sound: payload.sound || undefined,
    vibrate: payload.vibrate || [200, 100, 200],
    requireInteraction: true // Mantém notificação até interação
  };

  // Envia mensagem para aplicação via BroadcastChannel
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: "PUSH_EVENT", payload });
  }

  event.waitUntil(self.registration.showNotification(title, options));
});
```

**Estrutura do Payload:**
```typescript
interface PushPayload {
  title: string;           // Título da notificação
  body: string;            // Corpo da mensagem
  icon?: string;           // Ícone da notificação (padrão: logo 192x192)
  badge?: string;          // Badge do app (ícone pequeno)
  tag?: string;            // Tag para agrupar notificações
  url?: string;            // URL de destino ao clicar
  sound?: string;          // Som da notificação
  vibrate?: number[];      // Padrão de vibração [200, 100, 200]
  data?: any;              // Dados customizados
}
```

**Exemplo de Payload do Backend:**
```json
{
  "title": "Nova Mensagem",
  "body": "João enviou: Olá, preciso de ajuda",
  "icon": "/android-chrome-192x192.png",
  "badge": "/android-chrome-192x192.png",
  "tag": "ticket-123",
  "url": "/tickets/123",
  "vibrate": [200, 100, 200],
  "data": {
    "ticketId": 123,
    "contactId": 456,
    "priority": "high"
  }
}
```

#### 2.3 Clique em Notificação

```javascript
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const urlToOpen = (event.notification.data && event.notification.data.url) || "/";
  event.waitUntil(focusOrOpen(urlToOpen));
});

// Foca aba existente ou abre nova
async function focusOrOpen(url) {
  const allClients = await clients.matchAll({ type: "window", includeUncontrolled: true });
  const targetClient = allClients.find(c => c.url.includes(url));
  if (targetClient) {
    return targetClient.focus(); // Foca aba existente
  }
  return clients.openWindow(url); // Abre nova aba
}
```

**Fluxo ao Clicar:**
1. Fecha a notificação
2. Extrai URL do payload (`data.url`)
3. Busca por abas abertas com a URL
4. Se encontrar, foca a aba existente
5. Se não, abre nova aba

---

### 3. Registro do Service Worker

**Arquivo:** `/frontend/src/serviceWorker.js`

```javascript
export function register() {
  console.log("Registrando service worker", navigator);
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      navigator.serviceWorker.register(swUrl)
        .then((registration) => {
          console.log('Service worker registrado com sucesso!', registration);
        })
        .catch((error) => {
          console.error('Erro durante o registro do service worker:', error);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      })
      .catch((error) => {
        console.error('Erro durante o desregistro do service worker:', error);
      });
  }
}
```

**Uso no `src/index.js`:**
```javascript
import * as serviceworker from './serviceWorker';

// ❌ Desabilitado (padrão atual)
serviceworker.unregister();

// ✅ Habilitado (para ativar PWA)
serviceworker.register();
```

---

## Manifest.json

### Configuração Completa

**Arquivo:** `/frontend/public/manifest.json`

```json
{
  "short_name": "ChatIA Flow",
  "name": "ChatIA Flow",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "prefer_related_applications": false,
  "categories": ["business", "productivity"],
  "description": "Sistema de MultiAtendimento para WhatsApp",
  "orientation": "any",
  "scope": "/",
  "shortcuts": [
    {
      "name": "Iniciar atendimento",
      "short_name": "Atendimento",
      "description": "Iniciar novo atendimento",
      "url": "/atendimento"
    }
  ]
}
```

### Propriedades Explicadas

| Propriedade | Valor | Descrição |
|------------|-------|-----------|
| `short_name` | "ChatIA Flow" | Nome curto exibido no ícone do app |
| `name` | "ChatIA Flow" | Nome completo do app |
| `icons` | Array[3] | Ícones em múltiplos tamanhos (16-512px) |
| `start_url` | "." | URL inicial ao abrir o app instalado |
| `display` | "standalone" | Modo de exibição (sem barra de navegador) |
| `theme_color` | "#000000" | Cor do tema (barra de status no Android) |
| `background_color` | "#ffffff" | Cor de fundo da splash screen |
| `categories` | ["business", "productivity"] | Categorias da loja de apps |
| `description` | "Sistema de MultiAtendimento..." | Descrição do app |
| `orientation` | "any" | Permite todas as orientações |
| `scope` | "/" | Escopo de URLs controladas pelo PWA |
| `shortcuts` | Array[1] | Atalhos do app (Android long-press) |

### Ícones

**Requisitos:**
- **192x192px:** Mínimo para Android
- **512x512px:** Recomendado para splash screens
- **maskable:** Suporte para ícones adaptativos Android

**Localização:**
```
frontend/public/
├── favicon.ico                    # 64x64, 32x32, 24x24, 16x16
├── android-chrome-192x192.png     # 192x192
├── android-chrome-512x512.png     # 512x512
└── apple-touch-icon.png           # iOS (180x180)
```

### Shortcuts (Atalhos)

```json
"shortcuts": [
  {
    "name": "Iniciar atendimento",
    "short_name": "Atendimento",
    "description": "Iniciar novo atendimento",
    "url": "/atendimento"
  }
]
```

**Como usar (Android):**
1. Long-press no ícone do app
2. Menu de atalhos aparece
3. "Iniciar atendimento" abre diretamente `/atendimento`

**Adicionar mais atalhos:**
```json
"shortcuts": [
  {
    "name": "Dashboard",
    "url": "/",
    "description": "Ver dashboard principal"
  },
  {
    "name": "Tickets",
    "url": "/tickets",
    "description": "Ver lista de tickets"
  },
  {
    "name": "Contatos",
    "url": "/contacts",
    "description": "Gerenciar contatos"
  }
]
```

---

## Instalação do PWA

### 1. Desktop (Chrome/Edge)

**Critérios para Prompt de Instalação:**
- ✅ Manifest.json válido
- ✅ Service Worker registrado
- ✅ Servido via HTTPS (ou localhost)
- ✅ Usuário visitou o site pelo menos uma vez

**Fluxo:**
1. Ícone de instalação aparece na barra de URL
2. Usuário clica em "Instalar ChatIA Flow"
3. App é instalado como aplicação nativa
4. Ícone aparece no menu Iniciar/Launchpad

**Captura Programática do Evento:**
```javascript
// App.js ou componente raiz
useEffect(() => {
  let deferredPrompt;

  const handleBeforeInstallPrompt = (e) => {
    // Previne prompt automático
    e.preventDefault();
    deferredPrompt = e;

    // Mostrar botão customizado de instalação
    setShowInstallButton(true);
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  };
}, []);

// Função para disparar instalação customizada
const handleInstallClick = async () => {
  if (!deferredPrompt) return;

  // Mostra o prompt nativo
  deferredPrompt.prompt();

  // Aguarda a escolha do usuário
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} a instalação`);

  deferredPrompt = null;
  setShowInstallButton(false);
};
```

### 2. Android

**Critérios:**
- ✅ Todos os critérios do desktop
- ✅ Manifest com `display: "standalone"`
- ✅ Ícones 192x192 e 512x512

**Fluxo:**
1. Chrome mostra banner "Adicionar à tela inicial"
2. Usuário aceita
3. Ícone aparece na tela inicial
4. App abre em tela cheia (sem barra de navegador)

**Features Android Exclusivas:**
- **Splash Screen:** Gerada automaticamente com `background_color` + ícone 512x512
- **Theme Color:** Cor da barra de status
- **Shortcuts:** Long-press no ícone

### 3. iOS (Safari)

**IMPORTANTE:** iOS **não suporta** Service Workers para PWAs completos, mas permite adicionar à tela inicial.

**Fluxo Manual:**
1. Abrir no Safari
2. Tocar no ícone de compartilhar (⬆️)
3. "Adicionar à Tela Inicial"

**Meta Tags Necessárias:**
```html
<!-- public/index.html -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="ChatIA Flow">
<link rel="apple-touch-icon" href="%PUBLIC_URL%/apple-touch-icon.png" />
```

**Limitações iOS:**
- ❌ Sem Push Notifications via Service Worker
- ❌ Sem cache offline via Service Worker
- ✅ Apenas adiciona atalho à tela inicial

---

## Notificações Push

### 1. Permissão do Usuário

```javascript
// Solicitar permissão para notificações
const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("Navegador não suporta notificações");
    return null;
  }

  const permission = await Notification.requestPermission();

  if (permission === "granted") {
    console.log("Permissão concedida!");
    return await getSubscription();
  } else if (permission === "denied") {
    console.log("Permissão negada");
    return null;
  } else {
    console.log("Permissão ignorada");
    return null;
  }
};
```

### 2. Obter Subscription

```javascript
const getSubscription = async () => {
  const registration = await navigator.serviceWorker.ready;

  // Obter subscription existente ou criar nova
  let subscription = await registration.pushManager.getSubscription();

  if (!subscription) {
    // Criar nova subscription (precisa de VAPID keys do backend)
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
  }

  return subscription;
};

// Converter VAPID key de base64 para Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
```

### 3. Enviar Subscription para Backend

```javascript
const savePushSubscription = async (subscription) => {
  await api.post("/push-subscriptions", {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: arrayBufferToBase64(subscription.getKey('p256dh')),
      auth: arrayBufferToBase64(subscription.getKey('auth'))
    }
  });
};

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
```

### 4. Backend: Enviar Notificação (Node.js)

```javascript
// Backend com web-push
const webpush = require('web-push');

// Configurar VAPID keys (gerar uma vez com webpush.generateVAPIDKeys())
webpush.setVapidDetails(
  'mailto:contato@chatiaflow.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Enviar notificação
const sendPushNotification = async (subscription, payload) => {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log('Push enviado com sucesso!');
  } catch (error) {
    console.error('Erro ao enviar push:', error);

    // Se subscription expirou, remover do banco
    if (error.statusCode === 410) {
      await removeSubscription(subscription.endpoint);
    }
  }
};

// Exemplo de uso
const payload = {
  title: "Nova Mensagem",
  body: "João enviou: Olá, preciso de ajuda",
  icon: "/android-chrome-192x192.png",
  url: "/tickets/123",
  vibrate: [200, 100, 200],
  data: {
    ticketId: 123,
    contactId: 456
  }
};

await sendPushNotification(userSubscription, payload);
```

### 5. Frontend: Receber Notificação via BroadcastChannel

```javascript
// App.js ou componente raiz
useEffect(() => {
  if (!("BroadcastChannel" in window)) return;

  const channel = new BroadcastChannel("pwa-events");

  channel.onmessage = (event) => {
    if (event.data.type === "PUSH_EVENT") {
      const { payload } = event.data;

      console.log("Notificação recebida:", payload);

      // Atualizar UI em tempo real
      if (payload.data?.ticketId) {
        // Recarregar ticket específico
        refetchTicket(payload.data.ticketId);
      }
    }
  };

  return () => channel.close();
}, []);
```

---

## Capacidades Offline

### 1. Estratégia de Cache

**Cache-First (Arquivos Estáticos):**
```javascript
// Arquivos em PRECACHE_URLS são servidos do cache primeiro
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - retorna do cache
        if (response) {
          return response;
        }

        // Cache miss - busca da rede
        return fetch(event.request);
      })
  );
});
```

**Network-First (API Requests):**
```javascript
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          // Clona resposta para cachear
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then(cache => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Fallback para cache se offline
          return caches.match(event.request);
        })
    );
  }
});
```

### 2. Detectar Status Online/Offline

```javascript
const [isOnline, setIsOnline] = useState(navigator.onLine);

useEffect(() => {
  const handleOnline = () => setIsOnline(true);
  const handleOffline = () => setIsOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}, []);

// Mostrar banner quando offline
{!isOnline && (
  <Banner severity="warning">
    Você está offline. Algumas funcionalidades podem não funcionar.
  </Banner>
)}
```

### 3. Background Sync (Envio Offline)

```javascript
// Service Worker: registrar sync
self.addEventListener('sync', event => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  // Buscar mensagens pendentes do IndexedDB
  const pendingMessages = await getPendingMessages();

  // Tentar enviar cada mensagem
  for (const message of pendingMessages) {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        body: JSON.stringify(message)
      });

      // Remover da fila se sucesso
      await removePendingMessage(message.id);
    } catch (error) {
      console.error('Falha ao sincronizar mensagem:', error);
    }
  }
}
```

```javascript
// Frontend: registrar sync ao enviar mensagem offline
const sendMessage = async (message) => {
  if (!navigator.onLine) {
    // Salvar no IndexedDB
    await savePendingMessage(message);

    // Registrar background sync
    const registration = await navigator.serviceWorker.ready;
    await registration.sync.register('sync-messages');

    toast.info("Mensagem será enviada quando voltar online");
  } else {
    await api.post('/messages', message);
  }
};
```

---

## Atualização do PWA

### 1. Detectar Nova Versão

```javascript
// App.js
const [newVersionAvailable, setNewVersionAvailable] = useState(false);
const [registration, setRegistration] = useState(null);

useEffect(() => {
  if (!('serviceWorker' in navigator)) return;

  navigator.serviceWorker.ready.then(reg => {
    setRegistration(reg);

    // Verifica atualizações a cada 1 hora
    setInterval(() => {
      reg.update();
    }, 3600000);
  });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    setNewVersionAvailable(true);
  });
}, []);

// Componente de atualização
{newVersionAvailable && (
  <Snackbar
    open={true}
    message="Nova versão disponível!"
    action={
      <Button color="secondary" onClick={() => window.location.reload()}>
        Atualizar
      </Button>
    }
  />
)}
```

### 2. Forçar Atualização do Service Worker

```javascript
const updateServiceWorker = async () => {
  if (!registration) return;

  const newWorker = registration.installing || registration.waiting;

  if (newWorker) {
    newWorker.postMessage({ type: 'SKIP_WAITING' });
  }

  window.location.reload();
};
```

```javascript
// Service Worker: responder a SKIP_WAITING
self.addEventListener('message', event => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
```

---

## Debugging

### 1. Chrome DevTools

**Application Tab:**
- **Manifest:** Visualizar manifest.json e validação
- **Service Workers:** Status, unregister, update
- **Cache Storage:** Ver caches e conteúdo
- **Clear Storage:** Limpar tudo

**Console Úteis:**
```javascript
// Ver service worker ativo
navigator.serviceWorker.controller

// Ver todas as registrations
navigator.serviceWorker.getRegistrations()

// Forçar update
navigator.serviceWorker.getRegistration().then(reg => reg.update())

// Desregistrar
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister())
})
```

### 2. Lighthouse PWA Audit

```bash
# Chrome DevTools > Lighthouse
# ✅ Selecionar "Progressive Web App"
# ✅ Gerar relatório
```

**Critérios Avaliados:**
- ✅ Registra um service worker
- ✅ Responde com 200 quando offline
- ✅ Manifest válido
- ✅ Ícones em múltiplos tamanhos
- ✅ Splash screen configurada
- ✅ Theme color configurado
- ✅ Content sized correctly for viewport

---

## Checklist de Implementação

### Habilitação Completa do PWA

- [ ] **1. Habilitar Service Worker**
  ```javascript
  // src/index.js:23
  serviceworker.register(); // Mudar de unregister() para register()
  ```

- [ ] **2. Configurar VAPID Keys (Backend)**
  ```bash
  # Gerar keys
  npx web-push generate-vapid-keys

  # Adicionar ao .env
  VAPID_PUBLIC_KEY=...
  VAPID_PRIVATE_KEY=...
  ```

- [ ] **3. Implementar Endpoint de Subscription (Backend)**
  ```javascript
  app.post('/push-subscriptions', authenticateJWT, async (req, res) => {
    const { endpoint, keys } = req.body;
    const userId = req.user.id;

    await PushSubscription.upsert({
      userId,
      endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth
    });

    res.json({ success: true });
  });
  ```

- [ ] **4. Solicitar Permissão de Notificação (Frontend)**
  ```javascript
  // Em Settings ou primeiro login
  await requestNotificationPermission();
  ```

- [ ] **5. Enviar Push Notifications (Backend)**
  ```javascript
  // Ao receber nova mensagem
  const subscriptions = await PushSubscription.findAll({ where: { userId } });

  for (const sub of subscriptions) {
    await sendPushNotification(sub, {
      title: "Nova Mensagem",
      body: contact.name + ": " + message.body,
      url: `/tickets/${ticket.id}`
    });
  }
  ```

- [ ] **6. Testar Instalação**
  - Desktop: Verificar ícone de instalação na barra de URL
  - Android: Banner "Adicionar à tela inicial"
  - iOS: Testar adicionar manualmente via Safari

- [ ] **7. Testar Notificações**
  - Permissão concedida corretamente
  - Notificação aparece mesmo com app fechado
  - Clique abre URL correta
  - Múltiplas abas focam corretamente

- [ ] **8. Testar Offline**
  - App carrega sem internet
  - Shell da aplicação visível
  - Mensagem "Você está offline" aparece

- [ ] **9. Validar com Lighthouse**
  - Score PWA ≥ 90
  - Todos os critérios principais passando

- [ ] **10. Documentar para Usuários**
  - Tutorial de instalação por plataforma
  - Como habilitar notificações
  - Benefícios do PWA

---

## Métricas

### Tamanho do Service Worker
- **service-worker.js:** 99 linhas (~3 KB minificado)
- **serviceWorker.js:** 28 linhas (~1 KB)

### Cache Size (Precache)
- **Arquivos:** 6 arquivos essenciais
- **Tamanho:** ~500 KB (HTML + manifest + ícones)

### Performance
- **Time to Interactive (Offline):** < 1s
- **First Contentful Paint (Cached):** < 500ms

---

## Melhorias Futuras

### 1. Cache de API Requests

```javascript
// Cachear responses de API para melhor offline
self.addEventListener('fetch', event => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(RUNTIME_CACHE).then(cache => {
        return cache.match(event.request).then(response => {
          const fetchPromise = fetch(event.request).then(networkResponse => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });

          return response || fetchPromise;
        });
      })
    );
  }
});
```

### 2. Notification Badges

```javascript
// Mostrar contador de mensagens não lidas
navigator.setAppBadge(unreadCount);

// Limpar badge
navigator.clearAppBadge();
```

### 3. Share Target API

```json
// manifest.json
"share_target": {
  "action": "/share",
  "method": "POST",
  "enctype": "multipart/form-data",
  "params": {
    "title": "title",
    "text": "text",
    "url": "url",
    "files": [
      {
        "name": "media",
        "accept": ["image/*", "video/*"]
      }
    ]
  }
}
```

### 4. Periodic Background Sync

```javascript
// Registrar sync periódico (verifica novos tickets a cada 30min)
const status = await navigator.permissions.query({
  name: 'periodic-background-sync'
});

if (status.state === 'granted') {
  await registration.periodicSync.register('sync-tickets', {
    minInterval: 30 * 60 * 1000 // 30 minutos
  });
}
```

### 5. Web Share API

```javascript
// Compartilhar ticket
const shareTicket = async (ticket) => {
  if (navigator.share) {
    await navigator.share({
      title: `Ticket #${ticket.id}`,
      text: ticket.lastMessage,
      url: window.location.href
    });
  }
};
```

---

## Referências

- [MDN: Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [MDN: Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [MDN: Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [Google: Web Push Protocol](https://web.dev/push-notifications-overview/)
- [web-push (npm)](https://www.npmjs.com/package/web-push)
- [Workbox (Google PWA Library)](https://developers.google.com/web/tools/workbox)

---

**Status:** PWA implementado mas desabilitado por padrão. Mudar `serviceworker.unregister()` para `serviceworker.register()` no `src/index.js:23` para habilitar todas as funcionalidades PWA.
