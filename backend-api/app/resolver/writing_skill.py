from ariadne import ObjectType
from sqlalchemy.orm import Session

from ..model.writing_skill import WritingSkill
from ..model.skill import Skill

writing_skill = ObjectType("WritingSkill")

@writing_skill.field("id")
def resolve_id(writing_skill_obj, info):
    return writing_skill_obj.id

@writing_skill.field("skillId")
def resolve_skill_id(writing_skill_obj, info):
    return writing_skill_obj.skill_id

@writing_skill.field("coherence")
def resolve_coherence(writing_skill_obj, info):
    return writing_skill_obj.coherence.name if writing_skill_obj.coherence else None

@writing_skill.field("grammar")
def resolve_grammar(writing_skill_obj, info):
    return writing_skill_obj.grammar.name if writing_skill_obj.grammar else None

@writing_skill.field("vocabulary")
def resolve_vocabulary(writing_skill_obj, info):
    return writing_skill_obj.vocabulary.name if writing_skill_obj.vocabulary else None

@writing_skill.field("punctuation")
def resolve_punctuation(writing_skill_obj, info):
    return writing_skill_obj.punctuation.name if writing_skill_obj.punctuation else None

@writing_skill.field("finalResult")
def resolve_final_result(writing_skill_obj, info):
    return writing_skill_obj.final_result.name if writing_skill_obj.final_result else None

@writing_skill.field("createdAt")
def resolve_created_at(writing_skill_obj, info):
    return writing_skill_obj.created_at

@writing_skill.field("updatedAt")
def resolve_updated_at(writing_skill_obj, info):
    return writing_skill_obj.updated_at

@writing_skill.field("isDeleted")
def resolve_is_deleted(writing_skill_obj, info):
    return writing_skill_obj.is_deleted

@writing_skill.field("deletedAt")
def resolve_deleted_at(writing_skill_obj, info):
    return writing_skill_obj.deleted_at

@writing_skill.field("skill")
def resolve_skill(writing_skill_obj, info):
    db: Session = info.context["db"]
    skill = db.query(Skill).filter(
        Skill.id == writing_skill_obj.skill_id
    ).first()
    return skill