# HardTrust Deployment Guide

## Prerequisites
- Windows 10/11
- Python 3.13
- Node.js 20+
- Git

## Local Deployment
1. Open a terminal in the project root.
2. Run `deploy/deploy.bat`.
3. Access:
   - Backend: http://127.0.0.1:8000
   - ML Service: http://127.0.0.1:8001
   - Frontend: http://127.0.0.1:4200

## CI/CD
The workflow `.github/workflows/ci.yml` runs automatically on push to `master` or `main`.

## Production Checklist
- Set `DEBUG=False` in environment
- Configure `ALLOWED_HOSTS`
- Use PostgreSQL instead of SQLite
- Set `SECRET_KEY` securely
- Enable HTTPS and proper CORS
