from datetime import datetime

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.modules import Modules
from ..model.student_profile import StudentProfile
from ..model.user import User, UserRole

query = QueryType()
mutation = MutationType()
modules = ObjectType("Modules")


@query.field("modules")
def resolve_modules(_, info, profileId: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Get the profile to check ownership
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.id == profileId, StudentProfile.is_deleted == False)
        .first()
    )

    if not profile:
        raise Exception("Profile not found")

    # Allow admins to view any modules, students/tutors can only view their own
    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    modules_list = (
        db.query(Modules)
        .filter(Modules.profile_id == profileId, Modules.is_deleted == False)
        .order_by(Modules.display_order)
        .all()
    )

    return modules_list


@query.field("module")
def resolve_module(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    module = (
        db.query(Modules).filter(Modules.id == id, Modules.is_deleted == False).first()
    )

    if not module:
        raise Exception("Module not found")

    # Check if user owns the module through profile
    profile = (
        db.query(StudentProfile).filter(StudentProfile.id == module.profile_id).first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    return module


@mutation.field("updateModule")
def resolve_update_module(_, info, id: str, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    module = (
        db.query(Modules).filter(Modules.id == id, Modules.is_deleted == False).first()
    )

    if not module:
        raise Exception("Module not found")

    # Check ownership
    profile = (
        db.query(StudentProfile).filter(StudentProfile.id == module.profile_id).first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    # Update fields if provided
    if "name" in input:
        module.name = input["name"]
    if "description" in input:
        module.description = input["description"]
    if "displayOrder" in input:
        module.display_order = input["displayOrder"]
    if "isLocked" in input:
        module.is_locked = input["isLocked"]

    db.commit()
    db.refresh(module)

    return module


@mutation.field("deleteModule")
def resolve_delete_module(_, info, id: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    module = (
        db.query(Modules).filter(Modules.id == id, Modules.is_deleted == False).first()
    )

    if not module:
        raise Exception("Module not found")

    # Check ownership
    profile = (
        db.query(StudentProfile).filter(StudentProfile.id == module.profile_id).first()
    )

    if current_user.role != UserRole.admin and profile.user_id != current_user.id:
        raise Exception("Unauthorized")

    module.is_deleted = True
    module.deleted_at = datetime.utcnow()
    db.commit()

    return True


@modules.field("id")
def resolve_id(module, info):
    return module.id


@modules.field("profileId")
def resolve_profile_id(module, info):
    return module.profile_id


@modules.field("name")
def resolve_name(module, info):
    return module.name


@modules.field("description")
def resolve_description(module, info):
    return module.description


@modules.field("displayOrder")
def resolve_display_order(module, info):
    return module.display_order


@modules.field("isLocked")
def resolve_is_locked(module, info):
    return module.is_locked


@modules.field("createdAt")
def resolve_created_at(module, info):
    return module.created_at


@modules.field("updatedAt")
def resolve_updated_at(module, info):
    return module.updated_at


@modules.field("isDeleted")
def resolve_is_deleted(module, info):
    return module.is_deleted


@modules.field("deletedAt")
def resolve_deleted_at(module, info):
    return module.deleted_at


@modules.field("profile")
def resolve_profile(module, info):
    db: Session = info.context["db"]
    profile = (
        db.query(StudentProfile).filter(StudentProfile.id == module.profile_id).first()
    )
    return profile


@modules.field("lessons")
def resolve_lessons(module, info):
    db: Session = info.context["db"]
    from ..model.module_lessons import ModuleLessons

    lessons = (
        db.query(ModuleLessons)
        .filter(ModuleLessons.module_id == module.id, ModuleLessons.is_deleted == False)
        .order_by(ModuleLessons.display_order)
        .all()
    )
    return lessons
