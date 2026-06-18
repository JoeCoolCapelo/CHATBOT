import urllib.request, urllib.error
req = urllib.request.Request('http://127.0.0.1:8000/api/v1/auth/login/', data=b'{"email":"etudiant@interntrack.fr","password":"Etu1234!"}', headers={'Content-Type':'application/json'}, method='POST')
try:
    res = urllib.request.urlopen(req)
    print("Success:", res.read())
except urllib.error.HTTPError as e:
    print("Error HTTP", e.code)
    print(e.read().decode('utf-8'))
except Exception as e:
    print("Other error:", str(e))
