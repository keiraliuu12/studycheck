from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
import base64

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# IMPORTANT: Do not hardcode the API Key in the code.
# Get it from an environment variable.
# You need to set this environment variable in your terminal before running the server:
# For Windows: set ARK_API_KEY=your_api_key
# For macOS/Linux: export ARK_API_KEY=your_api_key
API_KEY = os.environ.get("ARK_API_KEY")
MODEL_API_URL = "https://ark.cn-beijing.volces.com/api/v3/chat/completions"

@app.route('/analyze', methods=['POST'])
def analyze_images():
    if not API_KEY:
        return jsonify({"error": "API key is not configured on the server."}), 500

    if 'images' not in request.files:
        return jsonify({"error": "No images provided."}), 400

    files = request.files.getlist('images')
    if len(files) < 5:
        return jsonify({"error": "At least 5 images are required."}), 400

    base64_images = []
    for file in files:
        # Read file content and encode it to base64
        encoded_string = base64.b64encode(file.read()).decode('utf-8')
        base64_images.append(f"data:{file.mimetype};base64,{encoded_string}")

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}"
    }
    
    # Construct the prompt for the model
    prompt = {
        "model": "doubao-seed-1-6-thinking",
        "messages": [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": "你是一位资深的恋爱顾问。请基于以下这些朋友圈截图，深入分析这个人的性格特点、兴趣爱好、价值观，并提供一些实用的建议，帮助我与TA发展成为男女朋友。建议可以包括：如何开启对话、可以聊哪些话题、适合的约会活动、以及追求过程中需要注意什么。"
                    }
                ] + [{"type": "image_url", "image_url": {"url": url}} for url in base64_images]
            }
        ]
    }

    try:
        response = requests.post(MODEL_API_URL, headers=headers, json=prompt)
        response.raise_for_status()  # Raise an exception for bad status codes
        model_response = response.json()
        
        # Extract the analysis content from the model's response
        # The exact structure might vary, adjust according to the actual API response
        analysis_content = model_response['choices'][0]['message']['content']
        
        return jsonify({"analysis": analysis_content})

    except requests.exceptions.RequestException as e:
        return jsonify({"error": f"Failed to call model API: {e}"}), 500
    except KeyError:
        return jsonify({"error": "Unexpected response format from model API."}), 500

if __name__ == '__main__':
    # Runs the server on http://127.0.0.1:5000
    app.run(port=5000, debug=True)
