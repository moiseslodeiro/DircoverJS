#!/bin/bash

mkdir /etc/dircover
cp ./dircover /bin/dircover
cp -r wordlists /etc/dircover
echo "Installed! Now just run: $ dircover -u https://www.example.com"

