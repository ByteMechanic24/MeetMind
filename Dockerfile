# Build the React frontend and package it with the Python backend.

# Frontend build stage
FROM node:20-alpine AS frontend-build
WORKDIR /app/frontend
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Backend stage
FROM python:3.12-slim
WORKDIR /app

# System dependencies for ffmpeg/python packages if needed
RUN apt-get update \
    && apt-get install -y --no-install-recommends git ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Python dependencies
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Application source
COPY ./*.py ./
COPY core/ ./core/
COPY utils/ ./utils/

# Copy built frontend from the previous stage
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

# Expose the default port for Render and local deployment
EXPOSE 8000

CMD ["uvicorn", "api:app", "--host", "0.0.0.0", "--port", "8000"]
