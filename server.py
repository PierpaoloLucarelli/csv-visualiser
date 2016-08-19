import csv
import os
import io
from flask import Flask, request, render_template, redirect, url_for, send_from_directory
from werkzeug.utils import secure_filename
from datetime import datetime

UPLOAD_FOLDER = './static'
ALLOWED_EXTENSIONS = set(['csv'])

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route('/')
def getGraph():
	return render_template('index.html')

@app.after_request
@app.after_request
def add_header(r):
    r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    r.headers["Pragma"] = "no-cache"
    r.headers["Expires"] = "0"
    r.headers['Cache-Control'] = 'public, max-age=0'
    return r

@app.route('/savedata', methods=['POST'])
def saveData():
	content = request.json
	filename = datetime.today().strftime("%m-%d-%Y")
	with io.FileIO("./static/{0}.csv".format(filename), "w") as file:
		# wirte headers
		file.write("time,x,y,z,activity\n")
		# write content
		for i, val in enumerate(content):
			val["time"] = val["time"][:-1]
			val["time"] = val['time'].replace("T", " ")
			if('activity' in val):
				file.write("{0},{1},{2},{3},{4}\n".format(val["time"], val["x"], val["y"], val["z"], val["activity"]))
			else:
				file.write("{0},{1},{2},{3}\n".format(val["time"], val["x"], val["y"], val["z"]))
	return send_from_directory(directory=app.config['UPLOAD_FOLDER'], filename=filename+'.csv')

def allowed_file(filename):
	return '.' in filename and \
		   filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def upload_file():
	if request.method == 'POST':
		print(str(request.files))
		# check if the post request has the file part
		if 'file' not in request.files:
			print('No file part')
			return redirect(request.url)
		file = request.files['file']
		# if user does not select file, browser also
		# submit a empty part without filename
		if file.filename == '':
			print('No selected file')
			return redirect(request.url)
		if file and allowed_file(file.filename):
			filename = secure_filename(file.filename)
			file.save(os.path.join(app.config['UPLOAD_FOLDER'], 'data.csv'))
			with open(os.path.join(app.config['UPLOAD_FOLDER'], 'data.csv'), 'r+') as f:
				content = f.read()
				f.seek(0, 0)
				f.write(content)
			return redirect("/")
	return render_template('index.html')

if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0')
