from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.batch_community import BatchCommunity
from ..model.community_attachment_files import CommunityAttachmentFiles
from ..model.user import User
from ..util.auth import get_current_user

query = QueryType()
mutation = MutationType()
community_attachment_files = ObjectType("CommunityAttachmentFiles")

# Attachment fields
@community_attachment_files.field("community")
def resolve_community(attachment_obj, info):
    db: Session = info.context["db"]
    community = db.query(BatchCommunity).filter(BatchCommunity.id == attachment_obj.community_id).first()
    return community

# Query resolvers
@query.field("communityAttachments")
def resolve_community_attachments(_, info, communityId: Optional[str] = None):
    db: Session = info.context["db"]
    query_obj = db.query(CommunityAttachmentFiles).filter(CommunityAttachmentFiles.is_deleted == False)
    
    if communityId:
        query_obj = query_obj.filter(CommunityAttachmentFiles.community_id == communityId)
    
    return query_obj.all()

@query.field("communityAttachment")
def resolve_community_attachment(_, info, id: str):
    db: Session = info.context["db"]
    attachment = db.query(CommunityAttachmentFiles).filter(
        CommunityAttachmentFiles.id == id, 
        CommunityAttachmentFiles.is_deleted == False
    ).first()
    if not attachment:
        raise Exception("Attachment not found")
    return attachment

# Mutation resolvers
@mutation.field("addAttachments")
def resolve_add_attachments(_, info, communityId: str, files):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    
    # Check if community exists and user has permission
    community = db.query(BatchCommunity).filter(
        BatchCommunity.id == communityId, 
        BatchCommunity.is_deleted == False
    ).first()
    
    if not community:
        raise Exception("Community not found")
    
    if community.user_id != current_user.id:
        raise Exception("Not authorized to add attachments to this community")
    
    attachments = []
    for file in files:
        attachment = CommunityAttachmentFiles(
            community_id=communityId,
            file_name=file["fileName"],
            file_path=file["filePath"],
            file_extension=file["fileExtension"],
            file_size=file["fileSize"]
        )
        db.add(attachment)
        attachments.append(attachment)
    
    db.commit()
    for attachment in attachments:
        db.refresh(attachment)
    
    return attachments

@mutation.field("addAttachment")
def resolve_add_attachment(_, info, communityId: str, fileName: str, filePath: str, fileExtension: str, fileSize: int):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    
    # Check if community exists and user has permission
    community = db.query(BatchCommunity).filter(
        BatchCommunity.id == communityId, 
        BatchCommunity.is_deleted == False
    ).first()
    
    if not community:
        raise Exception("Community not found")
    
    if community.user_id != current_user.id:
        raise Exception("Not authorized to add attachment to this community")
    
    attachment = CommunityAttachmentFiles(
        community_id=communityId,
        file_name=fileName,
        file_path=filePath,
        file_extension=fileExtension,
        file_size=fileSize
    )
    
    db.add(attachment)
    db.commit()
    db.refresh(attachment)
    
    return attachment

@mutation.field("deleteAttachment")
def resolve_delete_attachment(_, info, id: str):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    attachment = db.query(CommunityAttachmentFiles).filter(
        CommunityAttachmentFiles.id == id, 
        CommunityAttachmentFiles.is_deleted == False
    ).first()
    
    if not attachment:
        raise Exception("Attachment not found")
    
    # Check if user owns the community or is the attachment owner
    community = db.query(BatchCommunity).filter(BatchCommunity.id == attachment.community_id).first()
    if not community or community.user_id != current_user.id:
        raise Exception("Not authorized to delete this attachment")
    
    attachment.is_deleted = True
    attachment.deleted_at = datetime.utcnow()
    
    db.commit()
    db.refresh(attachment)
    
    return True