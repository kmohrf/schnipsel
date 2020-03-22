DOCKER_REGISTRY = git-registry.hack-hro.de:443/kmohrf/schnipsel
CI_BUILD_IMAGE_PATH = docker/build/Dockerfile
CI_BUILD_IMAGE_NAME = build:buster
CI_BUILD_IMAGE = $(DOCKER_REGISTRY)/$(CI_BUILD_IMAGE_NAME)

.PHONY: ci_image_build
ci_image_build:
	docker build --tag "$(CI_BUILD_IMAGE)" --file "$(CI_BUILD_IMAGE_PATH)" .

.PHONY: ci_image_build
ci_image_push:
	docker push "$(CI_BUILD_IMAGE)"

.PHONY: ci_docker_login
ci_docker_login:
	docker login "$(DOCKER_REGISTRY)"

.PHONY: release-ready
release-ready:
	@[ -n "$$(git status --porcelain)" ] && echo "working directory must be clean for release" >&2 && exit 1
	$(MAKE) test

release-major: BUMP=major
release-minor: BUMP=minor
release-patch: BUMP=patch

.PHONY: release-major release-minor release-patch
release-major release-minor release-patch: release-generic

.PHONY: release-generic
.ONESHELL:
release-generic: release-ready
	CURRENT_VERSION="$$(bumpversion --no-commit --no-tag $(BUMP) && cat VERSION)"
	debchange --newversion "$${CURRENT_VERSION}-1" "New upstream release"
	debchange --release ""
	git commit -a -m "Release $${CURRENT_VERSION}"
	git tag -s -m "Release $${CURRENT_VERSION}" "v$${CURRENT_VERSION}"

.PHONY: test
test:
	@true
