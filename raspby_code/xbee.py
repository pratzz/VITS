import serial,time
import urllib

ser=serial.Serial('/dev/ttyAMA0',9600)
print ser
RFID = ""
while 1:
	data=ser.read(12)
	RFID = RFID+data
	break
	data=""

try:
	stri = "http://169.254.39.84/test/demo.php?id="+RFID
	con = urllib.urlopen(stri)

except e:
	print "Not connected"


ser.close()
