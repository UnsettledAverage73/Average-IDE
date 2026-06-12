import tkinter as tk
from tkinter import messagebox
import webbrowser
import sys

def show_ollama_prompt():
    root = tk.Tk()
    root.withdraw()  # Hide main window
    
    msg = "Average IDE requires Ollama to run local AI models.\n\nOllama was not detected on your system.\n\nWould you like to visit ollama.com to download it?"
    if messagebox.askyesno("Ollama Not Found", msg):
        webbrowser.open("https://ollama.com/download")
    
    root.destroy()
    sys.exit(1)

if __name__ == "__main__":
    show_ollama_prompt()
