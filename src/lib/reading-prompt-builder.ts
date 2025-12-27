import { Locale, getTranslations } from "./i18n";

interface BuildReadingPromptParams {
  birthDate: string;
  question: string;
  userImageBase64?: string;
  selectedCardsNames?: string;
  locale: Locale;
  addressForm: string;
  firstPerson: string;
  responseLanguage: string;
  mantraTitle: string;
}

export function buildReadingPrompt({
  birthDate,
  question,
  userImageBase64,
  selectedCardsNames,
  locale,
  addressForm,
  firstPerson,
  responseLanguage,
  mantraTitle,
}: BuildReadingPromptParams): string {
  const t = getTranslations(locale).readingPrompts;

  // Build context section
  let prompt = `${t.role}
CONTEXT:
- ${t.context.birthDate}: ${birthDate}
- ${t.context.question}: "${question}"
${
  userImageBase64
    ? `- ${t.context.userPhoto}`
    : ""
}

ANALYSIS INSTRUCTIONS:

${t.archetypeOverride.title}

${t.archetypeOverride.description}
${t.archetypeOverride.affects}
${t.archetypeOverride.affectsList.map((item) => `- ${item}`).join("\n")}

${t.archetypeOverride.doNotBreak}

${t.synthesis.title}

${t.synthesis.description}

${t.synthesis.task}

${t.synthesis.means}
${userImageBase64 ? t.synthesis.meansList.map((item) => `- ${item}`).join("\n") : `- ${t.synthesis.meansList[0]}\n- ${t.synthesis.meansList[2]}`}

${t.synthesis.instead}

${userImageBase64 ? t.synthesis.compareList.map((item) => `• ${item}`).join("\n") : `• ${t.synthesis.compareList[0]}`}

${userImageBase64 ? t.synthesis.example : ""}

${t.synthesis.important}
${
  userImageBase64
    ? t.synthesis.importantList.map((item) => `- ${item}`).join("\n")
    : `- ${t.synthesis.noPhoto}`
}

${userImageBase64 ? t.photoAnalysis.title : ""}
${userImageBase64 ? "\n" + t.photoAnalysis.description : ""}
${userImageBase64 ? "\n" + t.photoAnalysis.mandatoryAnalysis : ""}
${userImageBase64 ? "\n" + t.photoAnalysis.analyzeAnyImage : ""}
${userImageBase64 ? "\n" + t.photoAnalysis.observe : ""}
${userImageBase64 ? t.photoAnalysis.observeList.map((item) => `- ${item}`).join("\n") : ""}
${userImageBase64 ? "\n" + t.photoAnalysis.important : ""}
${userImageBase64 ? "\n" + t.photoAnalysis.fallback : ""}
${userImageBase64 ? "\n" + t.photoAnalysis.connect : ""}
${userImageBase64 ? t.photoAnalysis.connectList.map((item) => `- ${item.replace("{question}", question)}`).join("\n") : ""}
`;

  // Add card spread section
  if (selectedCardsNames) {
    const stepNumber = userImageBase64 ? "3" : "2";
    prompt += `
${stepNumber}. ${t.cardSpread.title}

${t.cardSpread.description}

${t.cardSpread.positions}
${t.cardSpread.position1}
${t.cardSpread.position2}
${t.cardSpread.position3}

${t.cardSpread.cardsAppeared}
${selectedCardsNames}

${t.cardSpread.forEachCard}
${t.cardSpread.forEachCardList.map((item) => `- ${item}`).join("\n")}
  ${userImageBase64 ? `• ${t.cardSpread.connectTo.person}` : ""}
  • ${t.cardSpread.connectTo.question}
  • ${t.cardSpread.connectTo.lifeStage}

${t.cardSpread.doNotMix}
`;
  } else {
    const stepNumber = userImageBase64 ? "3" : "2";
    prompt += `
${stepNumber}. ${t.intuitiveReading.title} ${userImageBase64 ? t.intuitiveReading.withPhoto : t.intuitiveReading.description}
`;
  }

  // Add final synthesis section
  const finalStepNumber = selectedCardsNames
    ? userImageBase64
      ? "4"
      : "3"
    : userImageBase64
    ? "3"
    : "2";

  prompt += `
${finalStepNumber}. ${t.finalSynthesis.title}

${t.finalSynthesis.description}

`;

  if (selectedCardsNames) {
    prompt += `${t.finalSynthesis.threeCardsTitle}

${t.finalSynthesis.card1Title}
${t.finalSynthesis.card1List.map((item) => `- ${item}`).join("\n")}

${t.finalSynthesis.card2Title}
${t.finalSynthesis.card2List.map((item) => `- ${item}`).join("\n")}

${t.finalSynthesis.card3Title}
${t.finalSynthesis.card3List.map((item) => `- ${item}`).join("\n")}

${t.finalSynthesis.synthesisTitle}
${t.finalSynthesis.synthesisDescription.replace("{question}", question)}:
${userImageBase64 ? t.finalSynthesis.synthesisList.map((item) => `- ${item}`).join("\n") : t.finalSynthesis.synthesisList.filter((_, i) => i !== 1).map((item) => `- ${item}`).join("\n")}

${t.finalSynthesis.important}
${t.finalSynthesis.importantText}`;
  } else {
    prompt += `${t.finalSynthesis.intuitiveTitle}
${t.finalSynthesis.intuitiveDescription.replace("{question}", question)}:
${userImageBase64 ? t.finalSynthesis.intuitiveList.map((item) => `- ${item}`).join("\n") : t.finalSynthesis.intuitiveList.filter((_, i) => i !== 0).map((item) => `- ${item}`).join("\n")}`;
  }

  // Add text requirements
  prompt += `

${t.textRequirements.title}
- ${t.textRequirements.tone}
- ${t.textRequirements.style.replace("{addressForm}", addressForm)}
- ${t.textRequirements.formatting}
- ${t.textRequirements.language.replace("{responseLanguage}", responseLanguage)}
`;

  // Add mantra generation section
  const mantraStepNumber = selectedCardsNames
    ? userImageBase64
      ? "5"
      : "4"
    : userImageBase64
    ? "4"
    : "3";

  prompt += `
${mantraStepNumber}. ${t.mantraGeneration.title}

${t.mantraGeneration.description}

${t.mantraGeneration.notDecorative}
${t.mantraGeneration.basedOn.map((item) => `- ${item}`).join("\n")}

${t.mantraGeneration.analysisProcess}

${t.mantraGeneration.step1.replace("{question}", question)}:
${t.mantraGeneration.step1Options.map((item) => `   - ${item}`).join("\n")}

${t.mantraGeneration.step2}:
${t.mantraGeneration.step2Options.map((item) => `   - ${item}`).join("\n")}

${t.mantraGeneration.step3}:
${t.mantraGeneration.step3Options.map((item) => `   - ${item}`).join("\n")}

${t.mantraGeneration.step4.replace("{birthDate}", birthDate)}:
${t.mantraGeneration.step4Options.map((item) => `   - ${item}`).join("\n")}

${t.mantraGeneration.step5}:
${t.mantraGeneration.step5Structure.map((item) => `   - ${item}`).join("\n")}

${t.mantraGeneration.step6}:
${t.mantraGeneration.step6Styles.map((item) => `   - ${item}`).join("\n")}

${t.mantraGeneration.outputFormat}

${t.mantraGeneration.outputDescription}

${t.mantraGeneration.outputTemplate.replace("{mantraTitle}", mantraTitle)}

${t.mantraGeneration.rules}:
${t.mantraGeneration.rulesList
  .map((item) => `- ${item.replace("{responseLanguage}", responseLanguage).replace("{firstPerson}", firstPerson)}`)
  .join("\n")}

${t.mantraGeneration.forbidden}:
${t.mantraGeneration.forbiddenList.map((item) => `- ${item}`).join("\n")}

${t.mantraGeneration.allowedStructure}:
${t.mantraGeneration.allowedStructureTemplate.replace("{firstPerson}", firstPerson)}

${t.mantraGeneration.critical}
`;

  return prompt;
}

