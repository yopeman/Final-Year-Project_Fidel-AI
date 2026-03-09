from ariadne import ObjectType
from sqlalchemy.orm import Session

from ..model.listening_skill import ListeningSkill
from ..model.skill import Skill

listening_skill = ObjectType("ListeningSkill")

@listening_skill.field("id")
def resolve_id(listening_skill_obj, info):
    return listening_skill_obj.id

@listening_skill.field("skillId")
def resolve_skill_id(listening_skill_obj, info):
    return listening_skill_obj.skill_id

@listening_skill.field("comprehension")
def resolve_comprehension(listening_skill_obj, info):
    return listening_skill_obj.comprehension.name if listening_skill_obj.comprehension else None

@listening_skill.field("retention")
def resolve_retention(listening_skill_obj, info):
    return listening_skill_obj.retention.name if listening_skill_obj.retention else None

@listening_skill.field("interpretation")
def resolve_interpretation(listening_skill_obj, info):
    return listening_skill_obj.interpretation.name if listening_skill_obj.interpretation else None

@listening_skill.field("finalResult")
def resolve_final_result(listening_skill_obj, info):
    return listening_skill_obj.final_result.name if listening_skill_obj.final_result else None

@listening_skill.field("createdAt")
def resolve_created_at(listening_skill_obj, info):
    return listening_skill_obj.created_at

@listening_skill.field("updatedAt")
def resolve_updated_at(listening_skill_obj, info):
    return listening_skill_obj.updated_at

@listening_skill.field("isDeleted")
def resolve_is_deleted(listening_skill_obj, info):
    return listening_skill_obj.is_deleted

@listening_skill.field("deletedAt")
def resolve_deleted_at(listening_skill_obj, info):
    return listening_skill_obj.deleted_at

@listening_skill.field("skill")
def resolve_skill(listening_skill_obj, info):
    db: Session = info.context["db"]
    skill = db.query(Skill).filter(
        Skill.id == listening_skill_obj.skill_id
    ).first()
    return skill