# AGENTS.md — Dutix GUI Agent Guidelines & Operational Manual

Este documento fornece a especificação técnica completa, padrões de engenharia e procedimentos operacionais padronizados para agentes de IA e desenvolvedores que trabalham na manutenção, evolução e publicação de releases do **Dutix GUI**.

---

## 1. Visão Geral do Projeto & Arquitetura

O **Dutix GUI** é uma interface gráfica nativa para macOS desenvolvida em **Wails v2** (Go no backend + React 18 / TypeScript / TailwindCSS v4 no frontend) que atua como um wrapper completo para o utilitário CLI [`dutix`](https://github.com/jackchuka/dutix), gerenciando associações de arquivos (`LSSetDefaultHandlerForURLScheme`, `LSSetDefaultRoleHandlerForContentType`) no macOS sem alterar o código original da ferramenta.

### Diagrama Arquitetural
```
┌────────────────────────────────────────────────────────┐
│               Frontend (React 18 + TS)                 │
│  TailwindCSS v4 • Lucide Icons • macOS Dark Aqua Theme │
└──────────────────────────┬─────────────────────────────┘
                           │ Wails IPC (JSON / Bindings)
┌──────────────────────────▼─────────────────────────────┐
│                 Backend (Go 1.22+)                     │
│  pkg/dutix (Executor, Parser, Types)                   │
│  pkg/binary (Locator, GitHub Releases Downloader)      │
│  pkg/snapshots (Safety Backup & Rollback Engine)       │
│  pkg/presets (Dotfiles & Configuration Profiles)       │
│  pkg/logs (In-Memory CLI Execution History)            │
│  pkg/version (Dynamic Build-Time Versioning)           │
└──────────────────────────┬─────────────────────────────┘
                           │ exec.Command (JSON / Subprocesses)
┌──────────────────────────▼─────────────────────────────┐
│                  dutix CLI Binary                      │
│      /usr/local/bin • /opt/homebrew/bin • ~/Library    │
└────────────────────────────────────────────────────────┘
```

---

## 2. Estrutura de Diretórios

```
dutix-gui/
├── AGENTS.md                   # Manual de instruções e diretrizes para agentes de IA
├── Makefile                    # Automação de desenvolvimento, builds e releases
├── README.md                   # Documentação pública do projeto
├── VERSION                     # Fonte única da verdade para versão semântica (ex: 1.0.0)
├── app.go                      # Wails App Struct & Métodos expostos ao frontend
├── main.go                     # Ponto de entrada Wails e configuração de janela macOS
├── wails.json                  # Configuração de empacotamento do Wails v2
├── .github/workflows/
│   └── release.yml             # Workflow de CI/CD para GitHub Releases
├── pkg/
│   ├── binary/                 # Detecção, busca no PATH e download da release no GitHub
│   ├── dutix/                  # Execução de subprocessos CLI e parsers de saída/JSON
│   ├── logs/                   # Histórico de execuções com STDOUT/STDERR e métricas
│   ├── presets/                # Gerenciamento de presets dotfiles e import/export JSON
│   ├── snapshots/              # Snapshots de associações e restauração/rollback
│   └── version/                # Variáveis de versão injetadas em tempo de build
└── frontend/
    ├── package.json
    ├── vite.config.ts          # Configuração Vite com TailwindCSS v4
    ├── src/
    │   ├── App.tsx             # Componente raiz, controle de tabs e estado global
    │   ├── style.css           # Estilos globais e scrollbars nativas macOS
    │   └── components/
    │       ├── layout/         # Sidebar e Header
    │       ├── dashboard/      # Métricas e botões de 1 clique
    │       ├── apps/           # Catálogo de aplicativos e modal de detalhes
    │       ├── set/            # Associação rápida com chips e simulação dry-run
    │       ├── migrate/        # Fluxo Origem -> Destino
    │       ├── targets/        # Inspetor de alvos e diagnóstico de conflitos
    │       ├── presets/        # Galeria de perfis dotfiles
    │       ├── snapshots/      # Histórico de snapshots e rollback
    │       ├── binary/         # Modal de gestão e atualização do binário
    │       └── logs/           # Drawer do console de logs
```

---

## 3. Regras de Ouro para Agentes

1. **Nunca modifique o binário `dutix`**: Todas as interações devem ser feitas via `exec.Command` chamando o binário instalado ou baixado.
2. **Snapshot Automático**: Toda operação que altera associações no sistema em lote (`set`, `migrate`, `apply preset`) DEVE gerar um snapshot prévio em `pkg/snapshots` para garantir rollback.
3. **Tratamento de Saída Silenciosa**: Sempre utilize a flag `-q` ou o parser `dutix.ExtractJSON` para isolar mensagens de progresso do binário CLI.
4. **Respeito à Arquitetura macOS**: Sempre compile para Universal Binary (`darwin/universal`) ao gerar builds finais para suportar tanto Apple Silicon (M1/M2/M3/M4) quanto Intel (x86_64).
5. **Atualização de Bindings**: Sempre que adicionar novos métodos em `app.go`, execute `make bindings` para atualizar os tipos TypeScript.

---

## 4. Guia Operacional: Passo a Passo para Gerar Releases

Sempre que o usuário solicitar gerar uma nova release ou publicar no GitHub Releases, siga rigorosamente este fluxo:

### Passo 1: Verificar e Incrementar a Versão
Verifique a versão atual com `make version`. Conforme o tipo de alteração, execute:
- Para correção de bugs: `make bump-patch` (ex: `1.0.0` -> `1.0.1`)
- Para novas funcionalidades: `make bump-minor` (ex: `1.0.0` -> `1.1.0`)
- Para mudanças arquiteturais: `make bump-major` (ex: `1.0.0` -> `2.0.0`)
*(Ou edite diretamente o arquivo `VERSION` se uma versão específica for solicitada).*

### Passo 2: Executar Testes e Validação
Certifique-se de que a suíte de testes passa sem regressões:
```bash
make test
make lint
```

### Passo 3: Gerar Bindings e Empacotar o Build Universal
```bash
make bindings
make package
```
Isso compilará o pacote Universal (`Dutix GUI.app`), gerará o arquivo compactado `dist/Dutix-GUI-v<VERSION>-macOS-Universal.zip` e o arquivo de verificação SHA256 `dist/Dutix-GUI-v<VERSION>-checksums.txt`.

### Passo 4: Publicar no GitHub Releases
Execute o comando de release:
```bash
make release
```
- **Se o `gh` CLI estiver autenticado**: A release será criada instantaneamente no GitHub Releases com notas geradas e os arquivos da pasta `dist/` anexados.
- **Se o `gh` CLI não estiver disponível**: O Makefile criará a tag `v<VERSION>` e enviará para o repositório remoto via `git push origin v<VERSION>`, disparando o fluxo automatizado do GitHub Actions em `.github/workflows/release.yml`.

---

## 5. Tabela Rápida de Comandos do Makefile

| Comando | Descrição |
| :--- | :--- |
| `make dev` | Executa o aplicativo em modo de desenvolvimento com Hot-Reload |
| `make build` | Compila o `.app` para a arquitetura nativa atual |
| `make build-darwin-universal` | Compila o binário Universal macOS (Apple Silicon + Intel) |
| `make build-all` | Compila todos os pacotes suportados |
| `make package` | Gera os arquivos `.zip` e `checksums.txt` na pasta `dist/` |
| `make release` | Cria a tag Git e publica a release no GitHub |
| `make bump-patch` | Incrementa versão de patch (`x.y.Z`) |
| `make bump-minor` | Incrementa versão minor (`x.Y.0`) |
| `make bump-major` | Incrementa versão major (`X.0.0`) |
| `make test` | Executa testes unitários do Go |
| `make test-coverage` | Gera relatório de cobertura de código |
| `make clean` | Remove arquivos gerados em `build/` e `dist/` |
| `make help` | Exibe resumo formatado dos comandos |

---

## 6. Registro de Versões e Features

### **v1.0.0 (Initial Release)**
- **Dashboard Interativo**: Métricas em tempo real de associações ativas por categoria (Browser, IDE, Terminal, Mídia, Documentos), atalhos de 1-clique para navegadores e editores padrão.
- **Catálogo de Aplicativos (Apps)**: Busca inteligente por nome e Bundle ID, inspeção de extensões/UTIs suportadas e visualização de ícones de alta resolução extraídos do sistema.
- **Associação Rápida & Dry-Run (Set)**: Interface com chips para extensões, esquemas URL e UTIs, com suporte completo a simulação de impacto antes da aplicação real.
- **Migração Inteligente (Migrate)**: Transferência em lote de associações de um aplicativo de origem para outro de destino com seleção individual e backup automático.
- **Inspetor de Alvos & Conflitos (Targets)**: Diagnóstico de múltiplos manipuladores para uma mesma extensão e resolução com 1 clique.
- **Galeria de Presets (Dotfiles)**: Exportação e importação de perfis JSON (Development, Media Pro, Privacy, Minimalist) para sincronização entre máquinas.
- **Motor de Segurança & Rollback (Snapshots)**: Criação automática de ponto de restauração antes de qualquer alteração, histórico detalhado com comparação de diff e rollback com 1 clique.
- **Gestor do Binário dutix**: Detecção automática no PATH do sistema (`/usr/local/bin`, `/opt/homebrew/bin`, `~/Library`), download e atualização com 1 clique direto dos releases oficiais do GitHub.
- **Console de Execução em Tempo Real (Logs)**: Monitoramento completo com visualização de comandos executados, STDOUT, STDERR, tempos de execução e exportação em texto puro.
- **Pipeline CI/CD**: Automação via GitHub Actions para compilação Universal Binary (`darwin/universal`) e publicação de pacotes `.zip` e checksums SHA256 no GitHub Releases.

