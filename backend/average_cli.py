import qrcode
import uuid
import os
import argparse
import sys
import asyncio
import subprocess
from relay_client import start_relay_client

def generate_qr(node_id):
    qr = qrcode.QRCode(version=1, box_size=1, border=2)
    # The QR contains a JSON with connection details for the app
    data = f"AVERAGE_NODE:{node_id}"
    qr.add_data(data)
    qr.make(fit=True)
    
    # Print to terminal
    qr.print_ascii(invert=True)
    print(f"\n--- AVERAGE SYSTEM NODE ---")
    print(f"NODE ID: {node_id}")
    print(f"---------------------------\n")
    print("Scan this QR code in the Average Mobile App to pair instantly.\n")

async def main():
    parser = argparse.ArgumentParser(description="Average System Node CLI")
    parser.add_argument("--id", help="Manually set Node ID")
    parser.add_argument("--relay", default="ws://localhost:3000", help="Relay server URL")
    args = parser.parse_args()

    node_id = args.id or f"average-node-{str(uuid.uuid4())[:8]}"
    
    # 1. Generate QR Code
    generate_qr(node_id)
    
    # 2. Start Relay Client
    print(f"Starting relay client for {node_id}...")
    try:
        await start_relay_client(args.relay, node_id)
    except KeyboardInterrupt:
        print("\nNode shutting down.")

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass
