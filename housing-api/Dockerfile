# Explicitly satisfying the Python 3.12+ requirement
FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /code

# Copy requirements first to leverage Docker layer caching
COPY ./requirements.txt /code/requirements.txt

# 1. Upgrade pip to ensure latest compatibility
# 2. Add --default-timeout=1000 to handle large package downloads
# 3. Add --retries=10 to handle network instability
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --default-timeout=1000 --retries 10 -r /code/requirements.txt

COPY ./app /code/app

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]