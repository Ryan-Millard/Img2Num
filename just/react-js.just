set working-directory := '..'

# List the commands in this file
help:
    @just --list react-js

# Build the React example app
build:
    @echo "Build react sample app"
    pnpm -F react-example run build

# Start the React example app on port 5173
start:
    @echo "Start react sample app on port 5173"
    pnpm -F react-example run dev
