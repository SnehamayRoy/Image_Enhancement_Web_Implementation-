from flask import Flask, request, send_file
from PIL import Image
import base64
import io
from gradio_client import Client
from flask_cors import CORS

app = Flask(__name__)

CORS(app)  # Enables CORS for all routes

@app.route('/')
def home():
    return "Welcome to the Image Enhancement API!"  # Or render a template

@app.route('/favicon.ico')
def favicon():
    return '', 204  # Handle favicon requests


@app.route('/enhance', methods=['POST'])
def enhance_image():
    if 'image' not in request.files:
        return {"error": "No image provided."}, 400

    # Step 1: Read the uploaded image file
    file = request.files['image']
    img = Image.open(file).convert('RGB')

    # Step 2: Save the image to a buffer
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')  # Save it in JPEG format
    img_byte_arr.seek(0)  # Move to the start of the bytes buffer

    # Step 3: Encode the image to base64
    encoded_image = base64.b64encode(img_byte_arr.read()).decode('utf-8')

    # Prepare the input for the Gradio API
    input_image_data = {
        "url": f"data:image/jpeg;base64,{encoded_image}",  # Base64-encoded image
        "is_stream": False,
    }

    # Use the Hugging Face API to enhance the image
    client = Client("Snehamay/CycleGAN")
    result = client.predict(
        input_image=input_image_data,  # Send the input image data
        api_name="/predict"
    )
    
    output_image_path = result
    enhanced_image = Image.open(output_image_path)
    img_io = io.BytesIO()
    enhanced_image.save(img_io, format='PNG')
    img_io.seek(0) 
    # Step 7: Send the image back as a response without saving to disk
    return send_file(img_io, mimetype='image/png')



if __name__ == '__main__':
    app.run(debug=True)


