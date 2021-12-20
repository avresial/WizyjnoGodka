FROM python:3

COPY requirements.txt .

RUN ls | pwd

RUN pip install -r ./requirements.txt

COPY . .

EXPOSE 8000

CMD ["python", "./main.py"]
