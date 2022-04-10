import boto3
import botocore
import json
from decimal import Decimal

table = boto3.resource('dynamodb').Table('wind')

def lambda_handler(event, context):
    sample = json.loads(event["body"])

    try:
        ttl = sample['timestamp']+86400
        sample['ttl'] = ttl
        
        table.put_item(Item=sample)
        return {
            "statusCode": 201,
            "headers": {}
        }
    except botocore.exceptions.ClientError as e:
        return {
            "statusCode": 404,
            "headers": {},
            "body": str(e)
        }


