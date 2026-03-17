#!/bin/bash
cd enc
openssl aes-256-cbc -d -salt -pbkdf2 -iter 100000 -in c.enc -out cookies.txt -pass pass:$YOUTUBE_COOKIE
