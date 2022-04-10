import boto3
import botocore
from decimal import Decimal
import time
from boto3.dynamodb.conditions import Key

table = boto3.resource('dynamodb').Table('wind')

def lambda_handler(event, context):

    try:
        response = table.scan(Limit=150)
        return {
            "statusCode": 200,
            "headers": {},
            "body": response['Items']
        }
    except botocore.exceptions.ClientError as e:
        return {
            "statusCode": 500,
            "headers": {},
            "body": str(e)
        }


