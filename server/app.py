import os
import sys
import json
import urllib.request
import urllib.error

from flask import Flask, jsonify, send_from_directory, request, abort

APP_DIR = os.path.dirname(os.path.abspath(__file__))
DIST_DIR = os.path.dirname(APP_DIR)

app = Flask(__name__, static_folder=DIST_DIR, static_url_path='')

PORT = int(os.environ.get('PORT', 5780))
GITEE_API_BASE = 'https://gitee.com/api/v5'
GITEE_ORG_NAME = os.environ.get('GITEE_ORG_NAME', 'byusistudio')
GITEE_ACCESS_TOKEN = os.environ.get('GITEE_ACCESS_TOKEN')

def fetch_from_gitee(url):
    headers = {
        'User-Agent': 'ByUsi-Backend/1.0',
        'Accept': 'application/json',
    }
    req = urllib.request.Request(url, headers=headers)
    try:
        with urllib.request.urlopen(req) as response:
            data = response.read().decode('utf-8')
            return json.loads(data)
    except urllib.error.HTTPError as e:
        raise Exception(f'Gitee API request failed: {e.code}')
    except urllib.error.URLError as e:
        raise Exception(f'Gitee API request failed: {e.reason}')

@app.route('/api/repos')
def get_repos():
    try:
        if not GITEE_ACCESS_TOKEN:
            return jsonify({'error': 'Gitee access token not configured'}), 500
        
        url = f'{GITEE_API_BASE}/orgs/{GITEE_ORG_NAME}/repos?type=all&page=1&per_page=100&access_token={GITEE_ACCESS_TOKEN}'
        data = fetch_from_gitee(url)
        return jsonify(data)
    except Exception as error:
        print(f'Error fetching repos: {error}', file=sys.stderr)
        return jsonify({'error': 'Failed to fetch repos'}), 500

@app.route('/api/repos/<path:full_name>/readme')
def get_readme(full_name):
    try:
        if not GITEE_ACCESS_TOKEN:
            return jsonify({'error': 'Gitee access token not configured'}), 500
        
        url = f'{GITEE_API_BASE}/repos/{full_name}/readme?access_token={GITEE_ACCESS_TOKEN}'
        data = fetch_from_gitee(url)
        data['repoFullName'] = full_name
        return jsonify(data)
    except Exception as error:
        print(f'Error fetching README for {full_name}: {error}', file=sys.stderr)
        return jsonify({'error': 'Failed to fetch README'}), 500

@app.route('/error.html')
def error_page():
    try:
        return send_from_directory(DIST_DIR, 'error.html')
    except Exception as e:
        print(f'Error serving error.html: {e}', file=sys.stderr)
        abort(404)

@app.route('/')
def index():
    try:
        return send_from_directory(DIST_DIR, 'index.html')
    except Exception as e:
        print(f'Error serving index.html: {e}', file=sys.stderr)
        abort(404)

@app.route('/<path:path>')
def static_files(path):
    try:
        return send_from_directory(DIST_DIR, path)
    except Exception:
        if '.' in path:
            abort(404)
        return send_from_directory(DIST_DIR, 'index.html')

if __name__ == '__main__':
    print(f'Server is running on http://0.0.0.0:{PORT}')
    app.run(host='0.0.0.0', port=PORT, debug=False)