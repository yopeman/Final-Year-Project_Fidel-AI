from datetime import datetime, timedelta, date
from sqlalchemy import func, and_, or_
from sqlalchemy.orm import Session

from ariadne import QueryType
from ..model.user import User, UserRole
from ..model.batch import Batch, BatchStatus, BatchLevel
from ..model.batch_enrollment import BatchEnrollment, EnrollmentStatus
from ..model.payment import Payment, PaymentStatus
from ..model.student_profile import StudentProfile
from ..model.feedback import Feedback
from ..model.attendance import Attendance
from ..model.community_comment import CommunityComment
from ..model.community_reactions import CommunityReactions
from ..model.course_material import CourseMaterial
from ..model.notification import Notification

query = QueryType()


@query.field("analytics")
def resolve_analytics(_, info):
    current_user: User = info.context.get("current_user")
    if not current_user or current_user.role not in [UserRole.admin, UserRole.tutor]:
        raise Exception("Unauthorized: Admin or Tutor access required")
    
    db: Session = info.context["db"]
    
    # Get date ranges for different time periods
    today = datetime.now().date()
    last_30_days = today - timedelta(days=30)
    last_7_days = today - timedelta(days=7)
    this_month_start = today.replace(day=1)
    last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
    last_month_end = this_month_start - timedelta(days=1)
    
    analytics = {
        "overview": get_overview_stats(db),
        "userAnalytics": get_user_analytics(db, today, last_30_days, last_7_days),
        "batchAnalytics": get_batch_analytics(db, today, last_30_days),
        "enrollmentAnalytics": get_enrollment_analytics(db, today, last_30_days, this_month_start, last_month_start, last_month_end),
        "paymentAnalytics": get_payment_analytics(db, today, last_30_days, this_month_start, last_month_start, last_month_end) if current_user.role == UserRole.admin else None,
        "engagementAnalytics": get_engagement_analytics(db, last_30_days, last_7_days),
        "performanceAnalytics": get_performance_analytics(db),
        "growthMetrics": get_growth_metrics(db, today, last_30_days, last_7_days),
        "generatedAt": datetime.now().isoformat()
    }
    
    return analytics


def get_overview_stats(db: Session):
    """Get key overview statistics"""
    total_users = db.query(User).filter(User.is_deleted == False).count()
    total_students = db.query(User).filter(
        User.role == UserRole.student, 
        User.is_deleted == False
    ).count()
    total_tutors = db.query(User).filter(
        User.role == UserRole.tutor, 
        User.is_deleted == False
    ).count()
    total_batches = db.query(Batch).filter(Batch.is_deleted == False).count()
    active_batches = db.query(Batch).filter(
        Batch.status == BatchStatus.active,
        Batch.is_deleted == False
    ).count()
    total_enrollments = db.query(BatchEnrollment).filter(BatchEnrollment.is_deleted == False).count()
    active_enrollments = db.query(BatchEnrollment).filter(
        BatchEnrollment.status == EnrollmentStatus.enrolled,
        BatchEnrollment.is_deleted == False
    ).count()
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.completed,
        Payment.is_deleted == False
    ).scalar() or 0
    
    return {
        "totalUsers": total_users,
        "totalStudents": total_students,
        "totalTutors": total_tutors,
        "totalBatches": total_batches,
        "activeBatches": active_batches,
        "totalEnrollments": total_enrollments,
        "activeEnrollments": active_enrollments,
        "totalRevenue": float(total_revenue)
    }


def get_user_analytics(db: Session, today, last_30_days, last_7_days):
    """Get detailed user analytics"""
    # User registration trends
    new_users_30_days = db.query(User).filter(
        User.created_at >= last_30_days,
        User.is_deleted == False
    ).count()
    
    new_users_7_days = db.query(User).filter(
        User.created_at >= last_7_days,
        User.is_deleted == False
    ).count()
    
    # User verification stats
    verified_users = db.query(User).filter(
        User.is_verified == True,
        User.is_deleted == False
    ).count()
    
    unverified_users = db.query(User).filter(
        User.is_verified == False,
        User.is_deleted == False
    ).count()
    
    # Users by role
    users_by_role = db.query(
        User.role,
        func.count(User.id).label('count')
    ).filter(
        User.is_deleted == False
    ).group_by(User.role).all()
    
    # Daily registrations for last 30 days
    daily_registrations = []
    for i in range(30):
        date_check = last_30_days + timedelta(days=i)
        count = db.query(User).filter(
            func.date(User.created_at) == date_check,
            User.is_deleted == False
        ).count()
        daily_registrations.append({
            "date": date_check.isoformat(),
            "count": count
        })
    
    return {
        "newUsersLast30Days": new_users_30_days,
        "newUsersLast7Days": new_users_7_days,
        "verifiedUsers": verified_users,
        "unverifiedUsers": unverified_users,
        "verificationRate": round((verified_users / (verified_users + unverified_users) * 100) if (verified_users + unverified_users) > 0 else 0, 2),
        "usersByRole": [{"role": role.value.upper(), "count": count} for role, count in users_by_role],
        "dailyRegistrations": daily_registrations
    }


def get_batch_analytics(db: Session, today, last_30_days):
    """Get batch analytics"""
    # Batches by status
    batches_by_status = db.query(
        Batch.status,
        func.count(Batch.id).label('count')
    ).filter(
        Batch.is_deleted == False
    ).group_by(Batch.status).all()
    
    # Batches by level
    batches_by_level = db.query(
        Batch.level,
        func.count(Batch.id).label('count')
    ).filter(
        Batch.is_deleted == False
    ).group_by(Batch.level).all()
    
    # Batches by language
    batches_by_language = db.query(
        Batch.language,
        func.count(Batch.id).label('count')
    ).filter(
        Batch.is_deleted == False
    ).group_by(Batch.language).all()
    
    # New batches in last 30 days
    new_batches_30_days = db.query(Batch).filter(
        Batch.created_at >= last_30_days,
        Batch.is_deleted == False
    ).count()
    
    # Upcoming batches
    upcoming_batches = db.query(Batch).filter(
        Batch.status == BatchStatus.upcoming,
        Batch.start_date > today,
        Batch.is_deleted == False
    ).count()
    
    # Average batch fee
    avg_fee = db.query(func.avg(Batch.fee_amount)).filter(
        Batch.is_deleted == False
    ).scalar() or 0
    
    return {
        "batchesByStatus": [{"status": status.value.upper(), "count": count} for status, count in batches_by_status],
        "batchesByLevel": [{"level": level.value.upper(), "count": count} for level, count in batches_by_level],
        "batchesByLanguage": [{"language": language, "count": count} for language, count in batches_by_language],
        "newBatchesLast30Days": new_batches_30_days,
        "upcomingBatches": upcoming_batches,
        "averageBatchFee": float(avg_fee)
    }


def get_enrollment_analytics(db: Session, today, last_30_days, this_month_start, last_month_start, last_month_end):
    """Get enrollment analytics"""
    # Enrollments by status
    enrollments_by_status = db.query(
        BatchEnrollment.status,
        func.count(BatchEnrollment.id).label('count')
    ).filter(
        BatchEnrollment.is_deleted == False
    ).group_by(BatchEnrollment.status).all()
    
    # New enrollments in different periods
    new_enrollments_30_days = db.query(BatchEnrollment).filter(
        BatchEnrollment.created_at >= last_30_days,
        BatchEnrollment.is_deleted == False
    ).count()
    
    new_enrollments_this_month = db.query(BatchEnrollment).filter(
        BatchEnrollment.created_at >= this_month_start,
        BatchEnrollment.is_deleted == False
    ).count()
    
    new_enrollments_last_month = db.query(BatchEnrollment).filter(
        BatchEnrollment.created_at >= last_month_start,
        BatchEnrollment.created_at < last_month_end,
        BatchEnrollment.is_deleted == False
    ).count()
    
    # Completion rate
    completed_enrollments = db.query(BatchEnrollment).filter(
        BatchEnrollment.status == EnrollmentStatus.completed,
        BatchEnrollment.is_deleted == False
    ).count()
    
    total_active_enrollments = db.query(BatchEnrollment).filter(
        BatchEnrollment.status.in_([EnrollmentStatus.enrolled, EnrollmentStatus.completed]),
        BatchEnrollment.is_deleted == False
    ).count()
    
    # Daily enrollments for last 30 days
    daily_enrollments = []
    for i in range(30):
        date_check = last_30_days + timedelta(days=i)
        count = db.query(BatchEnrollment).filter(
            func.date(BatchEnrollment.created_at) == date_check,
            BatchEnrollment.is_deleted == False
        ).count()
        daily_enrollments.append({
            "date": date_check.isoformat(),
            "count": count
        })
    
    return {
        "enrollmentsByStatus": [{"status": status.value.upper(), "count": count} for status, count in enrollments_by_status],
        "newEnrollmentsLast30Days": new_enrollments_30_days,
        "newEnrollmentsThisMonth": new_enrollments_this_month,
        "newEnrollmentsLastMonth": new_enrollments_last_month,
        "completionRate": round((completed_enrollments / total_active_enrollments * 100) if total_active_enrollments > 0 else 0, 2),
        "dailyEnrollments": daily_enrollments
    }


def get_payment_analytics(db: Session, today, last_30_days, this_month_start, last_month_start, last_month_end):
    """Get payment analytics"""
    # Payments by status
    payments_by_status = db.query(
        Payment.status,
        func.count(Payment.id).label('count'),
        func.sum(Payment.amount).label('total')
    ).filter(
        Payment.is_deleted == False
    ).group_by(Payment.status).all()
    
    # Revenue in different periods
    revenue_30_days = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.completed,
        Payment.paid_at >= last_30_days,
        Payment.is_deleted == False
    ).scalar() or 0
    
    revenue_this_month = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.completed,
        Payment.paid_at >= this_month_start,
        Payment.is_deleted == False
    ).scalar() or 0
    
    revenue_last_month = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.completed,
        Payment.paid_at >= last_month_start,
        Payment.paid_at < last_month_end,
        Payment.is_deleted == False
    ).scalar() or 0
    
    # Average payment amount
    avg_payment = db.query(func.avg(Payment.amount)).filter(
        Payment.status == PaymentStatus.completed,
        Payment.is_deleted == False
    ).scalar() or 0
    
    # Daily revenue for last 30 days
    daily_revenue = []
    for i in range(30):
        date_check = last_30_days + timedelta(days=i)
        revenue = db.query(func.sum(Payment.amount)).filter(
            Payment.status == PaymentStatus.completed,
            func.date(Payment.paid_at) == date_check,
            Payment.is_deleted == False
        ).scalar() or 0
        daily_revenue.append({
            "date": date_check.isoformat(),
            "revenue": float(revenue)
        })
    
    return {
        "paymentsByStatus": [
            {"status": status.value.upper(), "count": count, "total": float(total or 0)} 
            for status, count, total in payments_by_status
        ],
        "revenueLast30Days": float(revenue_30_days),
        "revenueThisMonth": float(revenue_this_month),
        "revenueLastMonth": float(revenue_last_month),
        "monthlyGrowth": round(((revenue_this_month - revenue_last_month) / revenue_last_month * 100) if revenue_last_month > 0 else 0, 2),
        "averagePayment": float(avg_payment),
        "dailyRevenue": daily_revenue
    }


def get_engagement_analytics(db: Session, last_30_days, last_7_days):
    """Get user engagement analytics"""
    # Feedback analytics
    total_feedback = db.query(Feedback).filter(Feedback.is_deleted == False).count()
    new_feedback_30_days = db.query(Feedback).filter(
        Feedback.created_at >= last_30_days,
        Feedback.is_deleted == False
    ).count()
    
    # Community engagement
    total_comments = db.query(CommunityComment).filter(CommunityComment.is_deleted == False).count()
    new_comments_30_days = db.query(CommunityComment).filter(
        CommunityComment.created_at >= last_30_days,
        CommunityComment.is_deleted == False
    ).count()
    
    total_reactions = db.query(CommunityReactions).filter(CommunityReactions.is_deleted == False).count()
    new_reactions_30_days = db.query(CommunityReactions).filter(
        CommunityReactions.created_at >= last_30_days,
        CommunityReactions.is_deleted == False
    ).count()
    
    # Attendance analytics
    total_attendance_records = db.query(Attendance).filter(Attendance.is_deleted == False).count()
    attendance_30_days = db.query(Attendance).filter(
        Attendance.created_at >= last_30_days,
        Attendance.is_deleted == False
    ).count()
    
    # Notification analytics
    total_notifications = db.query(Notification).filter(Notification.is_deleted == False).count()
    new_notifications_30_days = db.query(Notification).filter(
        Notification.created_at >= last_30_days,
        Notification.is_deleted == False
    ).count()
    
    # Course materials
    total_materials = db.query(CourseMaterial).filter(CourseMaterial.is_deleted == False).count()
    new_materials_30_days = db.query(CourseMaterial).filter(
        CourseMaterial.created_at >= last_30_days,
        CourseMaterial.is_deleted == False
    ).count()
    
    return {
        "feedback": {
            "total": total_feedback,
            "newLast30Days": new_feedback_30_days
        },
        "community": {
            "totalComments": total_comments,
            "newCommentsLast30Days": new_comments_30_days,
            "totalReactions": total_reactions,
            "newReactionsLast30Days": new_reactions_30_days
        },
        "attendance": {
            "totalRecords": total_attendance_records,
            "last30Days": attendance_30_days
        },
        "notifications": {
            "total": total_notifications,
            "newLast30Days": new_notifications_30_days
        },
        "courseMaterials": {
            "total": total_materials,
            "newLast30Days": new_materials_30_days
        }
    }


def get_performance_analytics(db: Session):
    """Get performance and quality analytics"""
    # Average batch capacity utilization
    batch_capacity_data = db.query(
        Batch.id,
        Batch.max_students,
        func.count(BatchEnrollment.id).label('enrolled_count')
    ).outerjoin(
        BatchEnrollment, and_(
            Batch.id == BatchEnrollment.batch_id,
            BatchEnrollment.status == EnrollmentStatus.enrolled,
            BatchEnrollment.is_deleted == False
        )
    ).filter(
        Batch.is_deleted == False
    ).group_by(Batch.id, Batch.max_students).all()
    
    total_capacity = sum(batch.max_students for batch in batch_capacity_data)
    total_enrolled = sum(batch.enrolled_count for batch in batch_capacity_data)
    capacity_utilization = round((total_enrolled / total_capacity * 100) if total_capacity > 0 else 0, 2)
    
    # Student to tutor ratio
    student_count = db.query(User).filter(
        User.role == UserRole.student,
        User.is_deleted == False
    ).count()
    
    tutor_count = db.query(User).filter(
        User.role == UserRole.tutor,
        User.is_deleted == False
    ).count()
    
    student_tutor_ratio = round((student_count / tutor_count) if tutor_count > 0 else 0, 2)
    
    return {
        "capacityUtilization": capacity_utilization,
        "studentTutorRatio": student_tutor_ratio,
        "totalCapacity": total_capacity,
        "totalEnrolled": total_enrolled
    }


def get_growth_metrics(db: Session, today, last_30_days, last_7_days):
    """Get growth metrics and trends"""
    # User growth
    users_30_days_ago = db.query(User).filter(
        User.created_at < last_30_days,
        User.is_deleted == False
    ).count()
    
    users_today = db.query(User).filter(
        User.is_deleted == False
    ).count()
    
    user_growth_rate = round(((users_today - users_30_days_ago) / users_30_days_ago * 100) if users_30_days_ago > 0 else 0, 2)
    
    # Enrollment growth
    enrollments_30_days_ago = db.query(BatchEnrollment).filter(
        BatchEnrollment.created_at < last_30_days,
        BatchEnrollment.is_deleted == False
    ).count()
    
    enrollments_today = db.query(BatchEnrollment).filter(
        BatchEnrollment.is_deleted == False
    ).count()
    
    enrollment_growth_rate = round(((enrollments_today - enrollments_30_days_ago) / enrollments_30_days_ago * 100) if enrollments_30_days_ago > 0 else 0, 2)
    
    # Active users (users who enrolled in last 30 days)
    active_users = db.query(User).join(StudentProfile).join(BatchEnrollment).filter(
        BatchEnrollment.created_at >= last_30_days,
        BatchEnrollment.is_deleted == False,
        User.is_deleted == False,
        StudentProfile.is_deleted == False
    ).distinct().count()
    
    return {
        "userGrowthRate": user_growth_rate,
        "enrollmentGrowthRate": enrollment_growth_rate,
        "activeUsersLast30Days": active_users,
        "totalUsersToday": users_today,
        "totalEnrollmentsToday": enrollments_today
    }
