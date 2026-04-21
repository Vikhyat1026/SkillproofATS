# Use a slim Python image for lower memory footprint
FROM python:3.9-slim

# Set the working directory
WORKDIR /code

# Install system dependencies if any (none really needed for ONNX on CPU)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Copy the rest of the backend code
COPY . /code

# Expose the default port for local testing
EXPOSE 8000

# Command to run the application (Bind to 0.0.0.0 and use $PORT variable for cloud platforms)
CMD ["sh", "-c", "gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:${PORT:-8000}"]
