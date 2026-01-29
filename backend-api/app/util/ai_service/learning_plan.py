import logging

from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama

from ...model.student_profile import StudentProfile

logger = logging.getLogger(__name__)


def generate_learning_plan(profile: StudentProfile) -> str:
    """
    Generate a personalized learning plan for English language based on the student's profile.

    Args:
        profile (StudentProfile): The student's profile containing age range, proficiency, etc.

    Returns:
        str: The generated learning plan structured in modules and lessons.
    """

    llm = ChatOllama(model="gemma3:4b")
    prompts = PromptTemplate.from_template(
        """
    # PERSONALIZED ENGLISH LANGUAGE LEARNING PLAN DESIGN
    
    ## ROLE & EXPERTISE
    You are an experienced English language curriculum designer specializing in:
    - Creating age-appropriate language learning pathways
    - Designing scaffolded learning experiences from beginner to advanced levels
    - Addressing native language interference patterns
    - Balancing structured learning with practical application
    
    ## STUDENT PROFILE ANALYSIS
    
    ### Demographic Information
    - **Age Group**: {age_range}
    - **Native Language Background**: {native_language}
    - **Current Proficiency Level**: {proficiency}
    
    ### Learning Objectives & Parameters
    - **Primary Learning Goal**: {learning_goal}
    - **Target Learning Duration**: {target_duration} {duration_unit}
    - **Constraints/Limitations**: {constraints}
    
    ## CURRICULUM DESIGN PRINCIPLES
    
    Apply these pedagogical principles:
    1. **Progressive Difficulty**: Start simple, gradually increase complexity
    2. **Practical Application**: Focus on immediately usable language skills
    3. **Skill Integration**: Combine listening, speaking, reading, writing appropriately
    4. **Motivation Maintenance**: Include engaging, relevant content
    5. **Measurable Progress**: Design clear milestones and checkpoints
    
    ## TASK: CREATE STRUCTURED LEARNING PLAN
    
    Design a comprehensive English learning plan with this structure:
    
    ### Overall Plan Structure
    - **Total Duration**: {target_duration} {duration_unit}
    - **Module Count**: 4-6 modules (adjust based on duration)
    - **Lessons per Module**: 5-8 lessons (balance depth vs. coverage)
    
    ### Module Requirements
    Each module must include:
    1. **Module Title**: Clear, descriptive, and motivating
    2. **Module Description**: 
       - Learning objectives for this module
       - Key skills students will develop
       - How this module connects to overall goal
    
    ### Lesson Requirements
    Each lesson must include:
    1. **Lesson Title**: Action-oriented and specific
    2. **Lesson Description**: 
       - What will be learned in this lesson
       - Practical application of the skill
       - Connection to real-world use
    3. **Estimated Time**: Realistic time allocation (e.g., 30-60 minutes)
       *Consider: {target_duration} total timeframe
    
    ## CONTENT SPECIFICATIONS
    
    ### Age-Appropriate Design
    - **For children ({age_range})**: Include games, songs, visual elements
    - **For teenagers ({age_range})**: Include social media contexts, peer communication
    - **For adults ({age_range})**: Include professional/work contexts, practical scenarios
    
    ### Proficiency-Level Adaptation
    - **Beginner ({proficiency})**: Focus on basic vocabulary, simple sentences, high-frequency phrases
    - **Intermediate ({proficiency})**: Include grammar structures, expanded vocabulary, paragraph construction
    - **Advanced ({proficiency})**: Focus on nuance, idioms, formal writing, specialized vocabulary
    
    ### Native Language Considerations
    - Address specific challenges for {native_language} speakers
    - Include contrastive analysis where helpful
    - Provide targeted practice for difficult sounds/structures
    
    ## OUTPUT FORMAT REQUIREMENTS
    
    Use clear Markdown formatting:
    
    ### Overall Plan Overview
    Brief introduction explaining the plan's approach and structure
    
    ### Module 1: [Module Title]
    **Description**: [2-3 sentences explaining module focus]
    
    #### Lesson 1.1: [Lesson Title]
    - **Description**: [What students learn]
    - **Estimated Time**: [XX minutes/hours]
    - **Key Focus**: [Specific skill or concept]
    
    #### Lesson 1.2: [Lesson Title]
    - **Description**: [What students learn]
    - **Estimated Time**: [XX minutes/hours]
    - **Key Focus**: [Specific skill or concept]
    
    [Continue with remaining lessons...]
    
    ### Module 2: [Module Title]
    [Continue same structure...]
    
    ## IMPORTANT CONSIDERATIONS
    
    1. **Time Management**: Ensure total estimated time aligns with {target_duration}
    2. **Progressive Difficulty**: Each module should build on previous knowledge
    3. **Skill Balance**: Mix vocabulary, grammar, listening, speaking, reading, writing
    4. **Engagement**: Include varied activities and real-world applications
    5. **Assessment**: Plan for periodic review and practice
    
    Now, create a comprehensive, personalized English learning plan:
    """
    )

    chain = prompts | llm
    try:
        response = chain.invoke(
            {
                "age_range": profile.age_range,
                "proficiency": profile.proficiency,
                "native_language": profile.native_language,
                "learning_goal": profile.learning_goal,
                "target_duration": profile.target_duration,
                "duration_unit": profile.duration_unit,
                "constraints": profile.constraints,
            }
        )
        return response.content
    except Exception as err:
        raise err


def update_learning_plan(profile: StudentProfile, improvements: str) -> str:
    """
    Update an existing learning plan for English language based on improvement instructions.

    Args:
        profile (StudentProfile): The student's profile containing age range, proficiency, etc.
        improvements (str): Instructions for improving the current plan.

    Returns:
        str: The updated learning plan structured in modules and lessons.
    """

    llm = ChatOllama(model="gemma3:4b")
    prompts = PromptTemplate.from_template(
        """
    # LEARNING PLAN ENHANCEMENT & OPTIMIZATION
    
    ## ROLE & OBJECTIVE
    You are an expert educational consultant specializing in curriculum refinement. Your task is to enhance an existing learning plan based on specific improvement requests while maintaining pedagogical integrity.
    
    ## STUDENT PROFILE CONTEXT
    
    ### Current Student Profile
    - **Age Group**: {age_range}
    - **Native Language**: {native_language}
    - **Current Proficiency**: {proficiency}
    - **Learning Goal**: {learning_goal}
    - **Time Constraints**: {target_duration} {duration_unit}
    - **Other Constraints**: {constraints}
    
    ## IMPROVEMENT REQUEST ANALYSIS
    
    ### Requested Enhancements:
    {improvements}
    
    ### Current Plan (Baseline):
    {current_plan}
    
    ## ENHANCEMENT GUIDELINES
    
    Apply these principles when updating the plan:
    
    1. **Preserve Effective Elements**: Keep what's working well in the current plan
    2. **Address Specific Requests**: Directly respond to all improvement instructions
    3. **Maintain Coherence**: Ensure changes create a logical, progressive flow
    4. **Optimize Time Allocation**: Respect the {target_duration} constraint
    
    ## SPECIFIC IMPROVEMENT STRATEGIES
    
    ### For Content-Related Improvements:
    - **Add missing topics**: Integrate seamlessly into existing structure
    - **Remove irrelevant content**: Replace with more valuable material
    - **Adjust difficulty**: Modify activities to better match {proficiency} level
    
    ### For Structural Improvements:
    - **Reorganize modules**: Improve logical flow while maintaining coverage
    - **Reallocate time**: Adjust lesson durations to optimize learning
    - **Add/remove modules**: Ensure overall balance remains intact
    
    ### For Engagement Improvements:
    - **Increase variety**: Add different activity types
    - **Enhance relevance**: Connect more strongly to {learning_goal}
    - **Improve pacing**: Adjust the speed of progression
    
    ## UPDATE PROCESS
    
    Follow this systematic approach:
    
    1. **Analyze Current Plan**: Identify strengths and weaknesses
    2. **Map Improvements**: Connect each request to specific plan elements
    3. **Design Modifications**: Create targeted changes
    4. **Quality Check**: Ensure modifications improve the plan
    
    ## OUTPUT REQUIREMENTS
    
    ### Format Preservation
    Maintain the original Markdown structure while enhancing content:
    
    - Keep module/lesson hierarchy
    - Maintain consistent formatting
    - Preserve time estimates (update if necessary)
    
    ### Content Enhancement
    For each modified element, clearly indicate:
    1. **What was changed**
    2. **Why it was changed** (connection to improvement request)
    3. **How it improves learning**
    
    ### Quality Standards
    The updated plan must be:
    - **More effective** than the original
    - **Better aligned** with {learning_goal}
    - **More engaging** for {age_range} learner
    - **More appropriate** for {proficiency} level
    - **More respectful** of {constraints}
    
    ## SPECIAL CONSIDERATIONS
    
    ### Age-Appropriate Modifications
    Ensure all changes are suitable for {age_range}:
    - Adjust language complexity
    - Select appropriate examples
    - Choose relevant contexts
    
    ### Proficiency-Level Adjustments
    Tailor modifications to {proficiency} level:
    - Beginner: Simplify, add more practice
    - Intermediate: Add nuance, increase complexity
    - Advanced: Focus on refinement, specialized vocabulary
    
    ### Time Management
    Total duration must remain within {target_duration} {duration_unit}
    - If adding content, remove less valuable material
    - If extending duration, provide justification
    
    Now, create an enhanced version of the learning plan that addresses all improvement requests while maintaining educational quality:
    """
    )

    chain = prompts | llm
    try:
        response = chain.invoke(
            {
                "age_range": profile.age_range,
                "proficiency": profile.proficiency,
                "native_language": profile.native_language,
                "learning_goal": profile.learning_goal,
                "target_duration": profile.target_duration,
                "duration_unit": profile.duration_unit,
                "constraints": profile.constraints,
                "current_plan": profile.ai_learning_plan,
                "improvements": improvements,
            }
        )
        return response.content
    except Exception as err:
        raise err
