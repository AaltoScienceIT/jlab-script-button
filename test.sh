#!/bin/bash
touch test_log
echo $1 > test_log
pwd >> test_log
echo $(basename $1) >> test_log
jupyter nbconvert --to notebook --execute --output "exec_$(basename $1)" $1
