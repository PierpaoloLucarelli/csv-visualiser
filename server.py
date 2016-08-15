import csv
from flask import Flask, request, render_template, request
app = Flask(__name__)

@app.route('/')
def getGraph():
	return render_template('index.html')

@app.route('/savedata', methods=['POST'])
def saveData():
	print("haha")
	print(request.get_json())
	return "ok"

@app.route('/getCSV')
def getCSV():
	with open('data2.csv', 'rb') as f:
		reader = csv.reader(f)
		for row in reader:
			print row
	return "got it"

if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0')