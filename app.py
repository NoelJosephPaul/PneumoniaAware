from flask import Flask, render_template, request, jsonify
import numpy as np
import cv2
from tensorflow.keras.models import load_model

app = Flask(__name__)

# Load the trained model
model = load_model("pneumoniamodel.h5")

# Define the class mapping
class_mapping = {
    0: "Pneumonia",
    1: "Normal"
}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/predict", methods=["POST"])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file part"})

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No selected file"})

    # Read the image and preprocess
    img_arr = cv2.imdecode(np.fromstring(file.read(), np.uint8), cv2.IMREAD_GRAYSCALE)
    img_size = 150
    resized_arr = cv2.resize(img_arr, (img_size, img_size))

    # Expand dimensions to include batch and channel dimensions
    input_data = np.expand_dims(np.expand_dims(resized_arr, axis=0), axis=-1)

    # Predict using the model
    predictions = model.predict(input_data)
    predicted_class_index = int(predictions[0][0])

    # Get the predicted label from the dictionary
    predicted_label = class_mapping[predicted_class_index]

    return jsonify({"prediction": predicted_label})

if __name__ == "__main__":
    app.run(debug=True)
