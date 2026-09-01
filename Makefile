# Dutix GUI Makefile
# Automation for development, testing, multi-architecture builds, and GitHub releases

# Tool detection
GO ?= go
NPM ?= npm
WAILS ?= $(shell which wails 2>/dev/null || echo $(HOME)/go/bin/wails)
GIT ?= git
GH ?= $(shell which gh 2>/dev/null)

# Version configuration from VERSION file (Single Source of Truth)
VERSION ?= $(shell cat VERSION 2>/dev/null | tr -d ' \n\r')
ifeq ($(VERSION),)
  VERSION := 1.0.0
endif

# App parameters
APP_NAME := "Dutix GUI"
BUILD_DIR := build/bin
DIST_DIR := dist
GIT_COMMIT := $(shell git rev-parse --short HEAD 2>/dev/null || echo "dev")
BUILD_DATE := $(shell date -u +"%Y-%m-%dT%H:%M:%SZ")

LDFLAGS := -X dutix-gui/pkg/version.Version=$(VERSION) -X dutix-gui/pkg/version.GitCommit=$(GIT_COMMIT) -X dutix-gui/pkg/version.BuildDate=$(BUILD_DATE)

.PHONY: all help deps dev build build-darwin-arm64 build-darwin-amd64 build-darwin-universal build-all test test-coverage lint clean bindings version bump-patch bump-minor bump-major package release

all: build

help: ## Exibe a lista de comandos disponíveis
	@echo "=================================================================="
	@echo " ⚡️ Dutix GUI - Comandos de Desenvolvimento, Build & Release"
	@echo "=================================================================="
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-26s\033[0m %s\n", $$1, $$2}'
	@echo ""

version: ## Exibe a versão atual configurada no projeto
	@echo "Versão atual: \033[32mv$(VERSION)\033[0m (Commit: $(GIT_COMMIT))"

deps: ## Instala dependências do Go e do Frontend (Node/npm)
	@echo "📦 Instalando dependências do backend Go..."
	$(GO) mod tidy
	@echo "📦 Instalando dependências do frontend React..."
	cd frontend && $(NPM) install

bindings: ## Gera ou atualiza os bindings TypeScript gerados pelo Wails
	@echo "🔄 Gerando bindings TypeScript do Wails..."
	$(WAILS) generate module

dev: deps ## Executa o app em modo de desenvolvimento com Hot-Reload (Frontend & Backend)
	@echo "🚀 Iniciando Dutix GUI em modo de desenvolvimento..."
	$(WAILS) dev

build: ## Compila o binário/pacote .app para a arquitetura nativa atual com injeção de versão
	@echo "🔨 Compilando $(APP_NAME) (v$(VERSION)) para a arquitetura atual..."
	$(WAILS) build -clean -ldflags "$(LDFLAGS)"

build-darwin-arm64: ## Compila para macOS Apple Silicon (darwin/arm64 - M1/M2/M3/M4)
	@echo "🍎 Compilando $(APP_NAME) para macOS Apple Silicon (darwin/arm64)..."
	$(WAILS) build -platform darwin/arm64 -clean -ldflags "$(LDFLAGS)"

build-darwin-amd64: ## Compila para macOS Intel (darwin/amd64 - x86_64)
	@echo "🖥️ Compilando $(APP_NAME) para macOS Intel (darwin/amd64)..."
	$(WAILS) build -platform darwin/amd64 -clean -ldflags "$(LDFLAGS)"

build-darwin-universal: ## Compila binário Universal para macOS (Apple Silicon + Intel x86_64)
	@echo "🌐 Compilando $(APP_NAME) Universal Binary (darwin/universal)..."
	$(WAILS) build -platform darwin/universal -clean -ldflags "$(LDFLAGS)"

build-all: build-darwin-universal ## Gera os builds para todas as plataformas e arquiteturas suportadas
	@echo "✨ Todos os pacotes foram compilados com sucesso em $(BUILD_DIR)/"
	@ls -la $(BUILD_DIR)

package: build-darwin-universal ## Empacota o build universal em arquivo .zip e gera checksums SHA256 em dist/
	@echo "📦 Empacotando versão v$(VERSION)..."
	@mkdir -p $(DIST_DIR)
	@cd $(BUILD_DIR) && ditto -c -k --sequesterRsrc --keepParent "Dutix GUI.app" "../../$(DIST_DIR)/Dutix-GUI-v$(VERSION)-macOS-Universal.zip"
	@cd $(DIST_DIR) && shasum -a 256 *.zip > "Dutix-GUI-v$(VERSION)-checksums.txt"
	@echo "✅ Pacotes gerados com sucesso em $(DIST_DIR)/:"
	@ls -la $(DIST_DIR)

test: ## Executa todos os testes unitários do backend em Go
	@echo "🧪 Executando testes unitários..."
	$(GO) test -v ./pkg/...

test-coverage: ## Executa testes com relatório de cobertura
	@echo "📊 Gerando relatório de cobertura de testes..."
	$(GO) test -coverprofile=coverage.out ./pkg/...
	$(GO) tool cover -func=coverage.out

lint: ## Verifica tipagem do frontend TypeScript e formatação Go
	@echo "🔍 Verificando TypeScript no frontend..."
	cd frontend && $(NPM) run build
	@echo "🔍 Verificando Go vet..."
	$(GO) vet ./...

bump-patch: ## Incrementa a versão Patch (ex: 1.0.0 -> 1.0.1)
	@OLD_VER=$(VERSION); \
	NEW_VER=$$(echo $$OLD_VER | awk -F. '{$$NF = $$NF + 1;} 1' | tr ' ' '.'); \
	echo $$NEW_VER > VERSION; \
	echo "Versão atualizada: $$OLD_VER -> $$NEW_VER"

bump-minor: ## Incrementa a versão Minor (ex: 1.0.0 -> 1.1.0)
	@OLD_VER=$(VERSION); \
	NEW_VER=$$(echo $$OLD_VER | awk -F. '{$$2 = $$2 + 1; $$3 = 0;} 1' | tr ' ' '.'); \
	echo $$NEW_VER > VERSION; \
	echo "Versão atualizada: $$OLD_VER -> $$NEW_VER"

bump-major: ## Incrementa a versão Major (ex: 1.0.0 -> 2.0.0)
	@OLD_VER=$(VERSION); \
	NEW_VER=$$(echo $$OLD_VER | awk -F. '{$$1 = $$1 + 1; $$2 = 0; $$3 = 0;} 1' | tr ' ' '.'); \
	echo $$NEW_VER > VERSION; \
	echo "Versão atualizada: $$OLD_VER -> $$NEW_VER"

release: test package ## Cria tag Git e publica a release no GitHub Releases via gh CLI ou git push
	@TAG="v$(VERSION)"; \
	echo "🚀 Preparando release $$TAG..."; \
	if git rev-parse "$$TAG" >/dev/null 2>&1; then \
		echo "Tag $$TAG já existe localmente."; \
	else \
		git tag -a "$$TAG" -m "Release $$TAG"; \
		echo "Tag $$TAG criada."; \
	fi; \
	if [ -n "$(GH)" ]; then \
		echo "Enviando release para o GitHub via GitHub CLI (gh)..."; \
		$(GH) release create "$$TAG" $(DIST_DIR)/Dutix-GUI-$$TAG-macOS-Universal.zip $(DIST_DIR)/Dutix-GUI-$$TAG-checksums.txt --title "Dutix GUI $$TAG" --generate-notes || \
		echo "Execute 'git push origin $$TAG' para acionar o GitHub Actions."; \
	else \
		echo "GitHub CLI (gh) não detectado. Enviando tag para o repositório remoto..."; \
		git push origin "$$TAG" || echo "Tag pronta. Execute: git push origin $$TAG"; \
	fi; \
	echo "🎉 Processo de release concluído para $$TAG!"

clean: ## Limpa diretórios de build temporários e artefatos gerados
	@echo "🧹 Limpando diretórios de build..."
	rm -rf $(BUILD_DIR)
	rm -rf $(DIST_DIR)
	rm -rf frontend/dist
	rm -f coverage.out
	@echo "Limpeza concluída!"
