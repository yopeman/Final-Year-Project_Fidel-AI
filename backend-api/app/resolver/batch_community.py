from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType, SubscriptionType
from sqlalchemy.orm import Session

from ..model.batch_community import BatchCommunity
from ..model.community_attachment_files import CommunityAttachmentFiles
from ..model.community_comment import CommunityComment
from ..model.community_reactions import CommunityReactions
from ..model.user import User
from ..util.auth import get_current_user
from ..util.email_service import send_notification

query = QueryType()
mutation = MutationType()
subscription = SubscriptionType()
batch_community = ObjectType("BatchCommunity")

# Community fields
@batch_community.field("batch")
def resolve_batch(community_obj, info):
    db: Session = info.context["db"]
    batch = db.query(BatchCommunity).filter(BatchCommunity.id == community_obj.batch_id).first()
    return batch.batch if batch else None

@batch_community.field("batchId")
def resolve_batch_id(community_obj, info):
    return community_obj.batch_id

@batch_community.field("userId")
def resolve_user_id(community_obj, info):
    return community_obj.user_id

@batch_community.field("isEdited")
def resolve_is_edited(community_obj, info):
    return community_obj.is_edited

@batch_community.field("createdAt")
def resolve_created_at(community_obj, info):
    return community_obj.created_at

@batch_community.field("updatedAt")
def resolve_updated_at(community_obj, info):
    return community_obj.updated_at

@batch_community.field("isDeleted")
def resolve_is_deleted(community_obj, info):
    return community_obj.is_deleted

@batch_community.field("deletedAt")
def resolve_deleted_at(community_obj, info):
    return community_obj.deleted_at


@batch_community.field("user")
def resolve_user(community_obj, info):
    db: Session = info.context["db"]
    user = db.query(User).filter(User.id == community_obj.user_id).first()
    return user

@batch_community.field("reactions")
def resolve_reactions(community_obj, info):
    db: Session = info.context["db"]
    reactions = db.query(CommunityReactions).filter(CommunityReactions.community_id == community_obj.id).all()
    return reactions

@batch_community.field("comments")
def resolve_comments(community_obj, info):
    db: Session = info.context["db"]
    comments = db.query(CommunityComment).filter(CommunityComment.community_id == community_obj.id).all()
    return comments

@batch_community.field("attachments")
def resolve_attachments(community_obj, info):
    db: Session = info.context["db"]
    attachments = db.query(CommunityAttachmentFiles).filter(CommunityAttachmentFiles.community_id == community_obj.id).all()
    return attachments

# Query resolvers
@query.field("communities")
def resolve_communities(_, info, batchId: Optional[str] = None):
    db: Session = info.context["db"]
    query_obj = db.query(BatchCommunity).filter(BatchCommunity.is_deleted == False)
    
    if batchId:
        query_obj = query_obj.filter(BatchCommunity.batch_id == batchId)
    
    return query_obj.all()

@query.field("community")
def resolve_community(_, info, id: str):
    db: Session = info.context["db"]
    community = db.query(BatchCommunity).filter(BatchCommunity.id == id, BatchCommunity.is_deleted == False).first()
    if not community:
        raise Exception("Community not found")
    return community

# Mutation resolvers
@mutation.field("postCommunity")
async def resolve_post_community(_, info, batchId: str, content: str):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    
    new_community = BatchCommunity(
        batch_id=batchId,
        user_id=current_user.id,
        content=content,
        is_edited=False
    )
    
    db.add(new_community)
    db.commit()
    db.refresh(new_community)
    
    # Send notification to all batch members about new community post
    from ..model.batch import Batch
    from ..model.batch_enrollment import BatchEnrollment, EnrollmentStatus
    from ..model.student_profile import StudentProfile
    
    batch = db.query(Batch).filter(Batch.id == batchId, Batch.is_deleted == False).first()
    if batch:
        # Get all enrolled students in the batch
        enrollments = db.query(BatchEnrollment).filter(
            BatchEnrollment.batch_id == batchId,
            BatchEnrollment.status == EnrollmentStatus.enrolled,
            BatchEnrollment.is_deleted == False
        ).all()
        
        for enrollment in enrollments:
            profile = db.query(StudentProfile).filter(
                StudentProfile.id == enrollment.profile_id,
                StudentProfile.is_deleted == False
            ).first()
            
            if profile and profile.user_id != current_user.id:  # Don't notify the author
                send_notification(
                    user_id=profile.user_id,
                    title="New Community Post",
                    content=f"{current_user.first_name} {current_user.last_name} has posted a new message in the '{batch.name}' community. Check it out and join the conversation!",
                    db=db
                )
    
    # Trigger subscription update
    await info.context["pubsub"].publish(f"batch_{batchId}", {
        "communityUpdated": new_community
    })
    
    return new_community

@mutation.field("updateCommunity")
async def resolve_update_community(_, info, id: str, content: str):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    community = db.query(BatchCommunity).filter(BatchCommunity.id == id, BatchCommunity.is_deleted == False).first()
    
    if not community:
        raise Exception("Community not found")
    
    if community.user_id != current_user.id:
        raise Exception("Not authorized to update this community")
    
    old_content = community.content
    community.content = content
    community.is_edited = True
    community.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(community)
    
    # Send notification to all batch members about community post update
    from ..model.batch import Batch
    from ..model.batch_enrollment import BatchEnrollment, EnrollmentStatus
    from ..model.student_profile import StudentProfile
    
    batch = db.query(Batch).filter(Batch.id == community.batch_id, Batch.is_deleted == False).first()
    if batch:
        # Get all enrolled students in the batch
        enrollments = db.query(BatchEnrollment).filter(
            BatchEnrollment.batch_id == community.batch_id,
            BatchEnrollment.status == EnrollmentStatus.enrolled,
            BatchEnrollment.is_deleted == False
        ).all()
        
        for enrollment in enrollments:
            profile = db.query(StudentProfile).filter(
                StudentProfile.id == enrollment.profile_id,
                StudentProfile.is_deleted == False
            ).first()
            
            if profile and profile.user_id != current_user.id:  # Don't notify the author
                send_notification(
                    user_id=profile.user_id,
                    title="Community Post Updated",
                    content=f"{current_user.first_name} {current_user.last_name} has updated their post in the '{batch.name}' community. Check it out to see the latest changes!",
                    db=db
                )
    
    # Trigger subscription update
    await info.context["pubsub"].publish(f"batch_{community.batch_id}", {
        "communityUpdated": community
    })
    
    return community

@mutation.field("deleteCommunity")
async def resolve_delete_community(_, info, id: str):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    community = db.query(BatchCommunity).filter(BatchCommunity.id == id, BatchCommunity.is_deleted == False).first()
    
    if not community:
        raise Exception("Community not found")
    
    if community.user_id != current_user.id:
        raise Exception("Not authorized to delete this community")
    
    community.is_deleted = True
    community.deleted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(community)
    
    # Send notification to all batch members about community post deletion
    from ..model.batch import Batch
    from ..model.batch_enrollment import BatchEnrollment, EnrollmentStatus
    from ..model.student_profile import StudentProfile
    
    batch = db.query(Batch).filter(Batch.id == community.batch_id, Batch.is_deleted == False).first()
    if batch:
        # Get all enrolled students in the batch
        enrollments = db.query(BatchEnrollment).filter(
            BatchEnrollment.batch_id == community.batch_id,
            BatchEnrollment.status == EnrollmentStatus.enrolled,
            BatchEnrollment.is_deleted == False
        ).all()
        
        for enrollment in enrollments:
            profile = db.query(StudentProfile).filter(
                StudentProfile.id == enrollment.profile_id,
                StudentProfile.is_deleted == False
            ).first()
            
            if profile and profile.user_id != current_user.id:  # Don't notify the author
                send_notification(
                    user_id=profile.user_id,
                    title="Community Post Deleted",
                    content=f"{current_user.first_name} {current_user.last_name} has deleted their post in the '{batch.name}' community.",
                    db=db
                )
    
    # Trigger subscription update
    await info.context["pubsub"].publish(f"batch_{community.batch_id}", {
        "communityUpdated": community
    })
    
    return True

# Subscription resolver
@subscription.source("communityUpdated")
async def community_updated_generator(obj, info, batchId: str):
    # This will be called when the subscription is established
    # The actual publishing happens in the mutation resolvers
    pubsub = info.context["pubsub"]
    async with pubsub.subscribe(channel=f"batch_{batchId}") as subscriber:
        async for event in subscriber:
            yield event

@subscription.field("communityUpdated")
def resolve_community_updated(payload, info, batchId:str=None):
    # This resolves the actual payload when an update is published
    return payload.message["communityUpdated"]