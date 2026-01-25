from datetime import datetime

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.student_profile import AgeRange, DurationUnit, Proficiency, StudentProfile
from ..model.user import User, UserRole
from ..model.modules import Modules
from ..model.free_conversation import FreeConversation
from ..model.batch_enrollment import BatchEnrollment
from ..util.ai_service.learning_plan import generate_learning_plan, update_learning_plan
# from ..util.ai_service.install_learning_plan import install_learning_plan
from ..util.ai_service.false_install_learning_plan import install_learning_plan

query = QueryType()
mutation = MutationType()
student_profile = ObjectType("StudentProfile")


def map_age_range(age_range_str: str) -> AgeRange:
    age_range_map = {
        "UNDER_18": AgeRange.under_18,
        "_18_25": AgeRange._18_25,
        "_26_35": AgeRange._26_35,
        "_36_45": AgeRange._36_45,
        "_45_PLUS": AgeRange._45_plus,
    }
    return age_range_map.get(age_range_str, AgeRange.under_18)


def map_age_range_to_graphql(age_range: AgeRange) -> str:
    age_range_graphql_map = {
        AgeRange.under_18: "UNDER_18",
        AgeRange._18_25: "_18_25",
        AgeRange._26_35: "_26_35",
        AgeRange._36_45: "_36_45",
        AgeRange._45_plus: "_45_PLUS",
    }
    return age_range_graphql_map.get(age_range, "UNDER_18")


def map_proficiency_to_graphql(proficiency: Proficiency) -> str:
    proficiency_graphql_map = {
        Proficiency.beginner: "BEGINNER",
        Proficiency.basic: "BASIC",
        Proficiency.intermediate: "INTERMEDIATE",
        Proficiency.advanced: "ADVANCED",
    }
    return proficiency_graphql_map.get(proficiency, "BEGINNER")


def map_duration_unit_to_graphql(duration_unit: DurationUnit) -> str:
    duration_unit_graphql_map = {
        DurationUnit.days: "DAYS",
        DurationUnit.weeks: "WEEKS",
        DurationUnit.months: "MONTHS",
        DurationUnit.years: "YEARS",
    }
    return duration_unit_graphql_map.get(duration_unit, "MONTHS")


def map_proficiency(proficiency_str: str) -> Proficiency:
    proficiency_map = {
        "BEGINNER": Proficiency.beginner,
        "BASIC": Proficiency.basic,
        "INTERMEDIATE": Proficiency.intermediate,
        "ADVANCED": Proficiency.advanced,
    }
    return proficiency_map.get(proficiency_str, Proficiency.beginner)


def map_duration_unit(duration_unit_str: str) -> DurationUnit:
    duration_unit_map = {
        "DAYS": DurationUnit.days,
        "WEEKS": DurationUnit.weeks,
        "MONTHS": DurationUnit.months,
        "YEARS": DurationUnit.years,
    }
    return duration_unit_map.get(duration_unit_str, DurationUnit.months)


@query.field("myProfile")
def resolve_my_profile(_, info):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id == current_user.id,
            StudentProfile.is_deleted == False,
        )
        .first()
    )

    return profile


@query.field("studentProfile")
def resolve_student_profile(_, info, userId: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Allow admins to view any profile, students/tutors can only view their own
    if current_user.role != UserRole.admin and current_user.id != userId:
        raise Exception("Unauthorized")

    db: Session = info.context["db"]
    profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == userId, StudentProfile.is_deleted == False)
        .first()
    )

    if not profile:
        raise Exception("Student profile not found")

    return profile


@mutation.field("createProfile")
def resolve_create_profile(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Check if profile already exists
    existing_profile = (
        db.query(StudentProfile)
        .filter(StudentProfile.user_id == current_user.id)
        .first()
    )

    if existing_profile:
        sample_module = db.query(Modules).filter(
            Modules.profile_id == existing_profile.id,
            Modules.is_deleted == False,
        ).first()
        if sample_module:
            raise Exception('Already you install learning plan!')

        if existing_profile.is_deleted:
            existing_profile.age_range = map_age_range(input["ageRange"])
            existing_profile.proficiency = map_proficiency(input["proficiency"])
            existing_profile.native_language = input["nativeLanguage"]
            existing_profile.learning_goal = input["learningGoal"]
            existing_profile.target_duration = input["targetDuration"]
            existing_profile.duration_unit = map_duration_unit(input["durationUnit"])
            existing_profile.constraints = input.get("constraints")
            existing_profile.is_deleted = False
            db.commit()
            db.refresh(existing_profile)
            return existing_profile
        else:
            raise Exception("Profile already exists. Use updateProfile instead.")

    # Create new profile
    profile = StudentProfile(
        id=current_user.id,
        user_id=current_user.id,
        age_range=map_age_range(input["ageRange"]),
        proficiency=map_proficiency(input["proficiency"]),
        native_language=input["nativeLanguage"],
        learning_goal=input["learningGoal"],
        target_duration=input["targetDuration"],
        duration_unit=map_duration_unit(input["durationUnit"]),
        constraints=input.get("constraints")
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


@mutation.field("updateProfile")
def resolve_update_profile(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id == current_user.id,
            StudentProfile.is_deleted == False,
        )
        .first()
    )

    if not profile:
        raise Exception("Profile not found. Create a profile first.")

    sample_module = db.query(Modules).filter(
        Modules.profile_id == profile.id,
        Modules.is_deleted == False,
    ).first()
    if sample_module:
        raise Exception('Already you install learning plan!')


    # Update fields if provided
    if "ageRange" in input:
        profile.age_range = map_age_range(input["ageRange"])
    if "proficiency" in input:
        profile.proficiency = map_proficiency(input["proficiency"])
    if "nativeLanguage" in input:
        profile.native_language = input["nativeLanguage"]
    if "learningGoal" in input:
        profile.learning_goal = input["learningGoal"]
    if "targetDuration" in input:
        profile.target_duration = input["targetDuration"]
    if "durationUnit" in input:
        profile.duration_unit = map_duration_unit(input["durationUnit"])
    if "constraints" in input:
        profile.constraints = input["constraints"]

    db.commit()
    db.refresh(profile)

    return profile


@mutation.field("generateLearningPlan")
def resolve_generate_learning_plan(_, info):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id == current_user.id,
            StudentProfile.is_deleted == False,
        )
        .first()
    )

    if not profile:
        raise Exception("Profile not found. Create a profile first.")

    learning_plan = generate_learning_plan(profile)

    profile.ai_learning_plan = learning_plan
    db.commit()
    db.refresh(profile)

    return profile


@mutation.field("updateLearningPlan")
def resolve_update_learning_plan(_, info, input):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id == current_user.id,
            StudentProfile.is_deleted == False,
        )
        .first()
    )

    if not profile:
        raise Exception("Profile not found. Create a profile first.")

    sample_module = db.query(Modules).filter(
        Modules.profile_id == profile.id,
        Modules.is_deleted == False,
    ).first()
    if sample_module:
        raise Exception('Already you install learning plan!')


    if "improvements" not in input:
        raise Exception("Learning improvement is required")

    profile.ai_learning_plan = update_learning_plan(profile, input['improvements'])
    db.commit()
    db.refresh(profile)

    return profile


@mutation.field("installLearningPlan")
def resolve_install_learning_plan(_, info):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id == current_user.id,
            StudentProfile.is_deleted == False,
        )
        .first()
    )

    if not profile:
        raise Exception("Profile not found. Create a profile first.")

    if not profile.ai_learning_plan:
        raise Exception(
            "No learning plan to install. Generate or update a learning plan first."
        )

    sample_module = db.query(Modules).filter(
        Modules.profile_id == profile.id,
        Modules.is_deleted == False,
    ).first()
    if sample_module:
        return profile

    if not install_learning_plan(profile, db):
        raise Exception('Error when installing the plan')

    return profile


@mutation.field("deletePlan")
def resolve_delete_plan(_, info):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id == current_user.id,
            StudentProfile.is_deleted == False,
        )
        .first()
    )

    if not profile:
        raise Exception("Profile not found.")

    profile.ai_learning_plan = None
    db.commit()
    db.refresh(profile)

    return profile


@mutation.field("deleteProfile")
def resolve_delete_profile(_, info):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    profile = (
        db.query(StudentProfile)
        .filter(
            StudentProfile.user_id == current_user.id,
            StudentProfile.is_deleted == False
        ).first()
    )

    if not profile:
        raise Exception("Profile not found.")

    profile.is_deleted = True
    profile.deleted_at = datetime.utcnow()
    db.commit()

    return True


@student_profile.field("id")
def resolve_id(profile, info):
    return profile.id


@student_profile.field("userId")
def resolve_user_id(profile, info):
    return profile.user_id


@student_profile.field("ageRange")
def resolve_age_range(profile, info):
    return map_age_range_to_graphql(profile.age_range)


@student_profile.field("proficiency")
def resolve_proficiency(profile, info):
    return map_proficiency_to_graphql(profile.proficiency)


@student_profile.field("nativeLanguage")
def resolve_native_language(profile, info):
    return profile.native_language


@student_profile.field("learningGoal")
def resolve_learning_goal(profile, info):
    return profile.learning_goal


@student_profile.field("targetDuration")
def resolve_target_duration(profile, info):
    return profile.target_duration


@student_profile.field("durationUnit")
def resolve_duration_unit(profile, info):
    return map_duration_unit_to_graphql(profile.duration_unit)


@student_profile.field("constraints")
def resolve_constraints(profile, info):
    return profile.constraints


@student_profile.field("aiLearningPlan")
def resolve_ai_learning_plan(profile, info):
    return profile.ai_learning_plan


@student_profile.field("createdAt")
def resolve_created_at(profile, info):
    return profile.created_at


@student_profile.field("updatedAt")
def resolve_updated_at(profile, info):
    return profile.updated_at


@student_profile.field("isDeleted")
def resolve_is_deleted(profile, info):
    return profile.is_deleted


@student_profile.field("deletedAt")
def resolve_deleted_at(profile, info):
    return profile.deleted_at


@student_profile.field("user")
def resolve_user(profile, info):
    db: Session = info.context["db"]
    user = db.query(User).filter(User.id == profile.user_id).first()
    return user


@student_profile.field("modules")
def resolve_modules(profile, info):
    db: Session = info.context["db"]
    modules = db.query(Modules).filter(Modules.profile_id == profile.id).all()
    return modules


@student_profile.field("freeConversations")
def resolve_free_conversations(profile, info):
    db: Session = info.context["db"]
    free_conversations = db.query(FreeConversation).filter(FreeConversation.profile_id == profile.id).all()
    return free_conversations


@student_profile.field("batchEnrollments")
def resolve_batch_enrollments(profile, info):
    db: Session = info.context["db"]
    batch_enrollments = db.query(BatchEnrollment).filter(BatchEnrollment.profile_id == profile.id).all()
    return batch_enrollments
