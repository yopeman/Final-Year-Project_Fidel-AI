from datetime import datetime
from typing import Optional

from ariadne import MutationType, ObjectType, QueryType
from sqlalchemy.orm import Session

from ..model.payment import Payment, PaymentStatus
from ..model.user import User
from ..model.student_profile import StudentProfile
from ..model.batch_enrollment import BatchEnrollment, EnrollmentStatus
from ..model.batch import Batch
from ..util.payment_service import PaymentService
from ..config.settings import settings
from ..util.email_service import send_notification
import uuid


query = QueryType()
mutation = MutationType()
payment = ObjectType("Payment")


payment_service = PaymentService(settings.chapa_secret)

# Payment status mapping
def map_payment_status(status_str: str) -> PaymentStatus:
    status_map = {
        "PENDING": PaymentStatus.pending,
        "COMPLETED": PaymentStatus.completed,
        "CANCELED": PaymentStatus.canceled,
        "FAILED": PaymentStatus.failed,
    }
    return status_map.get(status_str.upper(), PaymentStatus.pending)


@query.field("payments")
def resolve_payments(_, info, enrollmentId=None, status=None):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    query_obj = db.query(Payment).filter(Payment.is_deleted == False)
    
    # Filter by enrollmentId if provided
    if enrollmentId:
        query_obj = query_obj.filter(Payment.enrollment_id == enrollmentId)
    
    # Filter by status if provided
    if status:
        payment_status = map_payment_status(status)
        query_obj = query_obj.filter(Payment.status == payment_status)
    
    return query_obj.all()


@query.field("payment")
def resolve_payment(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    payment_obj = db.query(Payment).filter(
        Payment.id == id, 
        Payment.is_deleted == False
    ).first()

    if not payment_obj:
        raise Exception("Payment not found")
    return payment_obj


@mutation.field("makePayment")
def resolve_make_payment(_, info, enrollmentId: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    
    # Validate that enrollment exists
    enrollment = db.query(BatchEnrollment).filter(
        BatchEnrollment.id == enrollmentId,
        BatchEnrollment.is_deleted == False
    ).first()
    
    if not enrollment:
        raise Exception("Enrollment not found")

    # Check if enrollment is in a valid state for payment
    if enrollment.status.value not in ["applied", "enrolled"]:
        raise Exception("Cannot make payment for enrollment in current status")

    # Check if there's already a completed payment for this enrollment
    existing_payment = db.query(Payment).filter(
        Payment.enrollment_id == enrollmentId,
        Payment.status == PaymentStatus.completed,
        Payment.is_deleted == False
    ).first()

    batch = db.query(Batch).filter(
        Batch.id == enrollment.batch_id,
        Batch.is_deleted == False
    ).first()

    if not batch:
        raise Exception("Batch not found")
    
    if existing_payment:
        raise Exception("Payment already completed for this enrollment")

    transaction_id = str(uuid.uuid4())
    accept_payment = payment_service.accept_payment(
        amount=batch.fee_amount,
        currency='ETB',
        # email=current_user.email,
        first_name=current_user.first_name,
        last_name=current_user.last_name,
        tx_ref=transaction_id,
        callback_url=f'{settings.backend_url}/webhook'
    )

    # Create new payment
    new_payment = Payment(
        enrollment_id=enrollment.id,
        amount=batch.fee_amount,
        currency='ETB',
        transaction_id=transaction_id,
        checkout_url=accept_payment.data.checkout_url,
        status=PaymentStatus.pending,  # Default to pending
    )

    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment


def payment_webhook(status: str, trx_ref: str, db: Session):
    if trx_ref:
        payment_obj = db.query(Payment).filter(
            Payment.transaction_id == trx_ref,
            Payment.is_deleted == False,
            Payment.status == PaymentStatus.pending
        ).first()

        if not payment_obj:
            return
        
        if status == 'success':
            payment_verify = payment_service.verify_payment(tx_ref=trx_ref)
            payment_obj.status = PaymentStatus.completed
            payment_obj.receipt_url = payment_service.receipt_url(reference_id=payment_verify.data.reference)
            payment_obj.paid_at = datetime.now()

            enrollment = db.query(BatchEnrollment).filter(
                BatchEnrollment.id == payment_obj.enrollment_id,
                BatchEnrollment.is_deleted == False
            ).first()
            enrollment.status = EnrollmentStatus.enrolled
            
            # Send notification to student about successful payment
            profile = db.query(StudentProfile).filter(
                StudentProfile.id == enrollment.profile_id,
                StudentProfile.is_deleted == False
            ).first()
            
            send_notification(
                user_id=profile.user_id,
                title="Payment Successful",
                content=f"Your payment of {payment_obj.amount} {payment_obj.currency} for batch '{enrollment.batch.name}' has been successfully processed. Your enrollment is now confirmed.",
                db=db
            )
        else:
            payment_obj.status = PaymentStatus.failed
            payment_service.cancel_transaction(payment_obj.transaction_id)
            
            # Send notification to student about failed payment
            enrollment = db.query(BatchEnrollment).filter(
                BatchEnrollment.id == payment_obj.enrollment_id,
                BatchEnrollment.is_deleted == False
            ).first()
            
            profile = db.query(StudentProfile).filter(
                StudentProfile.id == enrollment.profile_id,
                StudentProfile.is_deleted == False
            ).first()
            
            send_notification(
                user_id=profile.user_id,
                title="Payment Failed",
                content=f"Your payment of {payment_obj.amount} {payment_obj.currency} for batch '{enrollment.batch.name}' has failed. Please try again or contact support if the issue persists.",
                db=db
            )

        db.commit()
        db.refresh(payment_obj)



@mutation.field("verifyPayment")
def resolve_verify_payment(_, info, enrollmentId: str):
    current_user: User = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]

    # Validate enrollment exists
    enrollment = db.query(BatchEnrollment).filter(
        BatchEnrollment.id == enrollmentId,
        BatchEnrollment.is_deleted == False
    ).first()

    if not enrollment:
        raise Exception("Enrollment not found")

    if enrollment.status == EnrollmentStatus.applied:
        payment_obj = db.query(Payment).filter(
            Payment.enrollment_id == enrollmentId,
            Payment.status == PaymentStatus.completed,
            Payment.is_deleted == False
        ).first()
        if payment_obj:
            return payment_obj

    payment_obj = db.query(Payment).filter(
        Payment.enrollment_id == enrollmentId,
        Payment.is_deleted == False
    ).order_by(Payment.created_at.desc()).first()

    if not payment_obj:
        raise Exception("No pending payment found for this enrollment")
    return payment_obj


@mutation.field("cancelPayment")
def resolve_cancel_payment(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    db: Session = info.context["db"]
    payment_obj = db.query(Payment).filter(
        Payment.id == id, 
        Payment.is_deleted == False
    ).first()

    if not payment_obj:
        raise Exception("Payment not found")

    # Only allow cancellation of pending payments
    if payment_obj.status != PaymentStatus.pending:
        raise Exception("Cannot cancel payment that is not pending")

    # Update payment status to failed
    payment_service.cancel_transaction(payment_obj.transaction_id)
    payment_obj.status = PaymentStatus.canceled
    payment_obj.updated_at = datetime.now()
    
    db.commit()
    db.refresh(payment_obj)
    return payment_obj


@mutation.field("deletePayment")
def resolve_delete_payment(_, info, id):
    current_user = info.context.get("current_user")
    if not current_user:
        raise Exception("Not authenticated")

    # Check if user has admin role
    if current_user.role.value != "admin":
        raise Exception("Unauthorized: Admin access required")

    db: Session = info.context["db"]
    payment_obj = db.query(Payment).filter(
        Payment.id == id, 
        Payment.is_deleted == False
    ).first()

    if not payment_obj:
        raise Exception("Payment not found")

    # Mark as deleted
    payment_obj.is_deleted = True
    payment_obj.deleted_at = datetime.now()
    db.commit()
    db.refresh(payment_obj)

    return True


# Payment field resolvers
@payment.field("id")
def resolve_id(payment_obj, info):
    return payment_obj.id


@payment.field("enrollmentId")
def resolve_enrollment_id(payment_obj, info):
    return payment_obj.enrollment_id


@payment.field("amount")
def resolve_amount(payment_obj, info):
    return payment_obj.amount


@payment.field("currency")
def resolve_currency(payment_obj, info):
    return payment_obj.currency


@payment.field("method")
def resolve_method(payment_obj, info):
    return payment_obj.method


@payment.field("status")
def resolve_status(payment_obj, info):
    return payment_obj.status.value.upper()


@payment.field("paidAt")
def resolve_paid_at(payment_obj, info):
    return payment_obj.paid_at


@payment.field("transactionId")
def resolve_transaction_id(payment_obj, info):
    return payment_obj.transaction_id


@payment.field("checkoutUrl")
def resolve_checkout_url(payment_obj, info):
    return payment_obj.checkout_url


@payment.field("receiptUrl")
def resolve_receipt_url(payment_obj, info):
    return payment_obj.receipt_url


@payment.field("createdAt")
def resolve_created_at(payment_obj, info):
    return payment_obj.created_at


@payment.field("updatedAt")
def resolve_updated_at(payment_obj, info):
    return payment_obj.updated_at


@payment.field("isDeleted")
def resolve_is_deleted(payment_obj, info):
    return payment_obj.is_deleted


@payment.field("deletedAt")
def resolve_deleted_at(payment_obj, info):
    return payment_obj.deleted_at


@payment.field("enrollment")
def resolve_enrollment(payment_obj, info):
    db: Session = info.context["db"]
    enrollment = db.query(BatchEnrollment).filter(
        BatchEnrollment.id == payment_obj.enrollment_id,
        BatchEnrollment.is_deleted == False
    ).first()
    return enrollment