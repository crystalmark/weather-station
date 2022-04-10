#!/bin/sh
cd ~pi/weather-station/pi
git pull
python3 wind.py $1 $2 $3
