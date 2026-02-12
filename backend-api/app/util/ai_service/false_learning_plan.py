from ...model.student_profile import StudentProfile

LEARNING_PLAN = '''
### Overall Plan Overview

This 30-day learning plan is designed for an Amharic speaker at a beginner level aiming to build essential English skills for travel.  The plan focuses on practical, immediately useful language through a combination of interactive lessons, engaging activities, and a gradual increase in difficulty. We'll specifically address common challenges for Amharic speakers – particularly pronunciation and sentence structure – and prioritize communicative competence over perfect grammatical accuracy in the early stages. The plan includes a balanced approach to listening, speaking, reading, and writing, with a heavy emphasis on practical scenarios encountered when traveling.

### Module 1: Greetings & Introductions - Setting the Stage (5 Days)

**Description:** This module introduces basic greetings, introductions, and essential phrases for polite conversation. It focuses on building confidence in initiating interactions and understanding simple responses. 

#### Lesson 1.1: Hello & Goodbye - Basic Greetings (30 minutes)
- **Description:** Students learn to say “Hello,” “Goodbye,” “Good morning,” “Good evening,” and “How are you?”  They’ll practice pronunciation with a focus on the differences between Amharic and English sounds.
- **Estimated Time:** 30 minutes
- **Key Focus:** Pronunciation of common greetings, understanding basic politeness.

#### Lesson 1.2: Introducing Yourself - Name & Origin (45 minutes)
- **Description:** Students learn to say "My name is..." and "I'm from..." Students practice introducing themselves to a partner and asking the same question.
- **Estimated Time:** 45 minutes
- **Key Focus:**  Building basic sentences, using "I" and "My".

#### Lesson 1.3: Simple Questions - “What’s your name?” (30 minutes)
- **Description:** Students learn to ask “What’s your name?” and understand the responses. Role-playing scenarios.
- **Estimated Time:** 30 minutes
- **Key Focus:**  Using question words, practicing listening comprehension.

#### Lesson 1.4: Numbers 1-10 - Counting Basics (30 minutes)
- **Description:** Students learn to count from 1 to 10. Practical application: Ordering drinks, small purchases.
- **Estimated Time:** 30 minutes
- **Key Focus:** Basic numeracy, associating numbers with objects.

#### Lesson 1.5:  Role-Play: Meeting Someone New (60 minutes)
- **Description:** Students practice all greetings and introductions learned in the module through a guided role-play scenario with a partner.
- **Estimated Time:** 60 minutes
- **Key Focus:**  Applying learned phrases in a communicative context.


### Module 2: Essential Travel Phrases - Getting Around (6 Days)

**Description:** This module equips students with phrases for common travel situations, such as asking for directions, ordering food, and making simple requests.

#### Lesson 2.1: Asking for Directions - “Where is…?” (45 minutes)
- **Description:** Students learn to ask “Where is…?” and common landmarks like “the hotel,” “the train station.” Includes visual aids (pictures of locations).
- **Estimated Time:** 45 minutes
- **Key Focus:** Understanding and using location phrases.

#### Lesson 2.2: Ordering Food – “I would like…” (30 minutes)
- **Description:** Students learn to order simple food and drinks – "I would like a coffee," "I would like a sandwich.”
- **Estimated Time:** 30 minutes
- **Key Focus:**  Using polite requests, expanding vocabulary of food and drinks.

#### Lesson 2.3: Numbers 11-20 - Practicing Numbers (30 minutes)
- **Description:** Students learn to count from 11 to 20, practicing with real-life scenarios (cost of items).
- **Estimated Time:** 30 minutes
- **Key Focus:**  Reinforcing numeracy skills.

#### Lesson 2.4:  Asking for Help - "Can you help me?" (45 minutes)
- **Description:** Students learn to ask for assistance using “Can you help me?” and appropriate responses.
- **Estimated Time:** 45 minutes
- **Key Focus:**  Politeness and requesting assistance.

#### Lesson 2.5:  Role-Play: Ordering at a Restaurant (60 minutes)
- **Description:**  Students practice all travel phrases through a role-play scenario simulating ordering food in a restaurant.
- **Estimated Time:** 60 minutes
- **Key Focus:**  Fluency and confidence in conversational scenarios.



### Module 3:  Transportation & Accommodation (5 Days)

**Description:** This module focuses on vocabulary and phrases related to transportation and booking accommodation.

#### Lesson 3.1:  Transport - Bus, Train, Taxi (30 minutes)
- **Description:**  Learning vocabulary for different modes of transport and simple phrases for asking about them.
- **Estimated Time:** 30 minutes
- **Key Focus:**  Expanding vocabulary, recognizing common transport-related words.

#### Lesson 3.2: Booking a Hotel – “I would like a room” (45 minutes)
- **Description:**  Students learn the phrases needed to book a room at a hotel - “I would like a room”, “How much is it?”
- **Estimated Time:** 45 minutes
- **Key Focus:**  Using relevant phrases in a transactional setting.

#### Lesson 3.3:  Asking About Prices (30 minutes)
- **Description:**  Students learn to ask "How much does it cost?" and understand the responses.
- **Estimated Time:** 30 minutes
- **Key Focus:**  Understanding prices and making purchases.

#### Lesson 3.4:  Describing Accommodation (45 minutes)
- **Description:**  Introduces simple adjectives to describe accommodation (e.g., "small," "large," "clean").
- **Estimated Time:** 45 minutes
- **Key Focus:**  Expanding descriptive vocabulary.

#### Lesson 3.5:  Review & Practice – Travel Scenario (60 minutes)
- **Description:**  Combines all learned phrases to practice a complete travel scenario: booking a hotel and asking for directions.
- **Estimated Time:** 60 minutes
- **Key Focus:**  Integration of learned concepts.



### Module 4:  Review & Consolidation (4 Days)

**Description:** This module provides a comprehensive review of all learned material, focusing on reinforcement and building confidence.

#### Lesson 4.1:  Vocabulary Review – Key Phrases & Words (60 minutes)
- **Description:**  Interactive game-based review of all vocabulary covered throughout the course.
- **Estimated Time:** 60 minutes
- **Key Focus:**  Reinforcing vocabulary knowledge through engaging activities.

#### Lesson 4.2:  Grammar Recap - Simple Present (30 minutes)
- **Description:**  Quick review of the simple present tense (used for routines and facts), with practical examples.
- **Estimated Time:** 30 minutes
- **Key Focus:**  Understanding basic grammar structure.

#### Lesson 4.3:  Listening Comprehension – Travel Dialogue (45 minutes)
- **Description:**  Listening to short dialogues involving travel scenarios and answering comprehension questions.
- **Estimated Time:** 45 minutes
- **Key Focus:**  Developing listening skills.

#### Lesson 4.4:  Final Role-Play & Assessment (60 minutes)
- **Description:** Students engage in a final role-play scenario, demonstrating their ability to use all learned skills and phrases.  A brief informal assessment is conducted.
- **Estimated Time:** 60 minutes
- **Key Focus:**  Applying overall learning and assessing progress.
'''.strip()

def generate_learning_plan(profile: StudentProfile) -> str:
    return LEARNING_PLAN

def update_learning_plan(profile: StudentProfile, improvements: str) -> str:
    return LEARNING_PLAN