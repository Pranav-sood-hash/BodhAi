import boto3
import json
import os
import logging
from dotenv import load_dotenv

# Step 6: Load environment variables
load_dotenv()

# Step 9: Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Step 2: Initialize Bedrock client
try:
    bedrock = boto3.client(
        service_name="bedrock-runtime",
        region_name=os.getenv("AWS_DEFAULT_REGION", "us-east-1"),
        aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
        aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY")
    )
except Exception as e:
    logger.error(f"Failed to initialize Bedrock client: {e}")
    bedrock = None

def generate_bedrock_response(prompt):
    """
    Step 3: Invoke Amazon Bedrock (Claude v2)
    Accepts prompt text, sends request, returns generated text.
    """
    if not bedrock:
        logger.error("Bedrock client not initialized")
        return None

    # Step 9: Log prompt sent to model
    logger.info(f"Prompt sent to Bedrock: {prompt}")

    try:
        # Step 3: Claude v2 request structure
        body = json.dumps({
            "prompt": f"\n\nHuman: {prompt}\n\nAssistant:",
            "max_tokens_to_sample": 500,
            "temperature": 0.5,
            "top_p": 0.9,
        })

        model_id = "anthropic.claude-3-haiku-20240307-v1:0"
        
        response = bedrock.invoke_model(
            body=body,
            modelId=model_id,
            accept="application/json",
            contentType="application/json"
        )

        response_body = json.loads(response.get("body").read())
        # Claude v2 returns completion in 'completion' field
        generated_text = response_body.get("completion", "").strip()

        # Step 9: Log response received
        logger.info(f"Response received from Bedrock: {generated_text}")
        
        return generated_text

    except Exception as e:
        # Step 9: Log errors
        logger.error(f"Error calling Bedrock: {e}")
        return None
