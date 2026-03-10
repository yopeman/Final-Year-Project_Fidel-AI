from ariadne import ObjectType
from sqlalchemy.orm import Session

from ..model.speaking_skill import SpeakingSkill
from ..model.skill import Skill

speaking_skill = ObjectType("SpeakingSkill")

@speaking_skill.field("id")
def resolve_id(speaking_skill_obj, info):
    return speaking_skill_obj.id

@speaking_skill.field("skillId")
def resolve_skill_id(speaking_skill_obj, info):
    return speaking_skill_obj.skill_id

@speaking_skill.field("pronunciation")
def resolve_pronunciation(speaking_skill_obj, info):
    return speaking_skill_obj.pronunciation.name if speaking_skill_obj.pronunciation else None

@speaking_skill.field("fluency")
def resolve_fluency(speaking_skill_obj, info):
    return speaking_skill_obj.fluency.name if speaking_skill_obj.fluency else None

@speaking_skill.field("grammar")
def resolve_grammar(speaking_skill_obj, info):
    return speaking_skill_obj.grammar.name if speaking_skill_obj.grammar else None

@speaking_skill.field("vocabulary")
def resolve_vocabulary(speaking_skill_obj, info):
    return speaking_skill_obj.vocabulary.name if speaking_skill_obj.vocabulary else None

@speaking_skill.field("coherence")
def resolve_coherence(speaking_skill_obj, info):
    return speaking_skill_obj.coherence.name if speaking_skill_obj.coherence else None

@speaking_skill.field("finalResult")
def resolve_final_result(speaking_skill_obj, info):
    return speaking_skill_obj.final_result.name if speaking_skill_obj.final_result else None

@speaking_skill.field("createdAt")
def resolve_created_at(speaking_skill_obj, info):
    return speaking_skill_obj.created_at

@speaking_skill.field("updatedAt")
def resolve_updated_at(speaking_skill_obj, info):
    return speaking_skill_obj.updated_at

@speaking_skill.field("isDeleted")
def resolve_is_deleted(speaking_skill_obj, info):
    return speaking_skill_obj.is_deleted

@speaking_skill.field("deletedAt")
def resolve_deleted_at(speaking_skill_obj, info):
    return speaking_skill_obj.deleted_at

@speaking_skill.field("skill")
def resolve_skill(speaking_skill_obj, info):
    db: Session = info.context["db"]
    skill = db.query(Skill).filter(
        Skill.id == speaking_skill_obj.skill_id
    ).first()
    return skill