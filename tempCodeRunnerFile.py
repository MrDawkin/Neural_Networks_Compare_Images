import os
import uuid
import flask
import urllib
from PIL import Image
from tensorflow.keras.models import load_model
from flask import Flask , render_template  , request , send_file
from tensorflow.keras.preprocessing.image import load_img , img_to_array

app = Flask(__name__)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model = load_model(os.path.join(BASE_DIR , 'model.hdf5'))


DOZWOLONE_ROZSZERZENIA = set(['jpg' , 'jpeg' , 'png' , 'jfif'])
def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in DOZWOLONE_ROZSZERZENIA

kategorie = ['airplane' ,'automobile', 'bird' , 'cat' , 'deer' ,'dog' ,'frog', 'horse' ,'ship' ,'truck']


def predict(filename , model):
    img = load_img(filename , target_size = (32 , 32))
    img = img_to_array(img)
    img = img.reshape(1 , 32 ,32 ,3)

    img = img.astype('float32')
    img = img/255.0
    result = model.predict(img)

    dict_result = {}
    for i in range(10):
        dict_result[result[0][i]] = kategorie[i]

    res = result[0]
    res.sort()
    res = res[::-1]
    prob = res[:3]
    
    wynik_prawdopodobienstwa = []
    wynik_klasyfikacji = []
    for i in range(3):
        wynik_prawdopodobienstwa.append((prob[i]*100).round(2))
        wynik_klasyfikacji.append(dict_result[prob[i]])

    return wynik_klasyfikacji , wynik_prawdopodobienstwa




@app.route('/')
def home():
        return render_template("index.html")

@app.route('/success' , methods = ['GET' , 'POST'])
def success():
    error = ''
    target_img = os.path.join(os.getcwd() , 'static/images')
    if request.method == 'POST':
        if(request.form):
            link = request.form.get('link')
            try :
                resource = urllib.request.urlopen(link)
                unique_filename = str(uuid.uuid4())
                filename = unique_filename+".jpg"
                img_path = os.path.join(target_img , filename)
                output = open(img_path , "wb")
                output.write(resource.read())
                output.close()
                img = filename

                klasyfikacja_wynik , prawdopodobienstwo_wynik = predict(img_path , model)

                predictions = {
                        "klasa1":klasyfikacja_wynik[0],
                        "klasa2":klasyfikacja_wynik[1],
                        "klasa3":klasyfikacja_wynik[2],
                        "prawdopodobienstwo1": prawdopodobienstwo_wynik[0],
                        "prawdopodobienstwo2": prawdopodobienstwo_wynik[1],
                        "prawdopodobienstwo3": prawdopodobienstwo_wynik[2],
                }

            except Exception as e : 
                print(str(e))
                error = 'To zdjęcie nie jest dostępne '

            if(len(error) == 0):
                return  render_template('success.html' , img  = img , predictions = predictions)
            else:
                return render_template('index.html' , error = error) 

            
        elif (request.files):
            file = request.files['file']
            if file and allowed_file(file.filename):
                file.save(os.path.join(target_img , file.filename))
                img_path = os.path.join(target_img , file.filename)
                img = file.filename

                klasyfikacja_wynik , prawdopodobienstwo_wynik = predict(img_path , model)

                predictions = {
                        "klasa1":klasyfikacja_wynik[0],
                        "klasa2":klasyfikacja_wynik[1],
                        "klasa3":klasyfikacja_wynik[2],
                        "prawdopodobienstwo1": prawdopodobienstwo_wynik[0],
                        "prawdopodobienstwo2": prawdopodobienstwo_wynik[1],
                        "prawdopodobienstwo3": prawdopodobienstwo_wynik[2],
                }

            else:
                error = "Proszę o przesyłanie obrazów wyłącznie w formacie jpg, jpeg i png"

            if(len(error) == 0):
                return  render_template('success.html' , img  = img , predictions = predictions)
            else:
                return render_template('index.html' , error = error)

    else:
        return render_template('index.html')

if __name__ == "__main__":
    app.run(debug = True)