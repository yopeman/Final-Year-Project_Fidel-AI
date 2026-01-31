from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.batch_community import BatchCommunity
from ..model.community_comment import CommunityComment
from ..model.user import User

query = QueryType()
mutation = MutationType()
community_comment = ObjectType("CommunityComment")

# Comment fields
@community_comment.field("community")
def resolve_community(comment_obj, info):
    db: Session = info.context["db"]
    community = db.query(BatchCommunity).filter(BatchCommunity.id == comment_obj.community_id).first()
    return community

@community_comment.field("user")
def resolve_user(comment_obj, info):
    db: Session = info.context["db"]
    user = db.query(User).filter(User.id == comment_obj.user_id).first()
    return user

@community_comment.field("reactions")
def resolve_reactions(comment_obj, info):
    db: Session = info.context["db"]
    from ..model.comment_reactions import CommentReactions
    reactions = db.query(CommentReactions).filter(
        CommentReactions.comment_id == comment_obj.id, 
        CommentReactions.is_deleted == False
    ).all()
    return reactions

@community_comment.field("communityId")
def resolve_community_id(comment_obj, info):
    return comment_obj.community_id

@community_comment.field("userId")
def resolve_user_id(comment_obj, info):
    return comment_obj.user_id

@community_comment.field("isEdited")
def resolve_is_edited(comment_obj, info):
    return comment_obj.is_edited

@community_comment.field("createdAt")
def resolve_created_at(comment_obj, info):
    return comment_obj.created_at

@community_comment.field("updatedAt")
def resolve_updated_at(comment_obj, info):
    return comment_obj.updated_at

@community_comment.field("isDeleted")
def resolve_is_deleted(comment_obj, info):
    return comment_obj.is_deleted

@community_comment.field("deletedAt")
def resolve_deleted_at(comment_obj, info):
    return comment_obj.deleted_at

# Query resolvers
@query.field("comments")
def resolve_comments(_, info, communityId: Optional[str] = None):
    db: Session = info.context["db"]
    query_obj = db.query(CommunityComment).filter(CommunityComment.is_deleted == False)
    
    if communityId:
        query_obj = query_obj.filter(CommunityComment.community_id == communityId)
    
    return query_obj.all()

@query.field("comment")
def resolve_comment(_, info, id: str):
    db: Session = info.context["db"]
    comment = db.query(CommunityComment).filter(
        CommunityComment.id == id, 
        CommunityComment.is_deleted == False
    ).first()
    if not comment:
        raise Exception("Comment not found")
    return comment

# Mutation resolvers
@mutation.field("postComment")
def resolve_post_comment(_, info, communityId: str, content: str):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    
    # Check if community exists
    community = db.query(BatchCommunity).filter(
        BatchCommunity.id == communityId, 
        BatchCommunity.is_deleted == False
    ).first()
    
    if not community:
        raise Exception("Community not found")
    
    comment = CommunityComment(
        community_id=communityId,
        user_id=current_user.id,
        content=content,
        is_edited=False
    )
    
    db.add(comment)
    db.commit()
    db.refresh(comment)
    
    # Trigger subscription update
    info.context["pubsub"].publish(f"batch_{community.batch_id}", {
        "communityUpdated": community
    })
    
    return comment

@mutation.field("updateComment")
def resolve_update_comment(_, info, id: str, content: str):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    comment = db.query(CommunityComment).filter(
        CommunityComment.id == id, 
        CommunityComment.is_deleted == False
    ).first()
    
    if not comment:
        raise Exception("Comment not found")
    
    if comment.user_id != current_user.id:
        raise Exception("Not authorized to update this comment")
    
    comment.content = content
    comment.is_edited = True
    comment.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(comment)
    
    # Trigger subscription update
    community = db.query(BatchCommunity).filter(BatchCommunity.id == comment.community_id).first()
    if community:
        info.context["pubsub"].publish(f"batch_{community.batch_id}", {
            "communityUpdated": community
        })
    
    return comment

@mutation.field("deleteComment")
def resolve_delete_comment(_, info, id: str):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    comment = db.query(CommunityComment).filter(
        CommunityComment.id == id, 
        CommunityComment.is_deleted == False
    ).first()
    
    if not comment:
        raise Exception("Comment not found")
    
    if comment.user_id != current_user.id:
        raise Exception("Not authorized to delete this comment")
    
    comment.is_deleted = True
    comment.deleted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(comment)
    
    # Trigger subscription update
    community = db.query(BatchCommunity).filter(BatchCommunity.id == comment.community_id).first()
    if community:
        info.context["pubsub"].publish(f"batch_{community.batch_id}", {
            "communityUpdated": community
        })
    
    return True