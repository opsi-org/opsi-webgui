#!/bin/bash
echo "install dependencies"
npm install
echo "setting permissions"
chown -f -R 1000:1000 /root/.npm
chown -f -R 1000:1000 /root/.npm/*

