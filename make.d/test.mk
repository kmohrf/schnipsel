PYTHON_BIN?= python3
BLACK_TARGETS = setup.py schnipsel
BLACK_ARGS = --target-version py37 --exclude 'migrations/'
BLACK_BIN = $(PYTHON_BIN) -m black
COVERAGE_BIN ?= $(PYTHON_BIN) -m coverage

.PHONY: lint-python
lint-python:
	flake8 .
	$(BLACK_BIN) $(BLACK_ARGS) --check $(BLACK_TARGETS)

.PHONY: test-python
test-python:
	tox --sitepackages

.PHONY: test-report
test-report:
	$(COVERAGE_BIN) report

.PHONY: test-report-short
test-report-short:
	$(MAKE) test-report | grep TOTAL | grep -oP '(\d+)%$$' | sed 's/^/Code Coverage: /'

.PHONY: test
test: test-python

.PHONY: lint
lint: lint-python

.PHONY: style
style:
	$(BLACK_BIN) $(BLACK_ARGS) $(BLACK_TARGETS)
