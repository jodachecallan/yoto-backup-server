"""Start the local Yoto library and open it in a browser."""

import socket
import sys
import threading
import time
import webbrowser

HOST = "127.0.0.1"
PORT_START = 8765
PORT_TRIES = 20


def pick_port():
    for port in range(PORT_START, PORT_START + PORT_TRIES):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            try:
                sock.bind((HOST, port))
            except OSError:
                continue
            return port
    raise RuntimeError(
        f"No free port between {PORT_START} and {PORT_START + PORT_TRIES - 1}."
    )


def main():
    import uvicorn

    from server import app

    port = pick_port()
    url = f"http://{HOST}:{port}"
    print(f"Yoto library at {url}")
    print("Close this window to stop the app.")

    def open_browser():
        time.sleep(0.7)
        webbrowser.open(url)

    threading.Thread(target=open_browser, daemon=True).start()
    uvicorn.run(app, host=HOST, port=port, log_level="info")


if __name__ == "__main__":
    import multiprocessing

    multiprocessing.freeze_support()
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(0)
