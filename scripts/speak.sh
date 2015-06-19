#!/bin/bash
echo $1 |
  for a in `cat`; do
    V=$(((($RANDOM) % 100) - 50))
    echo -n "<prosody pitch=\"+$V\">$a</prosody> " |
      sed 's/+-/-/' 
  done | espeak -vfr+f3 -m -p 60 -s 140
