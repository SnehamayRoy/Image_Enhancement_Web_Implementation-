from flask import Flask, request, jsonify, send_file
import torch
from PIL import Image
from torchvision import transforms
from io import BytesIO
from model import Generator  # Replace with your model's file
from flask import Flask, request, jsonify, render_template
from PIL import Image
import io
import base64
import torch
from torchvision import transforms
import os

from torchvision.utils import save_image
from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from PIL import Image
import base64
import io

app = Flask(__name__)
CORS(app)  # Enables CORS for all routes

# Load the model
model = Generator(img_channels=3, num_residuals=15)  # Replace 3 with the correct number of channels if different

checkpoint = torch.load('genz.pth.tar', map_location=torch.device('cpu'),weights_only=True)
model.load_state_dict(checkpoint["state_dict"])
model.eval()

# Define a transformation for input images

transform = transforms.Compose([
    transforms.Resize((256, 256)),  # Example: resizing to a standard size
    transforms.ToTensor(),          # Convert the image to a tensor
    transforms.Normalize(mean=[0.5, 0.5, 0.5], std=[0.5, 0.5, 0.5])  # Example normalization
])

@app.route('/enhance', methods=['POST'])
def enhance_image():
    if 'image' not in request.files:
        return {"error": "No image provided."}, 400

    # Step 1: Read the uploaded image file
    file = request.files['image']
    img = Image.open(file.stream).convert('RGB')
    
    # Step 2: Preprocess the image to prepare it for model input
    input_tensor = transform(img).unsqueeze(0)  # Add a batch dimension

    # Step 3: Perform image enhancement using the model
    with torch.no_grad():
        enhanced_tensor = model(input_tensor).squeeze(0)  # Remove the batch dimension

    # Step 4: Convert the model output tensor back to a PIL Image
    enhanced_tensor=enhanced_tensor * 0.5 + 0.5
    enhanced_image = transforms.ToPILImage()(enhanced_tensor)

  
    # Step 5: Save the enhanced image to a file
    # Step 6: Save the enhanced image to a bytes buffer instead of a file
    img_byte_arr = io.BytesIO()
    enhanced_image.save(img_byte_arr, format='PNG')  # Save the image to the bytes buffer
    img_byte_arr.seek(0)  # Move to the start of the bytes buffer

    # Step 7: Send the image back as a response without saving to disk
    return send_file(img_byte_arr, mimetype='image/png')



if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)


