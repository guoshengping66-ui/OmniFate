import { createEditorialArticle, type EditorialArticle } from "./types.ts"

export const ASTROLOGY_AND_METAPHYSICS_ARTICLES: EditorialArticle[] = [
  createEditorialArticle({
    id: "birth-chart-self-reflection",
    title_en: "How to Read a Birth Chart for Self-Reflection: Sun, Moon, Rising, and Context",
    summary_en: "A grounded introduction to Sun, Moon, and Rising signs that uses a birth chart for self-reflection without turning symbols into fixed predictions.",
    category: "chart analysis", tags_en: ["birth chart", "Sun Moon Rising", "astrology", "self-reflection"], tags_zh: ["birth chart", "astrology"], read_time: 9, cover_emoji: "✧", created_at: "2026-07-17",
    relatedIds: ["bazi-vs-western-astrology", "chinese-metaphysics-beginners", "tarot-self-reflection-guide"],
    faq: [
      { question: "What are Sun, Moon, and Rising signs?", answer: "They are three commonly discussed points in a Western birth chart: core solar sign symbolism, lunar emotional symbolism, and the sign rising at the eastern horizon." },
      { question: "Do I need an exact birth time?", answer: "An exact time is especially helpful for the Rising sign and houses. If the time is uncertain, treat those parts of a chart as uncertain too." },
    ],
    directAnswer: `A birth chart is a symbolic snapshot of the sky for a time and place of birth. In popular Western astrology, the Sun, Moon, and Rising sign are common entry points because they offer three different lenses rather than one identity label. The Sun is often discussed in relation to purpose or conscious style, the Moon in relation to needs and responses, and the Rising sign in relation to first impressions or orientation. These are interpretive traditions, not measurements of personality.

For self-reflection, the value of the chart is not in proving that you are a certain type. It is in giving you language for questions you may otherwise skip: what restores me after a demanding day, what patterns appear when I feel exposed, and what situations make me perform a version of myself that no longer fits?`,
    framework: `Start with accurate inputs. A birth date, place, and time affect which chart points are calculated. If your time is unknown, do not force certainty around a Rising sign or house placement. Use what is reliable, and leave the rest open. This is a useful practice in any reflective system: uncertainty is information, not a failure.

Next, read placements as a conversation. A Sun sign is not a complete personality. The Moon sign is not a complete emotional history. A Rising sign is not a mask you must wear. Ask how the symbols relate to actual situations. You might notice that a description of initiative resonates at work but not in close relationships, or that a Moon-sign prompt helps you name a need for privacy. Keep the observation concrete.

Finally, avoid turning transits or compatibility language into certainty. Timing symbolism can be a cue to review commitments, expectations, or boundaries. It cannot tell you when to leave a job, trust a stranger, invest money, or diagnose a relationship. Your evidence, values, and conversations remain primary.`,
    misconception: `A common misconception is that the “Big Three” are all you need. They are a useful introduction, but a chart has many placements and methods. The opposite mistake is believing you need to master every symbol before reflection is possible. Begin with one question and one or two placements; depth comes from revisiting your observations, not collecting labels.`,
    practice: `Choose a recent moment when you felt unusually confident, reactive, private, or visible. Read a short description of your Sun, Moon, or Rising sign and underline only the phrases that describe a behavior you can verify. Then write a second explanation that has nothing to do with astrology: context, sleep, workload, relationships, or skills. Holding both explanations keeps reflection open and useful.`,
    boundary: `Astrology can offer symbolic language, but it does not replace mental-health care, medical assessment, legal advice, financial planning, or direct communication. Use it to generate better questions, not to make irreversible choices for yourself or someone else.`,
  }),
  createEditorialArticle({
    id: "bazi-vs-western-astrology",
    title_en: "Bazi vs. Western Astrology: What Each System Can—and Cannot—Tell You",
    summary_en: "Compare Bazi and Western astrology as distinct symbolic traditions, learn their different inputs and questions, and avoid false certainty from either system.",
    category: "chart analysis", tags_en: ["Bazi vs astrology", "Western astrology", "Chinese metaphysics", "birth chart"], tags_zh: ["Bazi vs astrology"], read_time: 10, cover_emoji: "⇄", created_at: "2026-07-17",
    relatedIds: ["what-is-bazi", "birth-chart-self-reflection", "iching-bazi-fengshui"],
    faq: [
      { question: "Is Bazi the same as Western astrology?", answer: "No. They use different symbolic systems, calculations, histories, and interpretive traditions, even though both may begin with birth information." },
      { question: "Which system is more accurate?", answer: "Neither system offers a scientific guarantee of personal outcomes. The better question is which framework helps you reflect without replacing evidence and agency." },
    ],
    directAnswer: `Bazi and Western astrology are not interchangeable systems. Both can begin with birth information, yet they organize meaning differently. Bazi uses the Four Pillars, Heavenly Stems, Earthly Branches, seasonal context, and Five Element relationships. Western astrology commonly uses planetary positions, signs, houses, and aspects. Comparing them can be interesting, but one should not be used to “confirm” the other as though two symbolic descriptions create a fact.

The most respectful comparison begins with different questions. Bazi often foregrounds elemental relationships and seasonal context. Western astrology often foregrounds planetary symbolism, houses, and aspects. Both include diverse schools of interpretation. A useful reader learns enough to understand the language of each system, then returns to lived evidence instead of hunting for a final verdict.`,
    framework: `Consider inputs first. Bazi charts are calculated through a Chinese calendrical framework and pay close attention to the year, month, day, and hour pillars. Western charts calculate the positions of celestial bodies for a birth time and location. Birth-time accuracy matters in both systems, but it affects different parts of the chart. That difference alone is a reason to avoid copying a conclusion from one framework into another.

Consider scale next. A Bazi interpretation may discuss how a Day Master relates to elements and seasonal strength. A Western interpretation may discuss how a planet is placed by sign, house, and aspect. In either case, a symbol becomes useful only when it creates a question you can test in ordinary life. “How do I respond when I need structure?” is more useful than “What does this prove about me?”

Finally, distinguish meaning from prediction. A meaningful symbol can help you notice a habit, a tension, or a neglected value. It cannot guarantee that a relationship will succeed, that a career will pay off, or that a date is objectively lucky. The more consequential the decision, the more it should rely on direct information, skills, consent, and qualified advice.`,
    misconception: `One myth is that combining systems produces a more certain answer. More symbolic language can produce more ideas, but it does not create evidence. Another myth is that a system is “better” because a description feels specific. Specificity can be compelling; it should still be compared with real context and alternative explanations.`,
    practice: `Take one current question, such as whether to take on a new responsibility. Write what a Bazi lens might ask about pacing, support, or balance. Write what an astrology lens might ask about motivation, habits, or visibility. Then make a third list containing the practical evidence: time, money, commitments, and conversations. Let the third list guide the decision; use the symbolic lists only to broaden your reflection.`,
    boundary: `Neither Bazi nor Western astrology can certify compatibility, predict a financial result, or replace professional guidance. Avoid using a chart to judge another person’s character or to override their stated choices.`,
  }),
  createEditorialArticle({
    id: "chinese-metaphysics-beginners",
    title_en: "Chinese Metaphysics for Beginners: Bazi, Feng Shui, I Ching, and Their Different Roles",
    summary_en: "A plain-language overview of Bazi, Feng Shui, and the I Ching that explains their different questions, cultural context, and responsible use.",
    category: "four-pillar", tags_en: ["Chinese metaphysics", "Bazi", "Feng Shui", "I Ching"], tags_zh: ["Chinese metaphysics"], read_time: 10, cover_emoji: "☰", created_at: "2026-07-17",
    relatedIds: ["iching-bazi-fengshui", "what-is-bazi", "bazi-vs-western-astrology"],
    faq: [
      { question: "What is Chinese metaphysics?", answer: "It is a broad modern label for several Chinese philosophical, calendrical, and divinatory traditions; it is not one single system or a uniform set of beliefs." },
      { question: "Are Bazi, Feng Shui, and the I Ching used for the same purpose?", answer: "No. They use different methods and are commonly approached with different kinds of questions, even where their ideas overlap." },
    ],
    directAnswer: `“Chinese metaphysics” is a broad umbrella label often used for traditions such as Bazi, Feng Shui, the I Ching, and other calendrical or divinatory practices. The label can be useful for orientation, but it can also flatten important differences. These traditions developed in different historical settings, use different tools, and are interpreted through many lineages. A beginner does not need to master them all; they need to know which question a practice is designed to hold.

Bazi is commonly approached through birth-time symbolism. Feng Shui is commonly associated with environment, arrangement, and the relationship between people and places. The I Ching is commonly approached through changing situations and reflective questions. None of these should be presented as an automatic solution to a health, legal, financial, or relationship problem.`,
    framework: `Bazi can be a useful starting point when you are curious about a birth-chart tradition and want language for patterns, preferences, and timing themes. It works best when you keep the input data honest and treat outputs as interpretation. Feng Shui can be approached when you are considering how a room supports attention, rest, movement, or hospitality. Practical design principles—light, accessibility, storage, safety, and comfort—still matter whether or not you use traditional symbolism.

The I Ching is often used differently. Rather than supplying a fixed profile, it is commonly read through a question and a changing hexagram. That can make it useful for slowing down a situation and examining assumptions. It should not be used as a substitute for informed consent, research, or difficult conversations. A divinatory prompt is an invitation to reflect, not an authority that removes responsibility.

If you are new, choose one tradition and one modest question. Learn its basic terms, notice what it helps you articulate, and stay aware of your cultural sources. You do not need to collect tools or adopt a dramatic ritual for the practice to be meaningful.`,
    misconception: `A common misconception is that every Chinese tradition uses the Five Elements in the same way. Concepts may overlap, but methods and interpretations differ. Another is that “ancient” means universally correct. Historical depth can be valuable without making a claim automatically true or applicable to every context.`,
    practice: `Pick a question that is reflective rather than urgent: “What helps me make this workspace easier to use?” or “What assumption am I bringing into this decision?” Read one introductory source on the relevant tradition, then take one practical action that would still make sense without symbolism. This keeps the practice connected to care, observation, and agency.`,
    boundary: `Approach Chinese metaphysical traditions with curiosity and respect, not as a replacement for evidence or expert care. Be especially cautious with anyone who uses fear, certainty, or expensive remedies to pressure you into a decision.`,
  }),
  createEditorialArticle({
    id: "iching-bazi-fengshui",
    title_en: "I Ching vs. Bazi vs. Feng Shui: Choosing a Reflective Tool for Your Question",
    summary_en: "Learn the different reflective roles of the I Ching, Bazi, and Feng Shui so you can choose a practice without confusing symbolism for certainty.",
    category: "four-pillar", tags_en: ["I Ching vs Bazi", "Feng Shui", "Chinese metaphysics", "reflection"], tags_zh: ["I Ching", "Bazi", "Feng Shui"], read_time: 9, cover_emoji: "☷", created_at: "2026-07-17",
    relatedIds: ["chinese-metaphysics-beginners", "what-is-bazi", "birth-chart-self-reflection"],
    faq: [
      { question: "When might I use the I Ching?", answer: "People often use it to reflect on a present question or changing situation, while remembering that it does not make the decision for them." },
      { question: "Can Feng Shui fix a difficult life problem?", answer: "A better environment can support everyday habits, but no arrangement can replace practical action, communication, or professional help." },
    ],
    directAnswer: `The I Ching, Bazi, and Feng Shui can all be approached as reflective practices, but they begin from different places. The I Ching is often used with a present question. Bazi is often used with birth-time data and a chart of relationships. Feng Shui is often used with the relationship between a person and an environment. Choosing among them is less about finding the most powerful answer and more about matching the practice to the kind of question you are actually asking.

If your question is “What pattern do I keep repeating?” a birth-chart framework may give you vocabulary to examine it. If your question is “What am I not seeing in this changing situation?” an I Ching practice may help you slow down and consider perspectives. If your question is “How can this room better support work or rest?” environmental observation and Feng Shui may offer useful prompts.`,
    framework: `Begin with the question, not the tool. Write it in plain language and make it narrow enough to observe. “How can I organize my next month?” is more workable than “What will happen to my life?” Then ask what information you already have. A Bazi chart needs reliable birth details. An I Ching inquiry benefits from a sincere, present-tense question. A Feng Shui reflection benefits from looking carefully at the space: traffic flow, light, clutter, noise, comfort, and who uses it.

Each practice can be used in a grounded way. With Bazi, note a symbolic pattern and compare it with your experience. With the I Ching, write down the question, the image that stands out, and one action you can test. With Feng Shui, change one practical feature of a room and notice whether it supports the intended activity. These methods become less useful when they are used to outsource agency.

You can also decide that none of the three is the right tool. If the question involves safety, a contract, a medical symptom, a major investment, or someone else’s consent, seek direct information and qualified help first. Reflection can accompany a decision; it should not replace the decision process.`,
    misconception: `It is tempting to use several systems until one gives the desired answer. That is confirmation-seeking, not reflection. Another misconception is that a symbol cancels practical constraints. A beautiful room still needs safe wiring; a promising chart still does not create time, money, or mutual consent.`,
    practice: `Choose one small question for the coming week. State the practical constraint, the value you want to protect, and one action you can take regardless of symbolic guidance. If you use a tradition, record one insight and one alternative interpretation. Review what happened after the action rather than grading the symbol as right or wrong.`,
    boundary: `These traditions are best used to support thoughtful attention. They cannot replace emergency support, evidence-based care, legal counsel, financial planning, or respectful communication with the people affected by your choices.`,
  }),
]
