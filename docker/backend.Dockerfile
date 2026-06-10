FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY apps/backend/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

COPY apps/backend /app

EXPOSE 8000

CMD ["sh", "-c", "python manage.py migrate && python manage.py seed_e2e_data --silent && gunicorn config.wsgi:application --bind 0.0.0.0:8000"]
