# The Business Problem: Manual Request Triage

## The Operational Reality

Every business with customers receives unstructured requests. They arrive through:

- Web forms ("Contact Us", "Support", "Get a Quote")
- Email (support@, sales@, info@)
- Live chat messages
- Phone calls transcribed to text
- Social media DMs

Each request is different. Some are urgent ("The system is down"), some are routine ("When do you close?"), some are complex ("We need a custom integration"). An employee has to read every request and make routing decisions:

1. **What does the customer want?** (Intent classification)
2. **How urgent is this?** (Priority assignment)
3. **Who should handle it?** (Department routing)
4. **What should happen next?** (Action determination)

This is repetitive work. The same types of requests appear every day. The employee is not doing creative problem-solving. They are pattern matching: "This looks like a billing question, mark it High priority, route it to Finance, tell them to check the invoice."

## The Cost

Manual request triage consumes staff time that could be spent on higher-value work. Each request requires an employee to:

- Read the full message
- Determine what the customer wants
- Assess how urgent it is
- Decide which department should handle it
- Document their routing decision

This time adds up quickly as request volume grows. For businesses handling hundreds of requests per day, this can require dedicated staff whose sole job is initial triage.

That labor buys only classification. It does not include:
- Actually resolving the request
- Following up with the customer
- Updating systems
- Writing responses

It is pure routing overhead.

## The Inconsistency Problem

Different employees classify the same request differently.

**Example 1: Priority**

Customer message: "I can't log in. I've tried resetting my password twice."

- Employee A: Normal priority (password resets are common)
- Employee B: High priority (customer is frustrated, tried twice)
- Employee C: Urgent priority (customer is blocked from using the product)

Who is right? All three are defensible interpretations. But inconsistent priority leads to:
- Urgent issues being treated as routine
- Routine issues consuming limited resources
- Frustrated customers whose "urgent" request sits in the Normal queue

**Example 2: Department**

Customer message: "My invoice shows a charge I don't recognize."

- Employee A → Billing (it mentions an invoice)
- Employee B → Customer Support (it's a question)
- Employee C → Sales (might need account history to explain the charge)

If the request goes to Billing but the issue requires Sales context, it gets bounced between departments. The customer waits longer.

## The Scaling Problem

Manual triage does not scale linearly. As request volume grows, businesses face compounding challenges:

- More employees need training on classification rules
- Classification standards drift over time as different people learn the system differently
- Managers spend time auditing classifications for consistency
- New hires require training periods before they can accurately route requests
- Coordination overhead increases (who handles which requests, shift coverage, vacation coverage)

The business ends up paying multiple people to perform the same repetitive pattern-matching task, and consistency actually gets worse as the team grows.

## The Opportunity Cost

Every hour spent reading and routing requests is an hour not spent:
- Resolving complex customer issues
- Improving products based on feedback patterns
- Training new team members
- Building relationships with high-value customers

The employee doing manual triage is often overqualified for the task. They have customer service skills, product knowledge, and communication abilities. Asking them to spend hours per day deciding "Is this Sales or Support?" is underutilizing their talent.

## The Existing "Solutions" and Why They Fail

### 1. Email Filters and Rules

Many businesses try to solve this with email rules:
- Subject contains "invoice" → route to Billing
- Subject contains "technical" → route to Support

This fails because:
- Customers do not write structured subject lines
- "Need help" is not a useful subject line
- Complex requests do not fit into keyword categories
- Rules require constant maintenance as new patterns emerge

### 2. Multi-Step Forms

Some businesses create long forms with dropdown menus:
- "Select your issue type: [Billing, Technical, Sales, Other]"
- "Select priority: [Low, Normal, High, Urgent]"
- "Select department: [...]"

This fails because:
- Customers select the wrong category (they do not know internal department structures)
- Everyone marks their request as "Urgent" (no objective criteria)
- Long forms reduce completion rates
- Customers get frustrated ("Why should I do your job?")

### 3. AI Chatbots

Some businesses deploy chatbots that ask clarifying questions:
- Bot: "Are you having a technical issue or a billing question?"
- Customer: "Both. I was charged twice and now the app won't load."

This fails because:
- Chatbots frustrate customers who want to talk to a human
- Multi-turn conversations take longer than reading a single message
- Customers answer questions incorrectly just to reach a human
- The bot cannot classify complex or ambiguous requests

## What an Ideal Solution Looks Like

The ideal solution:

1. **Accepts free-form input.** Customers write naturally. No dropdowns, no forced structure.

2. **Classifies instantly.** No multi-turn conversation. The system reads once and decides.

3. **Uses consistent criteria.** The same request always gets the same classification, regardless of who (or what) processes it.

4. **Learns from context.** "I've tried resetting my password twice" should be recognized as more urgent than "I forgot my password."

5. **Routes to the right department.** Not based on keywords, but on actual semantic understanding.

6. **Scales effortlessly.** 50 requests or 5000 requests, the cost per request does not change.

7. **Produces structured data.** Not just "send this to Support," but "Intent: Technical Support, Priority: High, Department: Customer Support, Suggested Action: Investigate login issue and provide password reset link, Summary: Customer has attempted password reset twice without success and cannot access their account."

That structured data can:
- Populate a ticket in the CRM
- Trigger automated workflows
- Provide analytics on request volume by type
- Surface patterns in customer issues

This is not a theoretical ideal. This is what AI classification provides today.

## Why This Problem is a Good Fit for AI

AI excels at tasks that are:

1. **Pattern recognition** - Classifying text into categories is a core AI capability
2. **High volume** - AI can process thousands of requests per hour
3. **Consistent** - AI applies the same criteria to every request
4. **Low stakes** - If the AI misclassifies, a human can correct it (not life-or-death)
5. **Structured output** - AI can return JSON, not just natural language

AI struggles at tasks that require:
- Empathy and emotional intelligence
- Multi-step reasoning over many turns
- Accessing private customer history
- Making irreversible decisions

Request classification is firmly in the "AI excels" category.

## The Economics

AI classification changes the cost structure fundamentally:

**Manual triage costs scale with volume.** Each new request requires human time. Doubling your customer base means doubling your triage staff.

**AI classification costs are essentially fixed.** API costs are low, and infrastructure costs do not change whether you process 100 requests or 10,000 requests per day. The cost per request approaches zero as volume grows.

Even accounting for imperfect accuracy and the need for human review in ambiguous cases, the economic case for AI classification is compelling. The staff time saved can be redirected to actually helping customers rather than routing their requests.

## Why Businesses Do Not Do This Already

If the economic case is this compelling, why do most businesses still do manual triage?

1. **They do not know AI can do this.** Many decision-makers think AI is only for chatbots or science fiction tasks.

2. **They think it requires machine learning expertise.** Businesses imagine they need a data science team to build and train models.

3. **They tried chatbots and were disappointed.** Early AI solutions were conversation-focused, not classification-focused.

4. **They assume it is expensive.** Older models (GPT-4) were expensive for high-volume classification. Newer models (Claude Haiku) changed the economics.

5. **They do not know how to integrate it.** Even if they understand AI can classify text, they do not know how to connect it to their CRM, ticketing system, or database.

This project demonstrates that:
- AI classification is practical today
- It integrates with standard web application stacks
- It works with minimal code and no ML expertise
- It costs almost nothing to run

The business problem is real. The solution is proven. The barrier is education, not technology.
