from fastapi import FastAPI
from pydantic import BaseModel
import torch
from transformers import BertTokenizer, BertForSequenceClassification
from transformers import BartTokenizer, BartForConditionalGeneration

app = FastAPI()

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Load models
bert_tokenizer = BertTokenizer.from_pretrained("models/bert-emotion")
bert_model = BertForSequenceClassification.from_pretrained("models/bert-emotion").to(DEVICE)

bart_tokenizer = BartTokenizer.from_pretrained("models/bart-response")
bart_model = BartForConditionalGeneration.from_pretrained("models/bart-response").to(DEVICE)


class InputText(BaseModel):
    text: str


def predict_emotion(text):
    inputs = bert_tokenizer(text, return_tensors="pt", truncation=True, padding=True).to(DEVICE)
    outputs = bert_model(**inputs)
    pred = torch.argmax(outputs.logits, dim=1).item()
    return pred


def generate_response(text):
    inputs = bart_tokenizer(text, return_tensors="pt", truncation=True, padding=True).to(DEVICE)

    output_ids = bart_model.generate(
        inputs["input_ids"],
        max_length=100,
        num_beams=4
    )

    return bart_tokenizer.decode(output_ids[0], skip_special_tokens=True)


@app.post("/")

@app.post("/predict")
def predict(data: InputText):
    emotion = predict_emotion(data.text)
    response = generate_response(data.text)

    return {
        "emotion": emotion,
        "response": response
    }