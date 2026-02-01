from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.batch_community import BatchCommunity
from ..model.community_reactions import CommunityReactions, ReactionType
from ..model.user import User

query = QueryType()
mutation = MutationType()
community_reactions = ObjectType("CommunityReactions")

# Reaction fields
@community_reactions.field("id")
def resolve_id(reaction_obj, info):
    return reaction_obj.id

@community_reactions.field("userId")
def resolve_user_id(reaction_obj, info):
    return reaction_obj.user_id

@community_reactions.field("communityId")
def resolve_community_id(reaction_obj, info):
    return reaction_obj.community_id

@community_reactions.field("reactionType")
def resolve_reaction_type(reaction_obj, info):
    return reaction_obj.reaction_type.value.upper()

@community_reactions.field("createdAt")
def resolve_created_at(reaction_obj, info):
    return reaction_obj.created_at

@community_reactions.field("updatedAt")
def resolve_updated_at(reaction_obj, info):
    return reaction_obj.updated_at

@community_reactions.field("isDeleted")
def resolve_is_deleted(reaction_obj, info):
    return reaction_obj.is_deleted

@community_reactions.field("deletedAt")
def resolve_deleted_at(reaction_obj, info):
    return reaction_obj.deleted_at

@community_reactions.field("user")
def resolve_user(reaction_obj, info):
    db: Session = info.context["db"]
    user = db.query(User).filter(User.id == reaction_obj.user_id).first()
    return user

@community_reactions.field("community")
def resolve_community(reaction_obj, info):
    db: Session = info.context["db"]
    community = db.query(BatchCommunity).filter(BatchCommunity.id == reaction_obj.community_id).first()
    return community

# Query resolvers
@query.field("communityReactions")
def resolve_community_reactions(_, info, communityId: Optional[str] = None, userId: Optional[str] = None):
    db: Session = info.context["db"]
    query_obj = db.query(CommunityReactions).filter(CommunityReactions.is_deleted == False)
    
    if communityId:
        query_obj = query_obj.filter(CommunityReactions.community_id == communityId)
    
    if userId:
        query_obj = query_obj.filter(CommunityReactions.user_id == userId)
    
    return query_obj.all()

@query.field("communityReaction")
def resolve_community_reaction(_, info, id: str):
    db: Session = info.context["db"]
    reaction = db.query(CommunityReactions).filter(
        CommunityReactions.id == id, 
        CommunityReactions.is_deleted == False
    ).first()
    if not reaction:
        raise Exception("Reaction not found")
    return reaction

# Mutation resolvers
@mutation.field("postCommunityReaction")
async def resolve_post_community_reaction(_, info, communityId: str, reactionType: str):
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
    
    # Check if user already has a reaction for this community
    existing_reaction = db.query(CommunityReactions).filter(
        CommunityReactions.user_id == current_user.id,
        CommunityReactions.community_id == communityId,
        CommunityReactions.is_deleted == False
    ).first()
    
    if existing_reaction:
        # Update existing reaction
        existing_reaction.reaction_type = ReactionType(reactionType.lower())
        existing_reaction.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(existing_reaction)
        
        # Trigger subscription update
        await info.context["pubsub"].publish(f"batch_{community.batch_id}", {
            "communityUpdated": community
        })
        
        return existing_reaction
    
    # Create new reaction
    reaction = CommunityReactions(
        user_id=current_user.id,
        community_id=communityId,
        reaction_type=ReactionType(reactionType.lower())
    )
    
    db.add(reaction)
    db.commit()
    db.refresh(reaction)
    
    # Trigger subscription update
    await info.context["pubsub"].publish(f"batch_{community.batch_id}", {
        "communityUpdated": community
    })
    
    return reaction

@mutation.field("updateCommunityReaction")
async def resolve_update_community_reaction(_, info, id: str, reactionType: str):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    reaction = db.query(CommunityReactions).filter(
        CommunityReactions.id == id, 
        CommunityReactions.is_deleted == False
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
    community = db.query(BatchCommunity).filter(BatchCommunity.id == reaction.community_id).first()
    if community:
        await info.context["pubsub"].publish(f"batch_{community.batch_id}", {
            "communityUpdated": community
        })
    
    return reaction

@mutation.field("deleteCommunityReaction")
async def resolve_delete_community_reaction(_, info, id: str):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    reaction = db.query(CommunityReactions).filter(
        CommunityReactions.id == id, 
        CommunityReactions.is_deleted == False
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
    community = db.query(BatchCommunity).filter(BatchCommunity.id == reaction.community_id).first()
    if community:
        await info.context["pubsub"].publish(f"batch_{community.batch_id}", {
            "communityUpdated": community
        })
    
    return True