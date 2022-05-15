#!/bin/bash

generate-headers tampermonkey -o dist/headers.js -m $(cat .matches)
