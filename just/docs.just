set working-directory := '..'

# List the commands in this file
help:
    @just --list docs

# Build the Docusaurus site
build:
    @echo "Build Docusaurus"
    pnpm -F docs run build

# Serve the Docusaurus site on port 3000
start:
    @echo "Start Docusaurus on port 3000"
    cd docs/ && pnpm run serve

# Delete Docusaurus build artefacts (check these folder names against docs/)
clean:
    @echo "Remove docs/build and docs/.docusaurus"
    rm -rf docs/build/ docs/.docusaurus/
