FROM pytorch/pytorch:latest
COPY . /app
WORKDIR /app
RUN apt-get update && apt-get upgrade -y
RUN apt-get install -y cmake gcc g++ python3-dev musl-dev libgl1-mesa-glx libglib2.0-0 libsm6 libxrender1 libxext6
RUN pip install --upgrade pip
RUN pip install -r requirements.txt
RUN pip freeze > test.txt
ENTRYPOINT ["python"]
CMD ["main.py"]

EXPOSE 8000