DIR_BUILD ?= build

.PHONY: default-target
default-target:
	@true

.PHONY: clean
clean:
	rm -rf "$(DIR_BUILD)"

include make.d/assets.mk
include make.d/ci.mk
include make.d/release.mk
include make.d/test.mk
include make.d/deb.mk
