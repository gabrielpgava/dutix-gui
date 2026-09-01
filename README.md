# Dutix GUI ⚡️ (macOS)

<p align="center">
  <strong>Native, modern and modular graphical interface for managing macOS file associations and URL schemes.</strong><br>
  <em>Interface gráfica nativa, moderna e modular para gerenciar associações de arquivos e esquemas de URL no macOS.</em>
</p>

<p align="center">
  <a href="#english">English</a> •
  <a href="#português">Português</a> •
  <a href="https://github.com/jackchuka/dutix">dutix CLI</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Platform-macOS%20(Universal)-000000?style=flat-square&logo=apple&logoColor=white" alt="Platform: macOS" />
  <img src="https://img.shields.io/badge/Backend-Go%201.22+-00ADD8?style=flat-square&logo=go&logoColor=white" alt="Go Version" />
  <img src="https://img.shields.io/badge/Frontend-React%2018%20%7C%20TypeScript-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React + TS" />
  <img src="https://img.shields.io/badge/Styling-TailwindCSS%20v4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/Framework-Wails%20v2-DF1E54?style=flat-square" alt="Wails v2" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License: MIT" />
</p>

---

<a name="english"></a>
## 🇬🇧 English

**Dutix GUI** is a native, modern, and open-source desktop application for macOS built with **Wails v2** (Go backend + React 18, TypeScript, TailwindCSS v4, and Lucide Icons). It acts as a comprehensive, visual wrapper around the high-performance CLI utility [`dutix`](https://github.com/jackchuka/dutix), managing macOS LaunchServices associations (`LSSetDefaultHandlerForURLScheme` and `LSSetDefaultRoleHandlerForContentType`) with safety snapshots, visual app migration, dotfiles preset management, and zero modifications to the original CLI core.

---

### ✨ Key Features

#### 1. 📊 Dashboard & 1-Click Quick Switch
- Real-time system metrics: Total Installed Applications, Registered Target Handlers, Broken/Orphaned Associations, and CLI Binary Status.
- Instant 1-click toggles for common macOS default roles:
  - **Default Browser**: Google Chrome, Safari, Brave, Arc, Firefox, etc.
  - **Code Editor**: Visual Studio Code, Cursor, Zed, TextEdit, etc.
  - **Document Viewer**: Preview, Google Chrome PDF, Adobe Acrobat, etc.

#### 2. 📱 Full Application Catalog (Apps Panel)
- Fast indexing of all applications across `/Applications`, `/System/Applications`, and `~/Applications`.
- Switch between **Grid** and **Table** views with real-time search by app name, Bundle ID, or executable path.
- **Detailed App Inspector (`dutix apps show`)**:
  - Displays Bundle ID and `.app` filesystem location.
  - Interactive catalog of supported extensions and registered Uniform Type Identifiers (UTIs).
  - Quick action triggers: *Set as Default* or *Migrate from this App*.

#### 3. 🎯 Fast Handlers Assignment (Set Handlers)
- Combobox selector with fuzzy search across installed apps.
- Curated category chips for batch selection:
  - **Code & Web Dev** (`.js`, `.ts`, `.json`, `.py`, `.go`, `.rs`, `.sql`, etc.)
  - **Documents & Text** (`.pdf`, `.txt`, `.md`, `.docx`, etc.)
  - **Images & Vectors** (`.png`, `.jpg`, `.svg`, `.webp`, `.psd`, etc.)
  - **Audio & Video** (`.mp4`, `.mkv`, `.mov`, `.mp3`, `.flac`, etc.)
  - **Archives & Compressed** (`.zip`, `.tar`, `.gz`, `.7z`, etc.)
  - **URL Schemes** (`http://`, `https://`, `mailto://`, etc.)
- Custom extension input field for arbitrary extensions.
- **Dry-Run Preview (`--dry-run`)**: review changes in a comparative table before applying them.
- **Automated Safety Snapshot**: creates an automatic restore point before any batch changes are executed.

#### 4. 🔄 Visual App Migration (App Migration)
- Visual "Source (From) → Destination (To)" migration flow.
- 1-click migration presets (e.g., *TextEdit → VS Code*, *Safari → Chrome*, *QuickTime → VLC*).
- Pre-migration compatibility dry-run (`dutix apps migrate ... --dry-run`).
- Automatic detection of warnings and dynamic UTIs.

#### 5. 🔍 Targets Inspector & Conflict Diagnostic
- Deep inspection for any extension (e.g., `.pdf`, `.json`), UTI, or URL scheme.
- Lists all registered handler candidates with instant 1-click assignment.
- **Conflict & Orphan Detector**: automatically flags associations pointing to uninstalled or moved apps/bundles with 1-click repair.

#### 6. ⚙️ Presets Gallery & Dotfiles Synchronization
- Ready-to-use default profiles:
  - *Web Developer Suite*
  - *Designer & Creative*
  - *Media, Audio & Video*
  - *Apple Native Minimalist*
- Visual profile editor to create custom presets.
- **JSON Import/Export**: seamlessly export your configuration to commit and sync with your dotfiles repository.

#### 7. 🛡️ Snapshots Engine & 1-Click Rollback
- Automatic backup snapshots generated before any batch modification or migration.
- Create on-demand manual snapshots with custom labels and descriptions.
- **Instant Rollback**: restore all system associations to any previous snapshot point in 1 click.

#### 8. 📦 Core Binary Manager & GitHub Auto-Downloader
- Auto-locates the `dutix` binary in:
  1. `/usr/local/bin/dutix`
  2. `/opt/homebrew/bin/dutix`
  3. `~/.local/bin/dutix`
  4. `~/Library/Application Support/DutixGUI/bin/dutix`
  5. `$PATH`
- Checks for upstream releases via the official GitHub API (`jackchuka/dutix`).
- **Auto-Download & Setup**: downloads the exact `.tar.gz` for your architecture (`darwin_arm64` for Apple Silicon or `darwin_amd64` for Intel), extracts, assigns executable permissions (`chmod +x`), and installs it locally in `Application Support` with live progress tracking.
- Option to specify a custom binary path manually.

#### 9. 🪵 Real-Time Built-in Log Console
- Slide-out drawer with a complete history of all CLI subprocess executions dispatched by the backend.
- Inspect exact CLI parameters, execution duration in milliseconds, exit status codes, and raw output (STDOUT / STDERR) with 1-click copy.

#### 10. ⚡️ In-App Auto-Update & GitHub Release Downloader
- Automatic background check for new Dutix GUI releases on GitHub (`gabrielpgava/dutix-gui`).
- Interactive modal with version comparison, release changelog notes, and live streaming progress bar.
- Seamless macOS in-place `.app` replacement, quarantine removal (`xattr -cr`), and automatic relaunch in 1 click.

---

### 🚀 Getting Started

#### Option A: Download Pre-built Release
Download the latest pre-compiled Universal binary (`.zip`) from [GitHub Releases](https://github.com/gabrielpgava/dutix-gui/releases), unzip it, and drag `Dutix GUI.app` to your `/Applications` folder.

#### Option B: Build from Source

##### Prerequisites
- macOS 12+ (Apple Silicon or Intel x86_64)
- **Go 1.22+**
- **Node.js 18+** and **npm**
- **Wails v2 CLI**:
  ```bash
  go install github.com/wailsapp/wails/v2/cmd/wails@latest
  ```

##### Build Instructions
```bash
# 1. Clone the repository
git clone https://github.com/gabrielpgava/dutix-gui.git
cd dutix-gui

# 2. Install all dependencies (Go backend + React frontend)
make deps

# 3. Run in Development Mode with Hot-Reload
make dev

# 4. Build a release for your current machine architecture
make build

# 5. (Recommended) Build macOS Universal Binary (Apple Silicon + Intel)
make build-darwin-universal
```

The compiled application bundle will be generated in `build/bin/Dutix GUI.app`.

---

### 📋 Makefile Commands Reference

| Command | Description |
| :--- | :--- |
| `make help` | Display list of available Makefile targets |
| `make deps` | Install Go modules and Node.js npm packages |
| `make dev` | Run app in development mode with live hot-reload |
| `make bindings` | Regenerate Wails TypeScript module bindings |
| `make build` | Compile `.app` for current host architecture |
| `make build-darwin-arm64` | Compile `.app` for Apple Silicon (M1/M2/M3/M4) |
| `make build-darwin-amd64` | Compile `.app` for Intel x86_64 |
| `make build-darwin-universal` | Compile Universal macOS binary (Apple Silicon + Intel) |
| `make package` | Build universal bundle, package `.zip` and generate SHA256 checksums in `dist/` |
| `make test` | Run Go backend unit tests |
| `make test-coverage` | Run unit tests and generate code coverage report |
| `make lint` | Run TypeScript build checks and Go vet |
| `make bump-patch` | Increment patch version (e.g., `1.0.0` -> `1.0.1`) |
| `make bump-minor` | Increment minor version (e.g., `1.0.0` -> `1.1.0`) |
| `make bump-major` | Increment major version (e.g., `1.0.0` -> `2.0.0`) |
| `make release` | Run tests, build package, tag Git version and publish to GitHub Releases |
| `make clean` | Clean build outputs (`build/bin/`, `dist/`, temp artifacts) |

---

### 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

### 🎖️ Credits & Acknowledgements

**Dutix GUI** is built on top of the excellent [`dutix`](https://github.com/jackchuka/dutix) CLI tool created by [**jackchuka**](https://github.com/jackchuka).

- **Core CLI Engine**: [jackchuka/dutix](https://github.com/jackchuka/dutix)
- **Original Author**: [@jackchuka](https://github.com/jackchuka)
- **Original License**: [MIT License (Copyright (c) 2025 jackchuka)](https://github.com/jackchuka/dutix/blob/main/LICENSE)

We are deeply grateful to jackchuka for developing and maintaining the foundational tool that powers macOS LaunchServices handler operations.

---

### 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---
---

<a name="português"></a>
## 🇧🇷 Português

O **Dutix GUI** é um aplicativo desktop nativo, moderno e de código aberto (open-source) para macOS desenvolvido em **Wails v2** (Go no backend + React 18, TypeScript, TailwindCSS v4 e Lucide Icons no frontend). Ele funciona como uma interface gráfica completa para o utilitário CLI [`dutix`](https://github.com/jackchuka/dutix), gerenciando associações de arquivos e esquemas de URL do LaunchServices no macOS (`LSSetDefaultHandlerForURLScheme` e `LSSetDefaultRoleHandlerForContentType`) com snapshots de segurança, migração visual de apps, gerenciador de presets para dotfiles e sem alterar o código original do utilitário.

---

### ✨ Funcionalidades Principais

#### 1. 📊 Painel Geral & Troca Instantânea (Dashboard)
- Resumo de métricas do sistema em tempo real: Total de Aplicativos Instalados, Alvos Registrados, Conflitos/Associações Órfãs e Status do Binário CLI.
- Botões de troca instantânea com 1 clique para as funções mais comuns do macOS:
  - **Navegador Padrão**: Google Chrome, Safari, Brave, Arc, Firefox, etc.
  - **Editor de Código**: Visual Studio Code, Cursor, Zed, TextEdit, etc.
  - **Leitor de Documentos**: Preview, Chrome PDF, Adobe Acrobat, etc.

#### 2. 📱 Catálogo Completo de Aplicativos (Apps Panel)
- Varredura e indexação rápida de aplicativos em `/Applications`, `/System/Applications` e `~/Applications`.
- Alternância entre visualização em **Grid** e **Tabela** com busca em tempo real por nome, Bundle ID ou caminho no disco.
- **Inspetor Detalhado do App (`dutix apps show`)**:
  - Exibe Bundle ID e localização do executável `.app`.
  - Catálogo interativo de extensões suportadas e Identificadores de Tipo Uniforme (UTIs) registrados.
  - Ações rápidas: *Definir como Padrão* ou *Migrar deste App*.

#### 3. 🎯 Associação Rápida (Set Handlers)
- Seletor combobox com busca aproximada (fuzzy search) entre os aplicativos instalados.
- Chips de seleção em lote organizados por categorias:
  - **Código & Web Dev** (`.js`, `.ts`, `.json`, `.py`, `.go`, `.rs`, `.sql`, etc.)
  - **Documentos & Texto** (`.pdf`, `.txt`, `.md`, `.docx`, etc.)
  - **Imagens & Vetores** (`.png`, `.jpg`, `.svg`, `.webp`, `.psd`, etc.)
  - **Áudio & Vídeo** (`.mp4`, `.mkv`, `.mov`, `.mp3`, `.flac`, etc.)
  - **Arquivos & Compactados** (`.zip`, `.tar`, `.gz`, `.7z`, etc.)
  - **Esquemas de URL** (`http://`, `https://`, `mailto://`, etc.)
- Campo livre para inclusão de qualquer extensão personalizada.
- **Simulação Prévia (`--dry-run`)**: visualização comparativa em tabela das alterações antes de aplicá-las.
- **Snapshot Automático de Segurança**: gera um ponto de restauração automático antes de aplicar alterações em lote.

#### 4. 🔄 Migração de Aplicativos (App Migration)
- Interface visual de fluxo "Origem (De) → Destino (Para)".
- Presets rápidos de migração com 1 clique (ex: *TextEdit → VS Code*, *Safari → Chrome*, *QuickTime → VLC*).
- Análise de compatibilidade e simulação prévia (`dutix apps migrate ... --dry-run`).
- Detecção inteligente de avisos e tipos dinâmicos (dynamic UTIs).

#### 5. 🔍 Inspetor de Alvos & Diagnóstico de Conflitos
- Consulta detalhada para qualquer extensão (ex: `.pdf`, `.json`), UTI ou esquema de URL.
- Exibição de todos os aplicativos candidatos registrados com troca rápida em 1 clique.
- **Detector de Conflitos & Bundles Órfãos**: identifica associações vinculadas a aplicativos desinstalados ou movidos, com ação de reparo/reatribuição em 1 clique.

#### 6. ⚙️ Galeria de Presets & Sincronização de Dotfiles
- Perfis prontos para configuração rápida de novos Macs:
  - *Web Developer Suite*
  - *Designer & Criativo*
  - *Mídia, Áudio & Vídeo*
  - *Apple Native Minimalist*
- Criador e editor visual de perfis personalizados.
- **Exportação e Importação de Presets em JSON**: sincronize facilmente suas configurações com repositórios de dotfiles.

#### 7. 🛡️ Motor de Snapshots & Rollback em 1 Clique
- Snapshots gerados automaticamente antes de cada operação em lote ou migração.
- Criação de snapshots manuais sob demanda com etiquetas e descrições personalizadas.
- **Rollback Instantâneo**: restaura todas as associações do sistema para qualquer ponto anterior com 1 clique.

#### 8. 📦 Gestor do Binário Core & Atualizador Automático
- Detecção automática da localização do executável `dutix`:
  1. `/usr/local/bin/dutix`
  2. `/opt/homebrew/bin/dutix`
  3. `~/.local/bin/dutix`
  4. `~/Library/Application Support/DutixGUI/bin/dutix`
  5. `$PATH`
- Consulta automática por novas versões na API oficial do GitHub (`jackchuka/dutix`).
- **Download & Instalação Automática**: baixa o arquivo `.tar.gz` específico da arquitetura (`darwin_arm64` para Apple Silicon ou `darwin_amd64` para Intel), extrai, concede permissão de execução (`chmod +x`) e instala em `Application Support` com barra de progresso em tempo real.
- Suporte para definição manual de caminho customizado do binário.

#### 9. 🪵 Console de Logs Embutido
- Painel lateral retrátil (drawer) com histórico completo de todas as execuções CLI disparadas pelo backend.
- Exibição dos parâmetros exatos, tempo de resposta em milissegundos, código de saída e saída bruta (STDOUT / STDERR) com suporte a cópia rápida.

#### 10. ⚡️ Auto-Update Integrado & Atualização In-Place
- Verificação silenciosa e automática em segundo plano por novas versões no GitHub (`gabrielpgava/dutix-gui`).
- Modal interativo com comparativo de versões, notas da release (changelog) e download com barra de progresso em tempo real.
- Substituição atômica in-place do pacote `.app`, remoção de atributos de quarentena (`xattr -cr`) e reinicialização com 1 clique.

---

### 🚀 Como Instalar e Executar

#### Opção A: Baixar Release Pré-compilada
Baixe o arquivo `.zip` Universal mais recente na página de [GitHub Releases](https://github.com/gabrielpgava/dutix-gui/releases), descompacte e arraste o `Dutix GUI.app` para a sua pasta `/Applications`.

#### Opção B: Compilar a partir do Código-Fonte

##### Pré-requisitos
- macOS 12+ (Apple Silicon ou Intel x86_64)
- **Go 1.22+**
- **Node.js 18+** e **npm**
- **Wails v2 CLI**:
  ```bash
  go install github.com/wailsapp/wails/v2/cmd/wails@latest
  ```

##### Instruções de Compilação
```bash
# 1. Clonar o repositório
git clone https://github.com/gabrielpgava/dutix-gui.git
cd dutix-gui

# 2. Instalar dependências (Go + Node.js)
make deps

# 3. Executar em Modo de Desenvolvimento com Hot-Reload
make dev

# 4. Compilar para a arquitetura nativa atual
make build

# 5. (Recomendado) Compilar binário Universal para macOS (Apple Silicon + Intel)
make build-darwin-universal
```

O aplicativo compilado será gerado em `build/bin/Dutix GUI.app`.

---

### 📋 Tabela de Comandos do Makefile

| Comando | Descrição |
| :--- | :--- |
| `make help` | Exibe a lista de comandos disponíveis |
| `make deps` | Instala dependências do Go e do Frontend (Node/npm) |
| `make dev` | Executa o aplicativo em modo de desenvolvimento com Hot-Reload |
| `make bindings` | Gera ou atualiza os bindings TypeScript do Wails |
| `make build` | Compila o `.app` para a arquitetura nativa atual |
| `make build-darwin-arm64` | Compila o `.app` para Apple Silicon (M1/M2/M3/M4) |
| `make build-darwin-amd64` | Compila o `.app` para macOS Intel (x86_64) |
| `make build-darwin-universal` | Compila o binário Universal macOS (Apple Silicon + Intel) |
| `make package` | Empacota build universal em `.zip` e gera checksums SHA256 em `dist/` |
| `make test` | Executa todos os testes unitários do backend em Go |
| `make test-coverage` | Executa testes e gera relatório de cobertura de código |
| `make lint` | Executa verificação de tipagem TypeScript e Go vet |
| `make bump-patch` | Incrementa a versão Patch (ex: `1.0.0` -> `1.0.1`) |
| `make bump-minor` | Incrementa a versão Minor (ex: `1.0.0` -> `1.1.0`) |
| `make bump-major` | Incrementa a versão Major (ex: `1.0.0` -> `2.0.0`) |
| `make release` | Executa testes, empacota, cria tag Git e publica no GitHub Releases |
| `make clean` | Remove artefatos de compilação temporários (`build/bin/`, `dist/`) |

---

### 🤝 Como Contribuir

Contribuições, issues e sugestões de novas funcionalidades são muito bem-vindas!
1. Faça um Fork do projeto
2. Crie uma Branch para sua Feature (`git checkout -b feature/MinhaFeature`)
3. Faça o Commit de suas alterações (`git commit -m 'feat: adiciona nova funcionalidade'`)
4. Faça o Push para a Branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

---

### 🎖️ Créditos & Agradecimentos

O **Dutix GUI** foi desenvolvido sobre a excelente ferramenta de linha de comando [`dutix`](https://github.com/jackchuka/dutix), criada por [**jackchuka**](https://github.com/jackchuka).

- **Motor CLI Core**: [jackchuka/dutix](https://github.com/jackchuka/dutix)
- **Autor Original**: [@jackchuka](https://github.com/jackchuka)
- **Licença Original**: [Licença MIT (Copyright (c) 2025 jackchuka)](https://github.com/jackchuka/dutix/blob/main/LICENSE)

Expressamos nossos sinceros agradecimentos ao jackchuka pelo desenvolvimento e manutenção da ferramenta essencial que possibilita o gerenciamento de LaunchServices no macOS.

---

### 📄 Licença

Distribuído sob a licença **MIT**. Consulte o arquivo `LICENSE` para mais detalhes.

