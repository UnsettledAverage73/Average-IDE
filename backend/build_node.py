import PyInstaller.__main__
import os
import sys

def build():
    # Detect platform
    platform = sys.platform
    
    params = [
        'main.py',
        '--name=average-node',
        '--onefile',
        '--clean',
        '--add-data=mcp_server:mcp_server',
        '--add-data=routers:routers',
        '--add-data=services:services',
        '--add-data=prompts:prompts',
    ]
    
    if platform == 'win32':
        params.append('--icon=icon.ico')
    
    PyInstaller.__main__.run(params)

if __name__ == '__main__':
    build()
