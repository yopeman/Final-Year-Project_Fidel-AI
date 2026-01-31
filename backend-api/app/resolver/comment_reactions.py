from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.community_comment import CommunityComment
from ..model.comment_reactions import CommentReactions, ReactionType
from ..model.user import User

query = QueryType()
mutation = MutationType()
comment_reactions = ObjectType("CommentReactions")

# Reaction fields
@comment_reactions.field("id")
def resolve_id(reaction_obj, info):
    return reaction_obj.id

@comment_reactions.field("userId")
def resolve_user_id(reaction_obj, info):
    return reaction_obj.user_id

@comment_reactions.field("commentId")
def resolve_comment_id(reaction_obj, info):
    return reaction_obj.comment_id

@comment_reactions.field("reactionType")
def resolve_reaction_type(reaction_obj, info):
    return reaction_obj.reaction_type.value.upper()

@comment_reactions.field("createdAt")
def resolve_created_at(reaction_obj, info):
    return reaction_obj.created_at

@comment_reactions.field("updatedAt")
def resolve_updated_at(reaction_obj, info):
    return reaction_obj.updated_at

@comment_reactions.field("isDeleted")
def resolve_is_deleted(reaction_obj, info):
    return reaction_obj.is_deleted

@comment_reactions.field("deletedAt")
def resolve_deleted_at(reaction_obj, info):
    return reaction_obj.deleted_at

@comment_reactions.field("user")
def resolve_user(reaction_obj, info):
    db: Session = info.context["db"]
    user = db.query(User).filter(User.id == reaction_obj.user_id).first()
    return user

@comment_reactions.field("comment")
def resolve_comment(reaction_obj, info):
    db: Session = info.context["db"]
    from ..model.community_comment import CommunityComment
    comment = db.query(CommunityComment).filter(CommunityComment.id == reaction_obj.comment_id).first()
    return comment

# Query resolvers
@query.field("commentReactions")
def resolve_comment_reactions(_, info, commentId: Optional[str] = None, userId: Optional[str] = None):
    db: Session = info.context["db"]
    query_obj = db.query(CommentReactions).filter(CommentReactions.is_deleted == False)
    
    if commentId:
        query_obj = query_obj.filter(CommentReactions.comment_id == commentId)
    
    if userId:
        query_obj = query_obj.filter(CommentReactions.user_id == userId)
    
    return query_obj.all()

@query.field("commentReaction")
def resolve_comment_reaction(_, info, id: str):
    db: Session = info.context["db"]
    reaction = db.query(CommentReactions).filter(
        CommentReactions.id == id, 
        CommentReactions.is_deleted == False
    ).first()
    if not reaction:
        raise Exception("Reaction not found")
    return reaction

# Mutation resolvers
@mutation.field("postCommentReaction")
def resolve_post_comment_reaction(_, info, commentId: str, reactionType: str):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    
    # Check if comment exists
    comment = db.query(CommunityComment).filter(
        CommunityComment.id == commentId, 
        CommunityComment.is_deleted == False
    ).first()
    
    if not comment:
        raise Exception("Comment not found")
    
    # Check if user already has a reaction for this comment
    existing_reaction = db.query(CommentReactions).filter(
        CommentReactions.user_id == current_user.id,
        CommentReactions.comment_id == commentId,
        CommentReactions.is_deleted == False
    ).first()
    
    if existing_reaction:
        # Update existing reaction
        existing_reaction.reaction_type = ReactionType(reactionType.lower())
        existing_reaction.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_reaction)
        
        # Trigger subscription update
        community = db.query(CommunityComment).filter(CommunityComment.id == comment.community_id).first()
        if community:
            info.context["pubsub"].publish(f"batch_{community.batch_id}", {
                "communityUpdated": community
            })
        
        return existing_reaction
    
    # Create new reaction
    reaction = CommentReactions(
        user_id=current_user.id,
        comment_id=commentId,
        reaction_type=ReactionType(reactionType.lower())
    )
    
    db.add(reaction)
    db.commit()
    db.refresh(reaction)
    
    # Trigger subscription update
    community = db.query(CommunityComment).filter(CommunityComment.id == comment.community_id).first()
    if community:
        info.context["pubsub"].publish(f"batch_{community.batch_id}", {
            "communityUpdated": community
        })
    
    return reaction

@mutation.field("updateCommentReaction")
def resolve_update_comment_reaction(_, info, id: str, reactionType: str):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    reaction = db.query(CommentReactions).filter(
        CommentReactions.id == id, 
        CommentReactions.is_deleted == False
    ).first()
    
    if not reaction:
        raise Exception("Reaction not found")
    
    if reaction.user_id != current_user.id:
        raise Exception("Not authorized to update this reaction")
    
    reaction.reaction_type = ReactionType(reactionType.lower())
    reaction.updated_at = datetime.utcnow()
    
    db.commit()
    db.refresh(reaction)
    
    # Trigger subscription update
    comment = db.query(CommunityComment).filter(CommunityComment.id == reaction.comment_id).first()
    if comment:
        community = db.query(CommunityComment).filter(CommunityComment.id == comment.community_id).first()
        if community:
            info.context["pubsub"].publish(f"batch_{community.batch_id}", {
                "communityUpdated": community
            })
    
    return reaction

@mutation.field("deleteCommentReaction")
def resolve_delete_comment_reaction(_, info, id: str):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    reaction = db.query(CommentReactions).filter(
        CommentReactions.id == id, 
        CommentReactions.is_deleted == False
    ).first()
    
    if not reaction:
        raise Exception("Reaction not found")
    
    if reaction.user_id != current_user.id:
        raise Exception("Not authorized to delete this reaction")
    
    reaction.is_deleted = True
    reaction.deleted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(reaction)
    
    # Trigger subscription update
    comment = db.query(CommunityComment).filter(CommunityComment.id == reaction.comment_id).first()
    if comment:
        community = db.query(CommunityComment).filter(CommunityComment.id == comment.community_id).first()
        if community:
            info.context["pubsub"].publish(f"batch_{community.batch_id}", {
                "communityUpdated": community
            })
    
    return True