import uuid
from datetime import datetime
from ariadne import MutationType, SubscriptionType, QueryType

mutation = MutationType()
subscription = SubscriptionType()

# Although not requested, adding a base query type to avoid schema errors if needed
# but we are extending Mutation and Subscription in exam.gql
# If there are no queries in this file, we don't need a query object here.

@mutation.field("sendExamMessage")
async def resolve_send_exam_message(_, info, roomId: str, content: str, senderName: str):
    # For now, we don't persist these to DB as per "real-time" focus, 
    # but we could easily add a model if persistence is needed.
    message = {
        "id": str(uuid.uuid4()),
        "roomId": roomId,
        "senderName": senderName,
        "content": content,
        "createdAt": datetime.utcnow()
    }
    
    # Publish to the specific room channel
    pubsub = info.context["pubsub"]
    await pubsub.publish(f"exam_room_{roomId}", {
        "examMessageReceived": message
    })
    
    return message

@subscription.source("examMessageReceived")
async def exam_message_received_source(obj, info, roomId: str):
    pubsub = info.context["pubsub"]
    async with pubsub.subscribe(channel=f"exam_room_{roomId}") as subscriber:
        async for event in subscriber:
            yield event

@subscription.field("examMessageReceived")
def resolve_exam_message_received(payload, info, roomId: str):
    return payload.message["examMessageReceived"]
