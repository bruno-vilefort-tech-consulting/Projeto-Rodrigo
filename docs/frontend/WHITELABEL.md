# WHITELABEL - Sistema de Personalização de Marca

## Visão Geral

O ChatIA Flow possui um **sistema completo de whitelabel** que permite personalizar a identidade visual da plataforma, incluindo cores, logos e nome do sistema. Essa funcionalidade é exclusiva para **super users** e permite criar uma experiência completamente brandada para cada cliente.

**Localização:** Configurações > Whitelabel (Tab exclusiva para super users)

**Arquivo Principal:** `/frontend/src/components/Settings/Whitelabel.js` (517 linhas)

---

## Configurações Disponíveis

### 1. Cores Primárias

#### 1.1 Cor Primária Modo Claro

**Campo:** `primaryColorLight`
**Label:** "Cor Primária Modo Claro"
**Tipo:** Color Picker (Hex Color)
**Padrão:** `#0000FF`

**Aplicação:**
- Cor principal do tema claro
- Scrollbars
- Botões primários
- Links e destaques
- Barra superior (AppBar)
- Ícones destacados

**Exemplo:**
```javascript
// Salvar cor primária do tema claro
await handleSaveSetting("primaryColorLight", "#10AA62");
colorMode.setPrimaryColorLight("#10AA62");
```

#### 1.2 Cor Primária Modo Escuro

**Campo:** `primaryColorDark`
**Label:** "Cor Primária Modo Escuro"
**Tipo:** Color Picker (Hex Color)
**Padrão:** `#39ACE7`

**Aplicação:**
- Cor principal do tema escuro
- Mesmas aplicações do tema claro, mas no modo dark

**Exemplo:**
```javascript
await handleSaveSetting("primaryColorDark", "#39ACE7");
colorMode.setPrimaryColorDark("#39ACE7");
```

---

### 2. Nome do Sistema

**Campo:** `appName`
**Label:** "Nome do sistema"
**Tipo:** TextField
**Padrão:** `"ChatIA"` ou `"Multi100"`

**Aplicação:**
- Título da página (document.title)
- Cabeçalhos da aplicação
- Notificações
- E-mails do sistema
- Rodapés

**Exemplo:**
```javascript
await handleSaveSetting("appName", "MeuWhatsApp");
colorMode.setAppName("MeuWhatsApp");
```

---

### 3. Logos

#### 3.1 Logo Tema Claro

**Campo:** `appLogoLight`
**Label:** "Logotipo claro"
**Tipo:** File Upload (Image)
**Formatos:** PNG, JPG, SVG
**Tamanho Recomendado:** Altura máxima 72px
**Padrão:** `/logo-light.png`

**Aplicação:**
- Sidebar quando tema claro está ativo
- Tela de login (tema claro)
- E-mails (se tema claro)

**Upload Endpoint:**
```javascript
POST /settings-whitelabel/logo
Content-Type: multipart/form-data

FormData:
  - typeArch: "logo"
  - mode: "Light"
  - file: File
```

#### 3.2 Logo Tema Escuro

**Campo:** `appLogoDark`
**Label:** "Logotipo escuro"
**Tipo:** File Upload (Image)
**Formatos:** PNG, JPG, SVG
**Tamanho Recomendado:** Altura máxima 72px
**Padrão:** `/logo-dark.png`

**Aplicação:**
- Sidebar quando tema escuro está ativo
- Tela de login (tema escuro)

**Fallback Inteligente:**
```javascript
// Se logo dark não definido, usa logo light
calculatedLogoDark: () => {
  if (appLogoDark === defaultLogoDark && appLogoLight !== defaultLogoLight) {
    return appLogoLight; // Usa logo light
  }
  return appLogoDark;
}

// Se logo light não definido, usa logo dark
calculatedLogoLight: () => {
  if (appLogoDark !== defaultLogoDark && appLogoLight === defaultLogoLight) {
    return appLogoDark; // Usa logo dark
  }
  return appLogoLight;
}
```

#### 3.3 Favicon

**Campo:** `appLogoFavicon`
**Label:** "Favicon"
**Tipo:** File Upload (Image)
**Formatos:** PNG, ICO
**Tamanho Recomendado:** 32x32px ou 64x64px
**Padrão:** `/favicon.png`

**Aplicação:**
- Ícone da aba do navegador
- Ícone ao salvar nos favoritos
- Ícone em PWA instalado

**Implementação com react-favicon:**
```javascript
import Favicon from "react-favicon";

<Favicon url={
  appLogoFavicon
    ? getBackendUrl() + "/public/" + appLogoFavicon
    : defaultLogoFavicon
} />
```

---

## Arquitetura do Sistema

### 1. Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────┐
│                     INICIALIZAÇÃO (App.js)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Carregar do LocalStorage (fallback inicial)             │
│     - primaryColorLight: localStorage.getItem()             │
│     - primaryColorDark: localStorage.getItem()              │
│     - appName: localStorage.getItem()                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Buscar do Backend (valores definitivos)                 │
│     - getPublicSetting("primaryColorLight")                 │
│     - getPublicSetting("primaryColorDark")                  │
│     - getPublicSetting("appLogoLight")                      │
│     - getPublicSetting("appLogoDark")                       │
│     - getPublicSetting("appLogoFavicon")                    │
│     - getPublicSetting("appName")                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Atualizar Estados do App                                │
│     - setPrimaryColorLight(color)                           │
│     - setPrimaryColorDark(color)                            │
│     - setAppLogoLight(url)                                  │
│     - setAppLogoDark(url)                                   │
│     - setAppLogoFavicon(url)                                │
│     - setAppName(name)                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Criar Tema Material-UI                                  │
│     theme = createTheme({                                   │
│       palette: {                                            │
│         primary: { main: mode === "light"                   │
│           ? primaryColorLight : primaryColorDark }          │
│       },                                                    │
│       appLogoLight, appLogoDark, appLogoFavicon, appName    │
│     })                                                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Prover Contexto para Aplicação                         │
│     <ColorModeContext.Provider value={{ colorMode }}>      │
│       <ThemeProvider theme={theme}>                         │
│         <Routes />                                          │
│       </ThemeProvider>                                      │
│     </ColorModeContext.Provider>                            │
└─────────────────────────────────────────────────────────────┘
```

### 2. Fluxo de Atualização

```
┌─────────────────────────────────────────────────────────────┐
│         USUÁRIO ALTERA CONFIGURAÇÃO (Settings)              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Componente Whitelabel captura mudança                   │
│     - Upload de logo (FormData)                             │
│     - Seleção de cor (ColorBoxModal)                        │
│     - Alteração de nome (TextField onBlur)                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. Salvar no Backend                                       │
│     await update({ key, value })                            │
│     ou                                                      │
│     await api.post("/settings-whitelabel/logo", formData)   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Atualizar LocalStorage (cores e nome)                   │
│     localStorage.setItem(key, value)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  4. Atualizar Contexto (aplicação imediata)                 │
│     colorMode.setPrimaryColorLight(color)                   │
│     colorMode.setAppLogoLight(url)                          │
│     colorMode.setAppName(name)                              │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  5. Tema React Recalculado Automaticamente                  │
│     (useMemo recria theme com novos valores)                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  6. UI Atualizada Instantaneamente                          │
│     (ThemeProvider propaga mudanças para todos componentes) │
└─────────────────────────────────────────────────────────────┘
```

---

## ColorModeContext

### Estrutura do Contexto

**Arquivo:** `/frontend/src/layout/themeContext.js`

```javascript
const ColorModeContext = React.createContext({
  toggleColorMode: () => { },
  setPrimaryColorLight: (_) => { },
  setPrimaryColorDark: (_) => { },
  setAppLogoLight: (_) => { },
  setAppLogoDark: (_) => { },
  setAppLogoFavicon: (_) => { },
});
```

### Implementação no App.js

```javascript
const colorMode = useMemo(
  () => ({
    toggleColorMode: () => {
      setMode((prevMode) => {
        const newMode = prevMode === "light" ? "dark" : "light";
        window.localStorage.setItem("preferredTheme", newMode);
        return newMode;
      });
    },
    setPrimaryColorLight,
    setPrimaryColorDark,
    setAppLogoLight,
    setAppLogoDark,
    setAppLogoFavicon,
    setAppName,
    appLogoLight,
    appLogoDark,
    appLogoFavicon,
    appName,
    mode,
  }),
  [appLogoLight, appLogoDark, appLogoFavicon, appName, mode]
);
```

### Uso do Contexto

```javascript
import { useContext } from "react";
import ColorModeContext from "../../layout/themeContext";

function MeuComponente() {
  const { colorMode } = useContext(ColorModeContext);

  const handleChangeColor = () => {
    colorMode.setPrimaryColorLight("#FF0000");
  };

  const handleChangeLogo = () => {
    colorMode.setAppLogoLight("/meu-logo.png");
  };

  const handleToggleTheme = () => {
    colorMode.toggleColorMode(); // Alterna entre claro/escuro
  };

  return (
    <div>
      <p>Modo atual: {colorMode.mode}</p>
      <p>Nome do app: {colorMode.appName}</p>
      <img src={colorMode.appLogoLight} alt="Logo" />
    </div>
  );
}
```

---

## Tema Material-UI

### Configuração do Tema

**Arquivo:** `/frontend/src/App.js:62-121`

```javascript
const theme = useMemo(
  () =>
    createTheme(
      {
        // Estilos de scrollbar customizados
        scrollbarStyles: {
          "&::-webkit-scrollbar": {
            width: "8px",
            height: "8px",
          },
          "&::-webkit-scrollbar-thumb": {
            boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
            backgroundColor: mode === "light" ? primaryColorLight : primaryColorDark,
          },
        },

        // Paleta de cores
        palette: {
          type: mode, // "light" ou "dark"
          primary: {
            main: mode === "light" ? primaryColorLight : primaryColorDark
          },
          textPrimary: mode === "light" ? primaryColorLight : primaryColorDark,
          borderPrimary: mode === "light" ? primaryColorLight : primaryColorDark,
          dark: { main: mode === "light" ? "#333333" : "#F3F3F3" },
          light: { main: mode === "light" ? "#F3F3F3" : "#333333" },
          fontColor: mode === "light" ? primaryColorLight : primaryColorDark,
          tabHeaderBackground: mode === "light" ? "#EEE" : "#666",
          optionsBackground: mode === "light" ? "#fafafa" : "#333",
          fancyBackground: mode === "light" ? "#fafafa" : "#333",
          total: mode === "light" ? "#fff" : "#222",
          messageIcons: mode === "light" ? "grey" : "#F3F3F3",
          inputBackground: mode === "light" ? "#FFFFFF" : "#333",
          barraSuperior: mode === "light" ? primaryColorLight : "#666",
        },

        // Dados adicionais
        mode,
        appLogoLight,
        appLogoDark,
        appLogoFavicon,
        appName,

        // Funções calculadas para fallback inteligente de logos
        calculatedLogoDark: () => {
          if (appLogoDark === defaultLogoDark && appLogoLight !== defaultLogoLight) {
            return appLogoLight;
          }
          return appLogoDark;
        },
        calculatedLogoLight: () => {
          if (appLogoDark !== defaultLogoDark && appLogoLight === defaultLogoLight) {
            return appLogoDark;
          }
          return appLogoLight;
        },
      },
      locale // ptBR para traduções do Material-UI
    ),
  [appLogoLight, appLogoDark, appLogoFavicon, appName, locale, mode, primaryColorDark, primaryColorLight]
);
```

### Acessando Propriedades do Tema

```javascript
import { useTheme } from "@material-ui/core/styles";

function MeuComponente() {
  const theme = useTheme();

  return (
    <div>
      {/* Cores da paleta */}
      <div style={{ color: theme.palette.primary.main }}>
        Texto com cor primária
      </div>

      {/* Logos */}
      <img
        src={theme.mode === "light"
          ? theme.calculatedLogoLight()
          : theme.calculatedLogoDark()
        }
        alt="Logo"
      />

      {/* Nome do app */}
      <h1>{theme.appName}</h1>

      {/* Favicon */}
      <link rel="icon" href={theme.appLogoFavicon} />

      {/* Scrollbar customizado */}
      <div style={theme.scrollbarStyles}>
        Conteúdo com scrollbar customizado
      </div>
    </div>
  );
}
```

### CSS Custom Properties

```javascript
// App.js:231-234 - Atualiza CSS variables
useEffect(() => {
  const root = document.documentElement;
  root.style.setProperty(
    "--primaryColor",
    mode === "light" ? primaryColorLight : primaryColorDark
  );
}, [primaryColorLight, primaryColorDark, mode]);
```

**Uso em CSS:**
```css
.meu-elemento {
  color: var(--primaryColor);
  border-color: var(--primaryColor);
}
```

---

## ColorBoxModal - Seleção de Cores

### Componente

**Arquivo:** `/frontend/src/components/ColorBoxModal/index.js` (57 linhas)

```javascript
import { ColorBox } from "material-ui-color";

const ColorBoxModal = ({ onChange, currentColor, handleClose, open }) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);

  const handleOk = () => {
    onChange(selectedColor); // Retorna objeto { hex: "FF0000" }
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Selecionar Cor</DialogTitle>
      <DialogContent>
        <ColorBox
          disableAlpha={true}
          hslGradient={false}
          value={selectedColor}
          onChange={setSelectedColor}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancelar</Button>
        <Button onClick={handleOk} variant="contained" color="primary">
          OK
        </Button>
      </DialogActions>
    </Dialog>
  );
};
```

### Uso

```javascript
const [modalOpen, setModalOpen] = useState(false);
const [currentColor, setCurrentColor] = useState("#0000FF");

<TextField
  label="Cor Primária"
  value={currentColor}
  onClick={() => setModalOpen(true)}
  InputProps={{
    startAdornment: (
      <div style={{
        backgroundColor: currentColor,
        width: 20,
        height: 20
      }} />
    ),
    endAdornment: (
      <IconButton onClick={() => setModalOpen(true)}>
        <Colorize />
      </IconButton>
    ),
  }}
/>

<ColorBoxModal
  open={modalOpen}
  handleClose={() => setModalOpen(false)}
  onChange={(color) => {
    setCurrentColor(`#${color.hex}`);
    handleSaveSetting("primaryColorLight", `#${color.hex}`);
  }}
  currentColor={currentColor}
/>
```

---

## Página de Configurações

### SettingsCustom

**Arquivo:** `/frontend/src/pages/SettingsCustom/index.js` (235 linhas)

**Tabs Disponíveis:**
1. **Options** - Configurações gerais (todos)
2. **Schedules** - Horários de atendimento (se habilitado)
3. **Timezone** - Fuso horário (todos)
4. **Companies** - Gerenciar empresas (super user)
5. **Plans** - Gerenciar planos (super user)
6. **Helps** - Gerenciar ajudas (super user)
7. **Whitelabel** - Personalização (super user) ⭐

**Controle de Acesso:**
```javascript
{isSuper() ? (
  <Tab
    label={i18n.t("settings.tabs.whitelabel")}
    value={"whitelabel"}
  />
) : null}

<TabPanel value={tab} name={"whitelabel"}>
  <Whitelabel settings={oldSettings} />
</TabPanel>
```

### Componente Whitelabel

**Estrutura:**
```javascript
export default function Whitelabel({ settings }) {
  const [settingsLoaded, setSettingsLoaded] = useState({});
  const [appName, setAppName] = useState("");
  const { update } = useSettings();

  // Carrega settings ao montar
  useEffect(() => {
    if (Array.isArray(settings) && settings.length) {
      const primaryColorLight = settings.find(s => s.key === "primaryColorLight")?.value;
      const primaryColorDark = settings.find(s => s.key === "primaryColorDark")?.value;
      const appLogoLight = settings.find(s => s.key === "appLogoLight")?.value;
      const appLogoDark = settings.find(s => s.key === "appLogoDark")?.value;
      const appLogoFavicon = settings.find(s => s.key === "appLogoFavicon")?.value;
      const appName = settings.find(s => s.key === "appName")?.value;

      setAppName(appName || "");
      setSettingsLoaded({
        primaryColorLight, primaryColorDark,
        appLogoLight, appLogoDark, appLogoFavicon, appName
      });
    }
  }, [settings]);

  // Salva setting no backend
  async function handleSaveSetting(key, value) {
    await update({ key, value });
    updateSettingsLoaded(key, value);
    toast.success("Configuração atualizada com sucesso");
  }

  // Upload de logo
  const uploadLogo = async (e, mode) => {
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append("typeArch", "logo");
    formData.append("mode", mode); // "Light", "Dark", "Favicon"
    formData.append("file", file);

    const response = await api.post("/settings-whitelabel/logo", formData);
    updateSettingsLoaded(`appLogo${mode}`, response.data);
    colorMode[`setAppLogo${mode}`](getBackendUrl() + "/public/" + response.data);
  };

  return (
    <Grid container spacing={3}>
      {/* Campo de cor primária claro */}
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Cor Primária Modo Claro"
          value={settingsLoaded.primaryColorLight || ""}
          onClick={() => setPrimaryColorLightModalOpen(true)}
          InputProps={{
            startAdornment: (
              <div style={{
                backgroundColor: settingsLoaded.primaryColorLight,
                width: 20,
                height: 20
              }} />
            ),
            endAdornment: (
              <IconButton onClick={() => setPrimaryColorLightModalOpen(true)}>
                <Colorize />
              </IconButton>
            ),
          }}
        />
        <ColorBoxModal
          open={primaryColorLightModalOpen}
          handleClose={() => setPrimaryColorLightModalOpen(false)}
          onChange={(color) => {
            handleSaveSetting("primaryColorLight", `#${color.hex}`);
            colorMode.setPrimaryColorLight(`#${color.hex}`);
          }}
          currentColor={settingsLoaded.primaryColorLight}
        />
      </Grid>

      {/* Campo de nome do sistema */}
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Nome do sistema"
          value={appName}
          onChange={(e) => setAppName(e.target.value)}
          onBlur={async () => {
            await handleSaveSetting("appName", appName);
            colorMode.setAppName(appName || "Multi100");
          }}
        />
      </Grid>

      {/* Upload de logo claro */}
      <Grid item xs={12} sm={6} md={4}>
        <TextField
          label="Logotipo claro"
          value={settingsLoaded.appLogoLight || ""}
          InputProps={{
            endAdornment: (
              <>
                {settingsLoaded.appLogoLight && (
                  <IconButton onClick={() => {
                    handleSaveSetting("appLogoLight", "");
                    colorMode.setAppLogoLight(defaultLogoLight);
                  }}>
                    <Delete />
                  </IconButton>
                )}
                <input
                  type="file"
                  ref={logoLightInput}
                  style={{ display: "none" }}
                  onChange={(e) => uploadLogo(e, "Light")}
                />
                <IconButton onClick={() => logoLightInput.current.click()}>
                  <AttachFile />
                </IconButton>
              </>
            ),
          }}
        />
      </Grid>

      {/* Previews dos logos */}
      <Grid item xs={12} sm={6} md={4}>
        <div style={{
          backgroundColor: "white",
          padding: 10,
          border: "1px solid #424242"
        }}>
          <img
            src={theme.calculatedLogoLight()}
            alt="Preview logo claro"
            style={{ width: "100%", maxHeight: 72 }}
          />
        </div>
      </Grid>
    </Grid>
  );
}
```

---

## API Endpoints

### 1. Obter Setting Público

```http
GET /settings/:key
```

**Exemplo:**
```javascript
const color = await getPublicSetting("primaryColorLight");
// Retorna: "#0000FF"
```

### 2. Salvar Setting

```http
POST /settings
Content-Type: application/json

{
  "key": "primaryColorLight",
  "value": "#FF0000"
}
```

**Exemplo:**
```javascript
await update({
  key: "primaryColorLight",
  value: "#FF0000"
});
```

### 3. Upload de Logo

```http
POST /settings-whitelabel/logo
Content-Type: multipart/form-data

FormData:
  - typeArch: "logo"
  - mode: "Light" | "Dark" | "Favicon"
  - file: File (PNG, JPG, SVG)
```

**Resposta:**
```javascript
// Retorna nome do arquivo salvo
"logo-light-1234567890.png"
```

**Exemplo:**
```javascript
const uploadLogo = async (file, mode) => {
  const formData = new FormData();
  formData.append("typeArch", "logo");
  formData.append("mode", mode); // "Light", "Dark", "Favicon"
  formData.append("file", file);

  const response = await api.post("/settings-whitelabel/logo", formData, {
    onUploadProgress: (event) => {
      const progress = Math.round((event.loaded * 100) / event.total);
      console.log(`Upload progress: ${progress}%`);
    },
  });

  const filename = response.data;
  const fullUrl = getBackendUrl() + "/public/" + filename;

  return fullUrl;
};
```

---

## LocalStorage

### Persistência de Configurações

**Chaves Salvas:**
```javascript
localStorage.setItem("primaryColorLight", "#0000FF");
localStorage.setItem("primaryColorDark", "#39ACE7");
localStorage.setItem("appName", "MeuWhatsApp");
```

**Leitura Inicial:**
```javascript
// App.js:23-24
const appColorLocalStorage = localStorage.getItem("primaryColorLight")
  || localStorage.getItem("primaryColorDark")
  || "#065183";
const appNameLocalStorage = localStorage.getItem("appName") || "";
```

**Finalidade:**
- Carregamento instantâneo (antes do backend responder)
- Fallback se backend falhar
- Evita "flash" de cores padrão

---

## Permissões

### OnlyForSuperUser

**Componente:** `/frontend/src/components/OnlyForSuperUser`

```javascript
<OnlyForSuperUser
  user={currentUser}
  yes={() => (
    <>
      {/* Conteúdo para super users */}
      <Whitelabel settings={oldSettings} />
    </>
  )}
  no={() => (
    <>
      {/* Conteúdo para usuários comuns (opcional) */}
    </>
  )}
/>
```

**Verificação:**
```javascript
const isSuper = () => {
  return currentUser.super === true;
};
```

**Tab Whitelabel:**
```javascript
{isSuper() ? (
  <Tab
    label={i18n.t("settings.tabs.whitelabel")}
    value={"whitelabel"}
  />
) : null}
```

---

## Exemplos Práticos

### 1. Configuração Completa de Whitelabel

```javascript
// Cenário: Criar whitelabel para cliente "AcmeCorp"

// 1. Definir cores da marca
await handleSaveSetting("primaryColorLight", "#FF6B00"); // Laranja
await handleSaveSetting("primaryColorDark", "#FF8C00");  // Laranja escuro

// 2. Definir nome
await handleSaveSetting("appName", "AcmeCorp Chat");

// 3. Upload logos
const logoLight = await uploadLogo(logoLightFile, "Light");
const logoDark = await uploadLogo(logoDarkFile, "Dark");
const favicon = await uploadLogo(faviconFile, "Favicon");

// 4. Atualizar contexto (aplicação imediata)
colorMode.setPrimaryColorLight("#FF6B00");
colorMode.setPrimaryColorDark("#FF8C00");
colorMode.setAppName("AcmeCorp Chat");
colorMode.setAppLogoLight(logoLight);
colorMode.setAppLogoDark(logoDark);
colorMode.setAppLogoFavicon(favicon);

// 5. LocalStorage atualizado automaticamente
console.log(localStorage.getItem("primaryColorLight")); // "#FF6B00"
console.log(localStorage.getItem("appName")); // "AcmeCorp Chat"
```

### 2. Componente que Usa Tema Whitelabel

```javascript
import { useTheme } from "@material-ui/core/styles";
import { useContext } from "react";
import ColorModeContext from "../../layout/themeContext";

function BrandedHeader() {
  const theme = useTheme();
  const { colorMode } = useContext(ColorModeContext);

  return (
    <AppBar style={{ backgroundColor: theme.palette.primary.main }}>
      <Toolbar>
        {/* Logo adaptado ao tema */}
        <img
          src={theme.mode === "light"
            ? theme.calculatedLogoLight()
            : theme.calculatedLogoDark()
          }
          alt={theme.appName}
          style={{ height: 40, marginRight: 16 }}
        />

        {/* Nome do sistema */}
        <Typography variant="h6">
          {theme.appName}
        </Typography>

        {/* Botão de tema */}
        <IconButton onClick={colorMode.toggleColorMode} color="inherit">
          {theme.mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>
      </Toolbar>
    </AppBar>
  );
}
```

### 3. Preview de Logo com Fallback

```javascript
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  logoPreviewLight: {
    backgroundColor: "white",
    padding: 10,
    border: "1px solid #424242",
    textAlign: "center",
  },
  logoPreviewDark: {
    backgroundColor: "#424242",
    padding: 10,
    border: "1px solid white",
    textAlign: "center",
  },
  logoImg: {
    width: "100%",
    maxHeight: 72,
    content: `url(${theme.calculatedLogoLight()})`, // Usa função do tema
  },
}));

function LogoPreview() {
  const classes = useStyles();

  return (
    <Grid container spacing={2}>
      <Grid item xs={6}>
        <div className={classes.logoPreviewLight}>
          <img
            className={classes.logoImg}
            alt="Logo Light Preview"
          />
        </div>
      </Grid>
      <Grid item xs={6}>
        <div className={classes.logoPreviewDark}>
          <img
            src={theme.calculatedLogoDark()}
            alt="Logo Dark Preview"
            style={{ width: "100%", maxHeight: 72 }}
          />
        </div>
      </Grid>
    </Grid>
  );
}
```

### 4. Validação de Arquivo de Upload

```javascript
const validateLogoFile = (file) => {
  // Validar tipo
  const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
  if (!validTypes.includes(file.type)) {
    toast.error("Formato inválido. Use PNG, JPG ou SVG.");
    return false;
  }

  // Validar tamanho (máximo 2MB)
  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    toast.error("Arquivo muito grande. Máximo 2MB.");
    return false;
  }

  return true;
};

const handleLogoUpload = async (e, mode) => {
  const file = e.target.files[0];

  if (!file) return;

  if (!validateLogoFile(file)) return;

  try {
    const url = await uploadLogo(file, mode);
    toast.success(`Logo ${mode} atualizado com sucesso!`);
  } catch (error) {
    toast.error("Erro ao fazer upload do logo");
    console.error(error);
  }
};
```

### 5. Reset para Padrão

```javascript
const resetToDefaults = async () => {
  // Resetar cores
  await handleSaveSetting("primaryColorLight", "#0000FF");
  await handleSaveSetting("primaryColorDark", "#39ACE7");
  colorMode.setPrimaryColorLight("#0000FF");
  colorMode.setPrimaryColorDark("#39ACE7");

  // Resetar nome
  await handleSaveSetting("appName", "ChatIA");
  colorMode.setAppName("ChatIA");

  // Resetar logos (remover customizações)
  await handleSaveSetting("appLogoLight", "");
  await handleSaveSetting("appLogoDark", "");
  await handleSaveSetting("appLogoFavicon", "");
  colorMode.setAppLogoLight("/logo-light.png");
  colorMode.setAppLogoDark("/logo-dark.png");
  colorMode.setAppLogoFavicon("/favicon.png");

  // Limpar localStorage
  localStorage.removeItem("primaryColorLight");
  localStorage.removeItem("primaryColorDark");
  localStorage.removeItem("appName");

  toast.success("Configurações resetadas para o padrão");
};
```

---

## Internacionalização

### Traduções Disponíveis

**Português (pt):**
```javascript
settings: {
  tabs: {
    whitelabel: "Whitelabel",
  },
  whitelabel: {
    primaryColorLight: "Cor Primária Modo Claro",
    primaryColorDark: "Cor Primária Modo Escuro",
    systemName: "Nome do sistema",
    lightLogo: "Logotipo claro",
    darkLogo: "Logotipo escuro",
    favicon: "Favicon",
  },
}
```

**Inglês (en):**
```javascript
settings: {
  tabs: {
    whitelabel: "Whitelabel",
  },
  whitelabel: {
    primaryColorLight: "Primary Color Light Mode",
    primaryColorDark: "Primary Color Dark Mode",
    systemName: "System Name",
    lightLogo: "Light Logo",
    darkLogo: "Dark Logo",
    favicon: "Favicon",
  },
}
```

**Uso:**
```javascript
import { i18n } from "../../translate/i18n";

<TextField
  label={i18n.t("settings.whitelabel.primaryColorLight")}
/>
```

---

## Troubleshooting

### 1. Cores não Aplicam Imediatamente

**Problema:** Após salvar cor, tema não atualiza.

**Solução:**
```javascript
// Certifique-se de chamar ambos:
await handleSaveSetting("primaryColorLight", color);
colorMode.setPrimaryColorLight(color); // ← Necessário para atualização imediata
```

### 2. Logo não Carrega Após Upload

**Problema:** Logo salvo mas não aparece na UI.

**Causa:** URL do backend não configurada corretamente.

**Solução:**
```javascript
// Verificar getBackendUrl()
import { getBackendUrl } from "../../config";

const fullUrl = getBackendUrl() + "/public/" + response.data;
console.log("Logo URL:", fullUrl); // Deve ser URL completa
```

### 3. LocalStorage Não Sincroniza

**Problema:** Valores no localStorage diferentes do backend.

**Solução:**
```javascript
// Garantir que updateSettingsLoaded salva no localStorage
function updateSettingsLoaded(key, value) {
  if (key === 'primaryColorLight' || key === 'primaryColorDark' || key === 'appName') {
    localStorage.setItem(key, value); // ← Crucial
  }
  setSettingsLoaded({ ...settingsLoaded, [key]: value });
}
```

### 4. Theme Não Recalcula

**Problema:** Mudanças no logo não refletem em componentes.

**Causa:** useMemo não detecta mudança.

**Solução:**
```javascript
// Certifique-se que o useMemo tem dependências corretas
const theme = useMemo(
  () => createTheme({ ... }),
  [appLogoLight, appLogoDark, appLogoFavicon, appName, mode, primaryColorLight, primaryColorDark]
  // ↑ Todas as variáveis que afetam o tema devem estar aqui
);
```

### 5. Preview de Logo Não Atualiza

**Problema:** Preview mostra logo antigo após upload.

**Solução:**
```javascript
// Usar funções calculadas do tema no makeStyles
const useStyles = makeStyles((theme) => ({
  logoImg: {
    width: "100%",
    maxHeight: 72,
    content: "url(" + theme.calculatedLogoLight() + ")" // ← Usa função
  }
}));

// Ou recarregar componente
const [key, setKey] = useState(0);
<img key={key} src={theme.calculatedLogoLight()} />
setKey(k => k + 1); // Força rerender
```

---

## Checklist de Implementação

### Para Implementar Whitelabel Completo

- [ ] **1. Backend:**
  - [ ] Endpoint GET `/settings/:key` retorna settings públicos
  - [ ] Endpoint POST `/settings` salva settings (autenticado)
  - [ ] Endpoint POST `/settings-whitelabel/logo` aceita upload de imagens
  - [ ] Diretório `/public/` serve arquivos estáticos
  - [ ] Database tem tabela `Settings` com colunas `key`, `value`

- [ ] **2. Frontend - Inicialização:**
  - [ ] App.js carrega settings do localStorage (fallback)
  - [ ] App.js busca settings do backend ao montar
  - [ ] App.js atualiza estados (cores, logos, nome)
  - [ ] Tema Material-UI recebe valores customizados
  - [ ] ColorModeContext provê métodos setters

- [ ] **3. Frontend - UI:**
  - [ ] Página SettingsCustom tem tab "Whitelabel"
  - [ ] Tab só aparece para super users
  - [ ] Componente Whitelabel renderiza 6 campos
  - [ ] ColorBoxModal funcional para seleção de cores
  - [ ] Upload de arquivos com validação
  - [ ] Previews de logos funcionam

- [ ] **4. Frontend - Persistência:**
  - [ ] LocalStorage salva cores e nome
  - [ ] Backend salva todas as 6 configurações
  - [ ] Contexto atualiza imediatamente após salvar
  - [ ] Tema recalcula quando valores mudam

- [ ] **5. Frontend - Aplicação:**
  - [ ] Cores aplicadas em toda a UI (botões, links, scrollbar)
  - [ ] Logo correto exibido no sidebar (light/dark)
  - [ ] Logo correto na tela de login
  - [ ] Favicon atualizado
  - [ ] Nome do app no document.title
  - [ ] Nome do app em notificações

- [ ] **6. Testes:**
  - [ ] Upload de logo light funciona
  - [ ] Upload de logo dark funciona
  - [ ] Upload de favicon funciona
  - [ ] Alteração de cor light aplica imediatamente
  - [ ] Alteração de cor dark aplica imediatamente
  - [ ] Alteração de nome aplica imediatamente
  - [ ] Fallback de logo funciona (se só um definido)
  - [ ] Reset para padrão funciona
  - [ ] Recarregar página mantém customizações
  - [ ] Funciona em tema claro e escuro

- [ ] **7. Documentação:**
  - [ ] Documentar processo de customização para clientes
  - [ ] Screenshots de cada etapa
  - [ ] Requisitos de logos (tamanho, formato)
  - [ ] Paleta de cores recomendada

---

## Métricas

### Tamanhos de Arquivo

- **Whitelabel.js:** 517 linhas (~18 KB)
- **ColorBoxModal.js:** 57 linhas (~2 KB)
- **SettingsCustom.js:** 235 linhas (~8 KB)
- **App.js (seção de whitelabel):** ~150 linhas (~5 KB)

### Configurações

- **Total de campos:** 6 (2 cores, 1 nome, 3 logos)
- **Idiomas suportados:** 5 (pt, en, es, tr, ar)
- **Formatos de imagem aceitos:** PNG, JPG, SVG
- **Tamanho máximo de logo:** ~2 MB

### Performance

- **Carregamento inicial:** < 500ms (com localStorage)
- **Carregamento do backend:** ~1s
- **Upload de logo:** ~2-5s (dependendo da conexão)
- **Aplicação de cor:** Instantânea
- **Recálculo de tema:** < 100ms

---

## Melhorias Futuras

### 1. Paleta de Cores Completa

```javascript
// Permitir customizar mais cores além da primária
settings.whitelabel = {
  primaryColor: "#0000FF",
  secondaryColor: "#FF0000",
  successColor: "#00FF00",
  errorColor: "#FF0000",
  warningColor: "#FFA500",
  backgroundColor: "#FFFFFF",
  textColor: "#000000",
};
```

### 2. Fontes Customizadas

```javascript
// Upload de arquivos de fonte
<TextField label="Fonte Principal" />
<input type="file" accept=".woff,.woff2,.ttf" />

// Aplicação
@font-face {
  font-family: 'CustomFont';
  src: url('/public/custom-font.woff2');
}

theme.typography.fontFamily = 'CustomFont, Arial, sans-serif';
```

### 3. CSS Customizado

```javascript
// Campo para CSS adicional
<TextField
  label="CSS Customizado"
  multiline
  rows={10}
  value={customCSS}
  onChange={(e) => setCustomCSS(e.target.value)}
/>

// Injeção
<style dangerouslySetInnerHTML={{ __html: customCSS }} />
```

### 4. Presets de Temas

```javascript
const presets = {
  ocean: {
    primaryColorLight: "#006994",
    primaryColorDark: "#1E90FF",
    name: "Ocean"
  },
  forest: {
    primaryColorLight: "#228B22",
    primaryColorDark: "#32CD32",
    name: "Forest"
  },
  sunset: {
    primaryColorLight: "#FF4500",
    primaryColorDark: "#FF6347",
    name: "Sunset"
  }
};

<Select label="Preset de Tema" onChange={applyPreset}>
  {Object.entries(presets).map(([key, preset]) => (
    <MenuItem value={key}>{preset.name}</MenuItem>
  ))}
</Select>
```

### 5. Exportar/Importar Configurações

```javascript
// Exportar
const exportWhitelabel = () => {
  const config = {
    primaryColorLight,
    primaryColorDark,
    appName,
    appLogoLight,
    appLogoDark,
    appLogoFavicon,
  };

  const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'whitelabel-config.json';
  a.click();
};

// Importar
const importWhitelabel = async (file) => {
  const text = await file.text();
  const config = JSON.parse(text);

  for (const [key, value] of Object.entries(config)) {
    await handleSaveSetting(key, value);
  }

  toast.success("Configurações importadas com sucesso!");
};
```

### 6. Preview em Tempo Real

```javascript
// Iframe com preview da aplicação
<Grid item xs={12}>
  <Paper>
    <Typography variant="h6">Preview</Typography>
    <iframe
      src="/preview?theme=custom"
      style={{ width: "100%", height: 600, border: "none" }}
    />
  </Paper>
</Grid>
```

---

## Referências

- [Material-UI Theming](https://v4.mui.com/customization/theming/)
- [React Context API](https://react.dev/reference/react/useContext)
- [material-ui-color (ColorBox)](https://www.npmjs.com/package/material-ui-color)
- [react-favicon](https://www.npmjs.com/package/react-favicon)

---

**Status:** Sistema whitelabel completo e funcional. Personalização disponível apenas para super users através da página Settings > Whitelabel.
