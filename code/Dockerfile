# Use an official Python runtime as a parent image
FROM python:3.11-slim-buster

# Set the working directory in the container
WORKDIR /code

# Copy the requirements file into the container at /code
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Install netcat for waiting on the database port
# netcat-traditional is used for compatibility across different Linux distributions
RUN apt-get update && apt-get install -y netcat-traditional && rm -rf /var/lib/apt/lists/*

# Copy the rest of the application code into the container at /code
COPY . .

# Expose the port that Uvicorn will run on
EXPOSE 80

# Command to run the application using Uvicorn
# Add a loop to wait for the database to be ready before starting Uvicorn.
# This checks if port 5432 on the 'db' service is open.
CMD /bin/bash -c " \
    echo 'Waiting for PostgreSQL to be ready...' && \
    while ! nc -z db 5432; do \
      echo 'PostgreSQL not ready yet, sleeping...'; \
      sleep 1; \
    done; \
    echo 'PostgreSQL is ready. Starting FastAPI app...' && \
    uvicorn main:app --app-dir awesome-project --host 0.0.0.0 --port 80 \
"

# # Use an official Python runtime as a parent image
# FROM python:3.11-slim-buster

# # Set the working directory in the container
# WORKDIR /code

# # Copy the requirements file into the container at /app
# COPY requirements.txt .

# # Install any needed packages specified in requirements.txt
# RUN pip install --no-cache-dir -r requirements.txt

# # Copy the rest of the application code into the container at /app
# COPY . .

# # Expose the port that Uvicorn will run on
# EXPOSE 80

# # Command to run the application using Uvicorn
# CMD ["uvicorn", "main:app", "--app-dir", "awesome-project", "--host", "0.0.0.0", "--port", "80"]