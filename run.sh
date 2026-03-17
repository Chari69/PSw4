#!/bin/bash
openssl aes-256-cbc -d -salt -pbkdf2 -iter 100000 -in enc/c.enc -out enc/cookies.txt -pass pass:$YOUTUBE_COOKIE
tsx main.ts