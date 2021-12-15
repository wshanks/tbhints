BLDDIR = build

# Necessary because zip copies leading directories if run from above targets
ABS_BLDDIR := $(shell readlink -f $(BLDDIR))

all: tbhints tbhints-atn

tbhints: $(BLDDIR)/tbhints.xpi
tbhints-atn: $(BLDDIR)/tbhints-atn.xpi

SRC_FILES = $(wildcard src/*.json) $(wildcard src/*.js) src/LICENSE
ADDON_FILES = $(subst src/,,$(SRC_FILES))

$(BLDDIR)/tbhints.xpi: $(SRC_FILES)
	@mkdir -p $(dir $@)
	rm -f $@
	cd src; zip -FSr $(ABS_BLDDIR)/tbhints.xpi $(ADDON_FILES)

$(BLDDIR)/tbhints-atn.xpi: $(SRC_FILES)
	rm -f $@ $(dir $@)/atn
	@mkdir -p $(dir $@)
	cp -r src $(dir $@)/atn
	sed -i 's/\( *"strict_max_version": \)\(.*\)$$/\1"103.0"/' $(dir $@)/atn/manifest.json
	cd $(dir $@)/atn; zip -FSr $(ABS_BLDDIR)/tbhints-atn.xpi $(ADDON_FILES)

lint:
	npx prettier --write src
	npx eslint src

clean:
	rm -rf $(BLDDIR)/tbhints.xpi $(BLDDIR)/tbhints-atn.xpi $(BLDDIR)/atn

.PHONY: all clean tbhints lint

