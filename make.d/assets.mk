DIR_ASSETS = app
DIR_NODE = $(DIR_ASSETS)/node_modules
DIR_NODE_BIN = $(DIR_NODE)/.bin

BIN_NODE_PKG = npm --prefix "$(DIR_ASSETS)"
BIN_VUE_CLI = $(DIR_NODE_BIN)/vue-cli-service

OUTPUT_DIR_STATIC = $(DIR_BUILD)/app
OUTPUT_ASSET_TEMPLATE = $(OUTPUT_DIR_STATIC)/index.html

DEPS_ASSETS = $(shell find "$(DIR_ASSETS)" -type f -not -path "$(DIR_ASSETS)/node_modules/*")

# dpkg-buildpackage and related tools may interface with
# proxy settings to prevent internet access during package builds.
# We don’t care about that.
undefine no_proxy
undefine http_proxy
undefine https_proxy

$(DIR_NODE): $(DIR_ASSETS)/package.json $(DIR_ASSETS)/package-lock.json
	ADBLOCK=true $(BIN_NODE_PKG) ci --no-progress
	@touch -c $(DIR_NODE)

$(BIN_VUE_CLI): $(DIR_NODE)

$(OUTPUT_ASSET_TEMPLATE): $(BIN_VUE_CLI) $(DEPS_ASSETS)
	$(BIN_NODE_PKG) run build

.PHONY: lint-js
lint-js: $(BIN_VUE_CLI)
	$(BIN_NODE_PKG) run lint

lint: lint-js

.PHONY: clean-assets
clean-assets:
	rm -rf \
			$(DIR_NODE) \
			$(OUTPUT_DIR_STATIC)

clean: clean-assets

.PHONY: assets
assets: $(OUTPUT_ASSET_TEMPLATE)

.PHONY: assets-install
assets-install: assets
	(cd "$(OUTPUT_DIR_STATIC)"; find * -type f -print0 | xargs -0 -I '{}' install -D '{}' "$(DESTDIR)/public/{}")
