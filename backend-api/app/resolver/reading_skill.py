from ariadne import ObjectType
from sqlalchemy.orm import Session

from ..model.reading_skill import ReadingSkill
from ..model.skill import Skill

reading_skill = ObjectType("ReadingSkill")

@reading_skill.field("id")
def resolve_id(reading_skill_obj, info):
    return reading_skill_obj.id

@reading_skill.field("skillId")
def resolve_skill_id(reading_skill_obj, info):
    return reading_skill_obj.skill_id

@reading_skill.field("comprehension")
def resolve_comprehension(reading_skill_obj, info):
    return reading_skill_obj.comprehension.value if reading_skill_obj.comprehension else None

@reading_skill.field("speed")
def resolve_speed(reading_skill_obj, info):
    return reading_skill_obj.speed.value if reading_skill_obj.speed else None

@reading_skill.field("vocabulary")
def resolve_vocabulary(reading_skill_obj, info):
    return reading_skill_obj.vocabulary.value if reading_skill_obj.vocabulary else None

@reading_skill.field("finalResult")
def resolve_final_result(reading_skill_obj, info):
    return reading_skill_obj.final_result.value if reading_skill_obj.final_result else None

@reading_skill.field("createdAt")
def resolve_created_at(reading_skill_obj, info):
    return reading_skill_obj.created_at

@reading_skill.field("updatedAt")
def resolve_updated_at(reading_skill_obj, info):
    return reading_skill_obj.updated_at

@reading_skill.field("isDeleted")
def resolve_is_deleted(reading_skill_obj, info):
    return reading_skill_obj.is_deleted

@reading_skill.field("deletedAt")
def resolve_deleted_at(reading_skill_obj, info):
    return reading_skill_obj.deleted_at

@reading_skill.field("skill")
def resolve_skill(reading_skill_obj, info):
    db: Session = info.context["db"]
    skill = db.query(Skill).filter(
        Skill.id == reading_skill_obj.skill_id
    ).first()
    return skill