from datetime import datetime
from typing import Optional
import uuid
import os

from ariadne import MutationType, ObjectType, QueryType
from fastapi import UploadFile
from sqlalchemy.orm import Session

from ..model.batch_community import BatchCommunity
from ..model.community_attachment_files import CommunityAttachmentFiles
from ..model.user import User

query = QueryType()
mutation = MutationType()
community_attachment_files = ObjectType("CommunityAttachmentFiles")

# Attachment fields
@community_attachment_files.field("id")
def resolve_id(attachment_obj, info):
    return attachment_obj.id

@community_attachment_files.field("communityId")
def resolve_community_id(attachment_obj, info):
    return attachment_obj.community_id

@community_attachment_files.field("fileName")
def resolve_file_name(attachment_obj, info):
    return attachment_obj.file_name

@community_attachment_files.field("filePath")
def resolve_file_path(attachment_obj, info):
    return attachment_obj.file_path

@community_attachment_files.field("fileExtension")
def resolve_file_extension(attachment_obj, info):
    return attachment_obj.file_extension

@community_attachment_files.field("fileSize")
def resolve_file_size(attachment_obj, info):
    return attachment_obj.file_size

@community_attachment_files.field("createdAt")
def resolve_created_at(attachment_obj, info):
    return attachment_obj.created_at

@community_attachment_files.field("updatedAt")
def resolve_updated_at(attachment_obj, info):
    return attachment_obj.updated_at

@community_attachment_files.field("isDeleted")
def resolve_is_deleted(attachment_obj, info):
    return attachment_obj.is_deleted

@community_attachment_files.field("deletedAt")
def resolve_deleted_at(attachment_obj, info):
    return attachment_obj.deleted_at

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
@mutation.field("uploadAttachments")
def resolve_upload_attachments(_, info, communityId: str, files):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")
    
    db: Session = info.context["db"]
    
    # Validate that community exists and user has access
    community = db.query(BatchCommunity).filter(
        BatchCommunity.id == communityId,
        BatchCommunity.is_deleted == False
    ).first()
    
    if not community:
        raise Exception("Community not found")
    
    # Check if user owns the community
    if community.user_id != current_user.id:
        raise Exception("Not authorized to upload files to this community")
    
    uploaded_attachments = []
    
    for file_data in files:
        # Extract file information
        file_content = file_data["file"]
        file_name = file_data["filename"]
        
        # Generate unique file path
        file_extension = file_name.split(".")[-1] if "." in file_name else ""
        unique_filename = f"{uuid.uuid4()}_{file_name}"
        file_path = f"static/community_attachments/{communityId}/{unique_filename}"
        
        # Ensure directory exists
        os.makedirs(os.path.dirname(file_path), exist_ok=True)
        
        # Save file to storage
        with open(file_path, "wb") as f:
            f.write(file_content.read())
        
        # Calculate file size
        file_size = len(file_content.getvalue())
        
        # Create database record
        new_attachment = CommunityAttachmentFiles(
            community_id=communityId,
            file_name=file_name,
            file_path=file_path,
            file_extension=file_extension,
            file_size=file_size
        )
        
        db.add(new_attachment)
        uploaded_attachments.append(new_attachment)
    
    db.commit()
    
    # Refresh all attachments to get their IDs
    for attachment in uploaded_attachments:
        db.refresh(attachment)
    
    return uploaded_attachments

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