PHONY: dist-deb
dist-deb:
	dpkg-buildpackage --no-sign
	mkdir -p "$(DIR_BUILD)/deb"
	mv ../*.deb ../*.changes ../*.buildinfo ../*.git ../*.dsc build/deb

list-deb-triggers:
	grep "python3.*django" debian/control | awk '{print $$1}' | tr -d ',' | sort | uniq \
		| while read p; do apt-file list "$$p" | grep "dist-packages/[^/]\+/__init__.py$$"; done \
		| sed 's/^[^ ]* //; s#/__init__\.py$$##' | sed 's/^/interest-noawait /' | sort
