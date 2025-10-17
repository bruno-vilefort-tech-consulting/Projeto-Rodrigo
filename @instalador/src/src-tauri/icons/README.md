# Ícones do Tauri

Este diretório deve conter os ícones da aplicação em diferentes formatos e tamanhos.

## Arquivos Necessários

```
icons/
├── 32x32.png          # PNG 32x32 (Linux)
├── 128x128.png        # PNG 128x128 (Linux)
├── 128x128@2x.png     # PNG 256x256 (Linux HiDPI)
├── icon.icns          # macOS icon bundle
└── icon.ico           # Windows icon bundle
```

## Como Gerar os Ícones

### Opção 1: Usar a CLI do Tauri (Recomendado)

Se você já tem um PNG de alta resolução (pelo menos 512x512):

```bash
# Instalar Tauri CLI (se ainda não tiver)
npm install --save-dev @tauri-apps/cli

# Gerar todos os ícones automaticamente
npm run tauri icon path/to/icon.png
```

O comando irá gerar automaticamente todos os tamanhos e formatos necessários.

### Opção 2: Manual

Crie um ícone PNG de 1024x1024 e use ferramentas online:

**Para .icns (macOS):**
- https://cloudconvert.com/png-to-icns

**Para .ico (Windows):**
- https://convertio.co/png-ico/

**Para PNGs redimensionados:**
```bash
# Usando ImageMagick
convert icon-1024.png -resize 32x32 32x32.png
convert icon-1024.png -resize 128x128 128x128.png
convert icon-1024.png -resize 256x256 128x128@2x.png
```

## Design do Ícone

Recomendações para o ícone do ChatIA Instalador:

- **Tema:** Ferramenta/Instalação
- **Cores:** Azul (#3b82f6) e cinza escuro (#0f1620) - tema dark
- **Elementos:** Símbolo de download, engrenagem ou caixa de ferramentas
- **Simplicidade:** Visível mesmo em 32x32
- **Contraste:** Bom contraste para tema dark e light

## Placeholder Temporário

Enquanto não houver ícones customizados, o Tauri usará ícones padrão. Para desenvolvimento, você pode usar qualquer PNG de 512x512 e gerar os ícones com:

```bash
npm run tauri icon placeholder.png
```

## Exemplo de Criação de Ícone Simples

Se você tem Node.js instalado, pode criar um ícone placeholder:

```bash
# Criar PNG simples com texto
npx @squoosh/cli --resize '{width:1024,height:1024}' -d icons/ placeholder.png

# Ou usar um gerador online:
# https://www.favicon-generator.org/
```

## Referências

- [Tauri Icon Guide](https://tauri.app/v1/guides/features/icons)
- [Icon Requirements](https://tauri.app/v1/api/config#tauri.bundle.icon)
