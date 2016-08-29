import csv
import os
import io
import datetime
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

#disable chache 
@app.after_request
def add_header(r):
	r.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
	r.headers["Pragma"] = "no-cache"
	r.headers["Expires"] = "0"
	r.headers['Cache-Control'] = 'public, max-age=0'
	return r

def allowed_file(filename):
	return '.' in filename and \
		   filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/', methods=['GET', 'POST'])
def upload_file():
	if request.method == 'POST':
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
			with open(os.path.join(app.config['UPLOAD_FOLDER'], 'data.csv'), 'r') as original:
				data = original.read()
				if(data[0]!='t'): #add header only if missing
					with open(os.path.join(app.config['UPLOAD_FOLDER'], 'data.csv'), 'r+') as modified:
						modified.seek(0)
						first_line = modified.readline()
						modified.seek(0)
						modified.write("time,x,y,z,activity\n")
						if(first_line[0:4]!="2016"):
							print(first_line[0:4])
							reader = csv.reader(data.split('\n'), delimiter=',')
							for row in reader:
								if(row):
									s = float(row[0]) / 1000.0
									row[0] = datetime.fromtimestamp(s).strftime('%Y-%m-%d %H:%M:%S.%f')[:-3]
									modified.write("{0}, {1}, {2}, {3}, {4}\n".format(row[0], row[1], row[2], row[3], row[4]))
						else:
							modified.write(data)
						modified.truncate()
			return redirect("/")
	return render_template('index.html')

if __name__ == '__main__':
	app.run(debug=True, host='0.0.0.0', threaded="true")
