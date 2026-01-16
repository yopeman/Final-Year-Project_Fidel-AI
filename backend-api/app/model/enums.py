import enum

class AgeRange(enum.Enum):
    under_18 = "under_18"
    _18_25 = "18_25"
    _26_35 = "26_35"
    _36_45 = "36_45"
    _45_plus = "45_plus"

class Proficiency(enum.Enum):
    beginner = "beginner"
    basic = "basic"
    intermediate = "intermediate"
    advanced = "advanced"

class DurationUnit(enum.Enum):
    days = "days"
    weeks = "weeks"
    months = "months"
    years = "years"

class BatchLevel(enum.Enum):
    beginner = "beginner"
    basic = "basic"
    intermediate = "intermediate"
    advanced = "advanced"

class BatchStatus(enum.Enum):
    upcoming = "upcoming"
    active = "active"
    completed = "completed"
    cancelled = "cancelled"

class EnrollmentStatus(enum.Enum):
    applied = "applied"
    enrolled = "enrolled"
    completed = "completed"
    dropped = "dropped"

class InstructorRole(enum.Enum):
    main = "main"
    assistant = "assistant"

class ReactionType(enum.Enum):
    like = "like"
    dislike = "dislike"
    love = "love"

class QuizType(enum.Enum):
    matching = "matching"
    true_false = "true_false"
    filling_the_gap = "filling_the_gap"

class SkillType(enum.Enum):
    reading = "reading"
    writing = "writing"
    speaking = "speaking"
    listening = "listening"

class PaymentStatus(enum.Enum):
    pending = "pending"
    completed = "completed"
    failed = "failed"

class UserType(enum.Enum):
    student = "student"
    tutor = "tutor"

class AttendanceStatus(enum.Enum):
    present = "present"
    absent = "absent"
    late = "late"
