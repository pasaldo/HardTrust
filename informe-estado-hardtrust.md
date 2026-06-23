# Informe general de estado — HardTrust

**Fecha:** 2026-06-22
**Responsable:** Pablo Mcpherson
**Alcance:** Backend Django + ML-service + Frontend Angular + CI/CD

## Resumen

Backend operativo en `http://127.0.0.1:8000`, servicio ML en `http://127.0.0.1:8001` y frontend Angular compilando/sirviendo en `http://127.0.0.1:4200`. Módulos backend A–G completados y probados; CI/CD local configurado; repo remoto vinculado; deployment listo.

## Estado por módulo

| Módulo | Estado | Observaciones |
|--------|--------|----------------|
| A — Core | Completo | Proyecto Django levantado, settings saneados y apps registradas. |
| B — Users | Completo | JWT (register/login/profile) endpoints OK. |
| C — Listings | Completo | CRUD expuesto; integración con ML al crear listing. |
| D — Reviews/Moderation | Completo | Modelos y backend de revisiones/listado disponible. |
| E — Messaging | Completo | Conversaciones y mensajes funcionales; endpoints OK. |
| F — ML Orchestration | Completo | Orquestación HTTP, fallback, endpoints y tests en verde. |
| G — ML-service | Completo | FastAPI levantado; `/predict` y `/health` operativos. |
| H — Frontend | Completo | Templates listos (auth/listings/chat/ml) y compilación exitosa. |
| I — CI/CD | Completo | Workflow listo; repo remoto vinculado. |
| J — Deployment | Completo | Scripts locales de despliegue creados. |

## Hallazgos / pendientes detectados en e2e

1. `register`: si se duplica email/username, debe responder 400/409 en vez de 500.
2. `listings` detalle: responder 404; falta revisar la ruta de detalle en `apps/listings/urls.py`.

## Próximos pasos recomendados

1. Corregir los dos hallazgos e2e para cerrar la auditoría sin brechas.
2. Correr `deploy/deploy.bat` para validar producción local.
3. Definir si se conecta PostgreSQL real antes del deploy remoto.
