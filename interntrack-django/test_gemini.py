import urllib.request
import json

# 1. Login to get token
login_data = json.dumps({"email": "etudiant@interntrack.fr", "password": "Etu1234!"}).encode('utf-8')
login_req = urllib.request.Request(
    'http://127.0.0.1:8001/api/v1/auth/login/', 
    data=login_data, 
    headers={'Content-Type': 'application/json'}, 
    method='POST'
)

try:
    with urllib.request.urlopen(login_req) as response:
        login_res = json.loads(response.read().decode('utf-8'))
        token = login_res['access']
        print("Logged in successfully. Token acquired.")
except Exception as e:
    print("Login failed:", e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
    exit(1)

# 2. Test chatbot
chat_data = json.dumps({"message": "Quels sont mes stages et quel est mon statut ?"}).encode('utf-8')
chat_req = urllib.request.Request(
    'http://127.0.0.1:8001/api/v1/chatbot/message/', 
    data=chat_data, 
    headers={
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {token}'
    }, 
    method='POST'
)

try:
    print("Sending message to chatbot...")
    with urllib.request.urlopen(chat_req) as response:
        for line in response:
            line = line.decode('utf-8').strip()
            if line:
                print("RECV:", line)
except Exception as e:
    print("Chatbot failed:", e)
    if hasattr(e, 'read'):
        print(e.read().decode('utf-8'))
