BLDDIR = build

# Necessary because zip copies leading directories if run from above targets
ABS_BLDDIR := $(shell readlink -f $(BLDDIR))

all: tbhints

tbhints: $(BLDDIR)/tbhints.xpi

SRC_FILES = $(wildcard src/*.json) $(wildcard src/*.js) src/LICENSE
ADDON_FILES = $(subst src/,,$(SRC_FILES))

$(BLDDIR)/tbhints.xpi: $(SRC_FILES)
	@mkdir -p $(dir $@)
	rm -f $@
	cd src; zip -FSr $(ABS_BLDDIR)/tbhints.xpi $(ADDON_FILES)

lint:
	npx prettier --write src
	npx eslint src

clean:
	rm -f $(BLDDIR)/tbhints.xpi

.PHONY: all clean tbhints lint

