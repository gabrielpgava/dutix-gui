# Dutix GUI ⚡️ (macOS)

Uma interface gráfica nativa, moderna e modular para macOS construída com **Wails v2** (Go + React 18, TypeScript, TailwindCSS v4 e Lucide Icons), atuando como um wrapper completo para o binário CLI [`dutix`](https://github.com/jackchuka/dutix), sem alterar nenhuma linha do código-fonte original.

---

## 🌟 Funcionalidades Principais

### 1. Painel Geral & Troca Instantânea (Dashboard)
- Resumo de métricas em tempo real (Total de Aplicativos, Alvos Registrados, Conflitos de Sistema, Status do Binário).
- Botões de troca com 1 toque para os padrões mais frequentes do macOS:
  - **Navegador Padrão**: Google Chrome, Safari, etc.
  - **Editor de Código**: Visual Studio Code, TextEdit, etc.
  - **Leitor de Documentos**: Preview, Chrome PDF, Adobe Acrobat.

### 2. Catálogo Completo de Aplicativos (Apps Panel)
- Listagem de todos os apps instalados (`/Applications`, `/System/Applications`, `~/Applications`).
- Alternância entre visualização em **Grid** e **Tabela**.
- Filtro e busca em tempo real por nome, bundle ID ou path.
- **Gaveta de Detalhes do App (`dutix apps show`)**:
  - Exibição de Bundle ID, caminho do executável `.app`.
  - Extensões de arquivo suportadas com busca integrada.
  - Identificadores de Tipo Uniforme (UTIs) registrados.
  - Ações diretas: *Definir como Padrão* ou *Migrar deste App*.

### 3. Associação Rápida (Set Handlers)
- Seletor combobox com busca fuzzy de aplicativos.
- Extensões agrupadas por categorias com chips interativos:
  - **Código & Web Dev** (`.js`, `.ts`, `.json`, `.py`, `.go`, `.rs`, `.sql`, etc.)
  - **Documentos & Texto** (`.pdf`, `.txt`, `.md`, `.docx`, etc.)
  - **Imagens & Vetores** (`.png`, `.jpg`, `.svg`, `.webp`, `.psd`, etc.)
  - **Áudio & Vídeo** (`.mp4`, `.mkv`, `.mov`, `.mp3`, `.flac`, etc.)
  - **Arquivos & Compactados** (`.zip`, `.tar`, `.gz`, `.7z`, etc.)
  - **Esquemas de URL** (`http://`, `https://`, `mailto://`, etc.)
- Campo livre para adicionar qualquer extensão personalizada.
- **Simulação Prévia (`--dry-run`)**: visualização em tabela do que será alterado antes de aplicar.
- **Aplicação Segura (`--yes`)**: criação automática de snapshot de restauração antes de qualquer alteração em lote.

### 4. Migração de Aplicativos (App Migration)
- Interface visual de fluxo "Origem (De) → Destino (Para)".
- Presets rápidos de migração (ex: *TextEdit → VS Code*, *Safari → Chrome*, *QuickTime → VLC*).
- Análise de compatibilidade e simulação de migração (`dutix apps migrate ... --dry-run`).
- Detecção de avisos e tipos dinâmicos (dynamic UTIs).

### 5. Inspetor de Alvos (Targets Inspector) & Diagnóstico de Conflitos
- Consulta detalhada para qualquer extensão (ex: `.pdf`, `.json`), UTI ou URL scheme.
- Exibição de todos os aplicativos candidatos disponíveis com **troca rápida em 1 clique**.
- **Detector de Conflitos & Bundles Órfãos**: identifica associações apontando para bundles ou apps que foram deletados ou movidos, com botão para reparar/reatribuir.

### 6. Presets Rápidos & Dotfiles Setup
- Perfis prontos para configuração rápida de novos Macs:
  - *Web Developer Suite*
  - *Designer & Criativo*
  - *Mídia, Áudio & Vídeo*
  - *Apple Native Minimalist*
- Criador de presets personalizados.
- **Exportação e Importação de Presets em JSON** para sincronização com repositórios de dotfiles.

### 7. Snapshots & Rollback (Backup do Sistema)
- Snapshots gerados automaticamente antes de cada operação em lote ou migração.
- Criação de snapshots manuais sob demanda com descrição personalizada.
- **Rollback em 1 clique**: restaura integralmente o estado das associações registradas em qualquer ponto anterior.

### 8. Gestor do Binário Core & Atualizador Automático
- Detecção automática da localização do executável:
  1. `/usr/local/bin/dutix`
  2. `/opt/homebrew/bin/dutix`
  3. `~/.local/bin/dutix`
  4. `~/Library/Application Support/DutixGUI/bin/dutix`
  5. `$PATH`
- Verificação de novas releases na API oficial do GitHub (`jackchuka/dutix`).
- **Download & Instalação Automática**: baixa o `.tar.gz` específico para a arquitetura do Mac (`darwin_arm64` Apple Silicon ou `darwin_amd64` Intel), extrai, define permissão `chmod +x` e salva no Application Support com barra de progresso em tempo real.
- Opção para definir caminho customizado manualmente.

### 9. Console de Logs Embutido
- Drawer deslizante com histórico completo de todas as execuções CLI disparadas pelo backend.
- Exibição dos parâmetros exatos, tempo de resposta em milissegundos, código de saída e saída bruta (STDOUT / STDERR) com suporte a cópia rápida.

---

## 🛠️ Como Compilar e Executar

### Pré-requisitos
- macOS (Apple Silicon ou Intel)
- Go 1.22+
- Node.js 18+ e npm
- Wails CLI v2: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

### Comandos com Make

```bash
# Ver lista de comandos disponíveis
make help

# Instalar dependências (Go + Node)
make deps

# Executar em modo desenvolvimento com Hot-Reload
make dev

# Compilar para a arquitetura nativa atual
make build

# Compilar binário Universal para macOS (Apple Silicon + Intel)
make build-darwin-universal
# ou
make build-all

# Compilar especificamente para Apple Silicon (M1/M2/M3/M4)
make build-darwin-arm64

# Compilar especificamente para macOS Intel (x86_64)
make build-darwin-amd64

# Executar testes unitários do backend
make test

# Executar testes com relatório de cobertura
make test-coverage

# Limpar artefatos de build
make clean
```
