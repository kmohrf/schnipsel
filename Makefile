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
