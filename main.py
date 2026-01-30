import webview
import threading
import sys
import os
from backend.server import create_app

def start_server():
    """Starts the Flask server."""
    app = create_app()
    app.run(port=5000, threaded=True)

if __name__ == '__main__':
    # Start the Flask server in a daemon thread
    t = threading.Thread(target=start_server)
    t.daemon = True
    t.start()

    # Create the window
    # Point to the local Flask server
    webview.create_window(
        'Future Weaver', 
        'http://localhost:5000',
        width=1280,
        height=800,
        resizable=True
    )

    # Start the GUI loop
    webview.start()
