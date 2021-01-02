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
