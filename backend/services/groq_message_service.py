import os
from groq import Groq

def generate_message_with_groq(context: dict) -> str:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        raise Exception("GROQ_API_KEY not found in environment")

    client = Groq(api_key=api_key)

    system_prompt = (
        "You generate short public safety SMS alerts. "
        "Tone must be calm, neutral, and advisory. "
        "Do NOT create panic. "
        "Maximum 30 words."
    )

    user_prompt = f"""
    Area: {context['zone']}
    Incident Type: {context['crime_type']}
    Risk Level: {context['risk']}
    Event Context: {context.get('event', 'None')}
    """

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.4,
        max_tokens=60
    )

    return response.choices[0].message.content.strip()
