from app.model.conversation_interactions import ConversationInteractions
from app.model.free_conversation import FreeConversation
from app.model.student_profile import StudentProfile
from app.model.user import User

from seeds.common import SEED_COUNT, SEED_EMAIL_DOMAIN
from seeds.community_seed_helpers import SEED_CONV_INTERACTION_MARKER, SEED_CONV_MARKER


def _load_seeded_conversations(db):
    return (
        db.query(FreeConversation)
        .join(StudentProfile, FreeConversation.profile_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .filter(FreeConversation.starting_topic.like(f"{SEED_CONV_MARKER}%"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def _load_seeded_interactions(db):
    return (
        db.query(ConversationInteractions)
        .join(FreeConversation, ConversationInteractions.conversation_id == FreeConversation.id)
        .join(StudentProfile, FreeConversation.profile_id == StudentProfile.id)
        .join(User, StudentProfile.user_id == User.id)
        .filter(ConversationInteractions.student_text.like(f"{SEED_CONV_INTERACTION_MARKER}%"))
        .order_by(User.email)
        .limit(SEED_COUNT)
        .all()
    )


def seed_conversation_interactions(db, conversation_ids=None):
    """Seed 25 conversation interactions (one per seeded free conversation)."""
    existing = _load_seeded_interactions(db)
    if len(existing) >= SEED_COUNT:
        return [i.id for i in existing]

    conversations = (
        db.query(FreeConversation)
        .filter(FreeConversation.id.in_(conversation_ids[:SEED_COUNT]))
        .all()
        if conversation_ids
        else _load_seeded_conversations(db)
    )

    student_lines = [
        "Hi, I'd like to practice this topic today.",
        "Could you ask me a follow-up question?",
        "I'm not sure how to phrase that in English.",
        "Can we try a more challenging scenario?",
        "That was helpful — can you correct my grammar?",
        "How would a native speaker say this?",
        "Let me try answering in a full sentence.",
        "What vocabulary should I use here?",
        "Can you give me an example response?",
        "I want to sound more natural and polite.",
        "Could we role-play a real situation?",
        "How do I keep the conversation going?",
        "What's a good way to open this topic?",
        "Can you explain the nuance of that phrase?",
        "I'll attempt a longer answer this time.",
        "Was my pronunciation understandable?",
        "What mistakes did I make?",
        "Can we switch to a formal register?",
        "How can I disagree politely?",
        "I'd like to practice agreeing and clarifying.",
        "Could you summarize what I said?",
        "What should I study before next time?",
        "Can we repeat that with different vocabulary?",
        "I feel more confident now — one more question.",
        "Thanks, that covers this topic for today.",
    ]

    existing_conversation_ids = {i.conversation_id for i in existing}
    interactions_to_add = []

    for idx, conversation in enumerate(conversations[:SEED_COUNT]):
        if conversation.id in existing_conversation_ids:
            continue
        interactions_to_add.append(
            ConversationInteractions(
                conversation_id=conversation.id,
                student_text=f"{SEED_CONV_INTERACTION_MARKER} {student_lines[idx]}",
                student_audio_url=f"https://media.fidel.seed.local/conversations/{idx + 1:02d}/student.mp3",
                ai_text=(
                    f"Great effort! Here's feedback and a model answer for interaction {idx + 1}."
                ),
                ai_audio_url=f"https://media.fidel.seed.local/conversations/{idx + 1:02d}/ai.mp3",
            )
        )

    if interactions_to_add:
        db.add_all(interactions_to_add)
        db.flush()

    return [i.id for i in _load_seeded_interactions(db)]
