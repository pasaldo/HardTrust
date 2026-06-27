# Endpoints HardTrust

Base: `http://127.0.0.1:8000/api/listings/`

## Públicos

- `GET /categories/`
- `GET /conditions/`
- `GET /brands/`
- `GET /browse/` (alias de listings)
- `GET /listings/` (query params: category, condition, hardware_type, brand, model, min_price, max_price, seller, etc.)
- `GET /listings/<id>/`
- `GET /assets/listings/<filename>`

## Protegidos (requieren Bearer token)

- `GET /saved/` — lista de guardados del usuario
- `POST /saved/toggle/<listing_id>/` — guarda / des-guarda
- `DELETE /saved/<saved_id>/` — elimina un guardado específico
- `POST /my-listings/<id>/mark-sold/` — marca publicación como vendida
- `PATCH /my-listings/<id>/update/` — modifica datos de la publicación
- `DELETE /my-listings/<id>/delete/` — elimina la publicación

## Tests rápidos (Python)

```python
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'hardtrust_project.settings')
import django
django.setup()
from apps.users.models import HardUser
from rest_framework_simplejwt.tokens import RefreshToken
import requests

base = 'http://127.0.0.1:8000/api/listings'
user = HardUser.objects.get(email='comprador@test.cl')
token = str(RefreshToken.for_user(user).access_token)
headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

# Toggle guardado
r = requests.post(f'{base}/saved/toggle/13/', headers=headers)
print(r.json())

# Listar guardados
r = requests.get(f'{base}/saved/', headers=headers)
print(len(r.json()))

# Eliminar guardado
saved_id = r.json()[0]['id']
r = requests.delete(f'{base}/saved/{saved_id}/', headers=headers)
print(r.status_code)

# Marcar como vendida (requiere ser seller del listing)
seller = HardUser.objects.get(email='vendedor@test.cl')
seller_token = str(RefreshToken.for_user(seller).access_token)
r = requests.post(f'{base}/my-listings/1/mark-sold/', headers={'Authorization': f'Bearer {seller_token}'})
print(r.json())

# Modificar título
r = requests.patch(f'{base}/my-listings/1/update/', headers={'Authorization': f'Bearer {seller_token}'}, json={'title': 'Nuevo título'})
print(r.json().get('title'))
```
