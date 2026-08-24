import os

import uvicorn

from main import app

if __name__ == "__main__":
    # Hugging Face Spaces (Gradio SDK) expects the app to serve on port 7860
    uvicorn.run(app, host="0.0.0.0", port=int(os.getenv("PORT", "7860")))
