# syntax=docker/dockerfile:1.4
FROM continuumio/miniconda3 AS builder

WORKDIR /app

COPY requirements.txt /app
# RUN <<EOF
# apk update
# apk add git
# apk add cmake
# EOF
RUN --mount=type=cache,target=/root/.cache/pip \
    pip3 install -r requirements.txt

COPY . /app

ENTRYPOINT ["python3"]
CMD ["app.py"]