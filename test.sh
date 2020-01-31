#!/bin/bash
jupyter nbconvert --to notebook --execute --output executed_$1 $1
