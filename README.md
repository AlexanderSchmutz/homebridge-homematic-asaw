# homebridge-homematic

<p align="center">
    <img src="docs/homebridge.png" height="200">
</p>

[![Donate some coins if you want](https://www.paypalobjects.com/en_US/i/btn/btn_donate_SM.gif)](https://www.paypal.com/cgi-bin/webscr?cmd=_s-xclick&hosted_button_id=DZ5CW7XC9LXMN)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Supports the Homematic System on HomeBridge Platform

If you just want to add your HomeMatic devices (CCU3/Raspberrymatic/pivCCU) you may also like https://github.com/thkl/hap-homematic

## Maintained Fork

This repository can be used as a maintained fork of
`thkl/homebridge-homematic` with compatibility and stability fixes.

Install this fork directly from GitHub:

`sudo npm install -g --omit=dev git+https://github.com/AlexanderSchmutz/homebridge-homematic-asaw.git#main`



Devices currently supported:

Switches , Dimmer , RotaryHandles, WindowContacts, MotionSensor, Blinds, Keymatic
ProgramStarter, SmokeDetector, Thermostats ....

# Installation
1. Make sure your Node.js version is compatible with your Homebridge release (use a current LTS version).
2. Install Homebridge (if not installed already): `npm install -g homebridge`
3. Remove an old global install of this plugin: `npm uninstall -g homebridge-homematic`
4. Install this maintained fork: `npm install -g --omit=dev git+https://github.com/AlexanderSchmutz/homebridge-homematic-asaw.git#main`
5. Restart Homebridge.
6. Keep your existing platform config (`"platform": "HomeMatic"`). See the sample below.

# Configuration

Configuration sample:

 ```
"platforms": [
        {
            "platform": "HomeMatic",
            "name": "HomeMatic CCU",
            "ccu_ip": "192.168.0.100",
            "subsection":"Homekit"
        }   
    ]

```

# Configuration Changes Version > 214
Beginning of Version 0.0.214 other that the above configuration settings has been moved to a plugin own config file.
So you are able to use the plugin settings in https://github.com/oznu/homebridge-config-ui-x#readme for the initial configuration.

The file is located at the same path as your config.json and named homematic_config.json

The plugin will copy your settings once to this file

```
{
    "filter_device":[],
    "filter_channel":["BidCos-RF.KEQXXXXXXX:4", "BidCos-RF.LEQXXXXXXX:2"],
    "outlets":[ "BidCos-RF.KEQXXXXXXX:4","BidCos-RF.IEQXXXXXXX:1"],
    "doors":[],
    "programs":[]
}
```

Please use the homematic_config.json to setup new stuff.



**** BEGINNING OF VERSION 0.0.41 the selection of channels to use with HomeKit via a CCU Subsection is mandatory *****


Preselect all the Channels you want to import into Homekit by one Subsection at your CCU.
Create a new Subsection (in the Sample named as Homekit) and put all the Channels in you want to import. Finally put the name of the subsection into your config.js

Ports: the plugin will use local Port 9090 to communicate with the ccu rfd daemon. Port 9091 for wired and 9092 for hmip (if they are in use).
If these ports are in use by other applications, you can change them by the following key in your homematic_config.json

```
"local_port":8080
```

In this case , please make sure that 8081 and 8082 are also available. You got the point ....


# Variables

You may add binaray variables to Homekit by adding them into your homematic_config.json. They will show up as switches.

```
"variables":["VarName1","VarName2]
```

# Programs

If you want to launch Homematic Programs you can also add them to homematic_config.json.
There is a issue with ios10. The build in Home App doesnt handle custom Services so you have to add the ios10 flag in your homematic_config.json

```
"programs":["ProgName1","ProgName2"],
"ios10":true
```

# Doors and Windows

Homematic Shutter Contacts will be mapped as Contacts into HomeKit by default. If you want to ask Siri about open Windows, you have to add them to a windows config switch:

So they will be mapped into an motorized Window Device. If you add the channel to the doors configuration switch, this channel will be mapped as automated door.


```
"doors":["BidCos-RF.KEQXXXXXXX:4"]
"windows":["BidCos-RF.KEQXXXXXXX:4"]
```

# HM-LC-RGBW-WM

Please only add the channel with number 2 to HomeKit.

# HMIP

The following HMIP Devices should work:

* HMIP-PSM (Switch - Part)
* HMIP-PS
* HMIP-SWDO
* HMIP-SRH
* HmIP-SMI
* HMIP-SWSD
* HMIP-eTRV
* HMIP-WTH
* HmIP-WTH-2
* HmIP-STH
* HmIP-BWTH
* HmIP-FSM
* HmIP-BSM
* HmIP-BDT
* HmIP-BROLL
* HmIP-FROLL
* HmIP-SWO-B
* HmIP-SWO-PL
* HmIP-SWO-PR

Please setup HMIP by adding the following key to your homematic_config.json

```
"enable_hmip":"true"
```

# Garagedoor

Find further information [here](https://github.com/thkl/homebridge-homematic/wiki/Garagentor).


# Troubleshooting

If the Home app on your iOS device cannot connect to the Homebridge after entering the PIN (and just tells you "there was a problem"), this may be caused by too many devices being presented by the bridge. In this case, try to filter some unused devices, e.g. like this if you don't use the "virtual keys":

```
"filter_device":["BidCoS-Wir","BidCoS-RF"]
```


# Custom Serviceclasses

You own a device that is not currently working with the default implementation here? No problem. You can create custom service classes. With a little bit of knowledge from the existing classes in the ChannelServices folder, this should not be a big deal. Copy the HomeMaticHomeKitDummyService and create your own Serviceclass.

All definitions for the existing classes are located in ChannelServices/channel_config.json. There is a key for each Homematic channeltype and the corresponding name of the service class as value. Be Aware: your personal changes in that file will be overridden by the next update. So you have to set them up in your config.json:


As a sample: the device with the channel WEATHER of the device with type HM-WDS10-TH-O will use the service HomeMaticHomeKitCuxDThermostatService

```
"services": [
	{ "type": "HM-WDS10-TH-O:WEATHER",
          "service": "HomeMaticHomeKitCuxDThermostatService"
	}]

```

or you could use for example the device HmIP-STH just as a regular Temperature and
Humidity sensor:

```
"services": [
  { "type": "HmIP-STH:HEATING_CLIMATECONTROL_TRANSCEIVER",
    "service": "HomeMaticHomeKitThermostatWeatherServiceIP" }
] 
```
