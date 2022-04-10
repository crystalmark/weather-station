#!/usr/bin/python3

from gpiozero import Button
import math
import statistics
import time
import requests
import json
from ina219 import INA219
from ina219 import DeviceRangeError
import logging
import epd1in54_V2
from PIL import Image,ImageDraw,ImageFont
import traceback
import sys

SHUNT_OHMS = 0.1

N_max=5.165
N_min=5.071
NE_max=5.039
NE_min=5.000
E_max=5.07
E_min=5.04
SE_max=4.849
SE_min=4.639
S_max=3.650
S_min=3.150
SW_max=4.38
SW_min=0
#SW_min=3.700
W_max=4.600
W_min=4.390
NW_max=4.989
NW_min=4.850

compass_degrees = {
    180: "S",
    225: "SW",
    270: "W",
    315: "NW",
    0: "N",
    45: "NE",
    90: "E",
    135: "SE"
}

station_id = argv[1]
url = sys.argv[2]
key = sys.argv[3]

wind_count = 0
radius = 0.09
circumference = (2 * math.pi) * radius
sample_interval = 5
submit_interval = 600

def spin():
    global wind_count
    wind_count = wind_count + 1

def calculate_speed(time_sec):
    global wind_count
    rotations = wind_count / 2.0
    dist = circumference * rotations
    speed = dist / sample_interval
    return speed 

def reset_wind():
    global wind_count
    wind_count = 0

def send(wind):
    # print(wind)
    requests.post(url, json = wind, headers = {"X-API-Key": key})

def get_compass():
    ina.wake()
    v = round(ina.voltage(),2)
    ina.sleep()
    if N_min <= v <= N_max: 
        return 0
    elif NE_min <= v <= NE_max: 
        return 45
    elif E_min <= v <= E_max: 
        return 90
    elif SE_min <= v <= SE_max: 
        return 135
    elif S_min <= v <= S_max: 
        return 180
    elif SW_min <= v <= SW_max: 
        return 225
    elif W_min <= v <= W_max: 
        return 270
    elif NW_min <= v <= NW_max: 
        return 315
    else:
        return "Unknown "+str(v)


wind_speed_sensor = Button(5)
wind_speed_sensor.when_pressed = spin

ina = INA219(SHUNT_OHMS)
ina.configure(ina.RANGE_16V)

speeds = []
epd = epd1in54_V2.EPD()
font = ImageFont.truetype('Font.ttc', 32)
font_big = ImageFont.truetype('Font.ttc', 68)
epd.init(0)
epd.Clear(0xFF)
time.sleep(1)
time_image = Image.new('1', (epd.width, epd.height), 255)  # 255: clear the frame
epd.displayPartBaseImage(epd.getbuffer(time_image))
epd.init(1) # into partial refresh mode
time_draw = ImageDraw.Draw(time_image)

def push(speed):
    # print(str(speed))
    global speeds
    speeds.append(speed)
    # print( "length = "+str(len(speeds))+" max = "+str(submit_interval/sample_interval));
    while len(speeds) > (submit_interval/sample_interval):
        popped = speeds.pop(0)
        # print("removing "+str(popped));

def display(speed, gust, direction):
    speed_knots = round(speed*1.94384)
    gust_knots = round(gust*1.94384)
    if type(direction) == str:
       compass_direction = "--"
    else:
       compass_direction = compass_degrees[direction]
    time_draw.rectangle((5, 10, epd.width, epd.height), fill = 255)
    time_draw.text((5, 10), time.strftime('%H:%M:%S'), font = font, fill = 0)
    time_draw.text((5, 50), f"{speed_knots:02d} kts", font = font_big, fill = 0)
    time_draw.text((5, 125), f"gust:  {gust_knots:02d} kts", font = font, fill = 0)
    time_draw.text((5, 165), f"direction: {compass_direction}", font = font, fill = 0)
    newimage = time_image.crop([5, 10, epd.width, epd.height])
    time_image.paste(newimage, (5,10))
    epd.displayPart(epd.getbuffer(time_image.rotate(180)))

while True:
    start_time = time.time()
    direction = ""
    while time.time() - start_time <= submit_interval:
        reset_wind()
        time.sleep(sample_interval)
        speed = calculate_speed(sample_interval)
        push(speed)
        direction = get_compass()
        display(speed, max(speeds), direction)
    wind_gust = max(speeds)
    wind_speed = statistics.mean(speeds)
    timestamp = round(time.time())
    wind = { "stationId": station_id, "timestamp": round(time.time()), "average": round(wind_speed*100), "max": round(wind_gust*100), "direction": direction }
    send(wind)
