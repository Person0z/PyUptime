from flask import Flask, jsonify, render_template
import aiohttp
import asyncio
from datetime import datetime
import json

app = Flask(__name__)

# Read list of servers from JSON file
with open('servers.json', 'r') as f:
    servers = json.load(f)

# Dictionary to hold server status
server_status = {}

@app.route('/api/monitor', methods=['GET'])
def monitor():
    # Run the asynchronous function and wait for it to complete
    asyncio.run(check_servers())
    return jsonify(server_status)

async def check_servers():
    # aiohttp works best with a session for multiple requests
    async with aiohttp.ClientSession() as session:
        # Create a list of tasks to run asynchronously
        tasks = [check_server(session, server) for server in servers]
        # Run the tasks and wait for all of them to complete
        await asyncio.gather(*tasks)

async def check_server(session, server):
    try:
        async with session.get(server) as response:
            status = response.status
            if status == 200:
                if server_status.get(server, {}).get('status') != 'running':
                    server_status[server] = {'status': 'running', 'since': datetime.now().isoformat()}
            else:
                if server_status.get(server, {}).get('status') != 'not running':
                    server_status[server] = {'status': 'not running', 'since': datetime.now().isoformat()}
    except:
        if server_status.get(server, {}).get('status') != 'not running':
            server_status[server] = {'status': 'not running', 'since': datetime.now().isoformat()}

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run(debug=True)