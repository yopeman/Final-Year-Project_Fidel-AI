from datetime import datetime
from ariadne import ObjectType, QueryType
from sqlalchemy.orm import Session
from ..model.subscription import Subscription, PlanType, SubscriptionStatus

query = QueryType()
subscription = ObjectType("Subscription")

@query.field("mySubscription")
def resolve_my_subscription(_, info):
    current_user = info.context.get("current_user")
    if not current_user:
        return None
    
    db: Session = info.context["db"]
    sub = db.query(Subscription).filter(
        Subscription.user_id == current_user.id,
        Subscription.is_deleted == False
    ).first()
    
    return sub

@subscription.field("features")
def resolve_features(obj, info):
    return obj.features if obj.features else []

@subscription.field("id")
def resolve_id(obj, info):
    return obj.id

@subscription.field("planType")
def resolve_plan_type(obj, info):
    return obj.plan_type.value

@subscription.field("status")
def resolve_status(obj, info):
    return obj.status.value

@subscription.field("startDate")
def resolve_start_date(obj, info):
    return obj.start_date.isoformat() if obj.start_date else None

@subscription.field("endDate")
def resolve_end_date(obj, info):
    return obj.end_date.isoformat() if obj.end_date else None

@subscription.field("paymentId")
def resolve_payment_id(obj, info):
    return obj.payment_id

@subscription.field("createdAt")
def resolve_created_at(obj, info):
    return obj.created_at.isoformat() if obj.created_at else None

@subscription.field("updatedAt")
def resolve_updated_at(obj, info):
    return obj.updated_at.isoformat() if obj.updated_at else None
