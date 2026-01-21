from ariadne import ObjectType

from ..model.verification_code import VerificationCode

verification_code = ObjectType("VerificationCode")

@verification_code.field("user")
def resolve_verification_code_user(verification_code_obj, info):
    db = info.context["db"]
    return db.query(VerificationCode).filter(VerificationCode.id == verification_code_obj.id).first().user
