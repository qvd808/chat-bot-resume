# syntax=docker/dockerfile:1.4
FROM continuumio/miniconda3 AS builder

WORKDIR /app

COPY requirements.txt /app

RUN apt update && apt install -y libgl1-mesa-glx

RUN pip install --upgrade pip
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt

COPY . /app

ENTRYPOINT ["python3"]
CMD ["app.py"]

