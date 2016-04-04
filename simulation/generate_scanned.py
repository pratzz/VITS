from pymongo import MongoClient
import time

import requests
import DATA as R
import threading
from random import randint


'''
connection = MongoClient('localhost', 27017)
db = connection['vits_app']
collection = db['stolen_info']


for post in collection.find():
        print post
'''

class MainClass(object):
	
	def randSelect(self):
		i = randint(0,80)
		return R.RASPBY[i]

class MyThread(threading.Thread):

	

	def __init__(self, threadID,rf, counter):
		threading.Thread.__init__(self)
		self.threadID = threadID
		self.counter = counter
		self.RFID = rf

	def run(self):
		print "http://localhost:3000/validate/"+self.RFID+self.threadID



RDATA = {}

for i in range(len(R.RASPBY)):
	N0 = R.RASPBY[i]
	if i<78:
		N1 = R.RASPBY[i+1]
		N2 = R.RASPBY[i+2]
		N3 = R.RASPBY[i+3]


	elif i == 78:
		N1 = R.RASPBY[i+1]
		N2 = R.RASPBY[i+2]
		N3 = R.RASPBY[0]

	elif i == 79:
		N1 = R.RASPBY[i+1]
		N2 = R.RASPBY[0]
		N3 = R.RASPBY[1]

	elif i == 80:
		N1 = R.RASPBY[0]
		N2 = R.RASPBY[1]
		N3 = R.RASPBY[2]
	
	RDATA[N0] = N1,N2,N3

#print RDATA[N0]


RS = MainClass()


for i in range(100):
	RP = RS.randSelect()
	RF  = R.RFID[randint(0,9999)]
	MyThread(RP,RF,4).start()

	for i in range(5):
		NRP = RDATA[RP][randint(0,2)]
		MyThread(NRP,RF,4).start()
		RP = NRP

'''
thread1.start()
thread2.start()

i=0
for i in range(5):
	rf = DATA.RFID[randint(0,1000)]
	rp = DATA.RASPBY[randint(0,80)]

	stri = "http://localhost:3000/validate/"+rf+rp
	print stri
	requests.get(stri)
'''

 