import { Locale, getTranslations } from "./i18n";

interface BuildReadingPromptParams {
  birthDate: string;
  question: string;
  userImageBase64?: string;
  imageAnalysisResult?: string;
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
  imageAnalysisResult,
  selectedCardsNames,
  locale,
  addressForm,
  firstPerson,
  responseLanguage,
  mantraTitle,
}: BuildReadingPromptParams): string {
  const t = getTranslations(locale).readingPrompts;
  const tCommon = getTranslations(locale).common;

  // Determine if we have image data (either original or analysis result)
  const hasImageData = !!imageAnalysisResult || !!userImageBase64;

  // Build context section
  let prompt = `${t.role}
CONTEXT:
- ${t.context.birthDate}: ${birthDate}
- ${t.context.question}: "${question}"
${
  imageAnalysisResult
    ? `- ${t.context.userPhotoAnalyzed}\n- ${tCommon.photoAnalysisResult}: ${imageAnalysisResult}`
    : userImageBase64
    ? `- ${t.context.userPhoto}`
    : ""
}

${t.responseStructure.critical}

${t.responseStructure.mustStart.replace("{mantraTitle}", mantraTitle)}

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
${
  hasImageData
    ? t.synthesis.meansList.map((item) => `- ${item}`).join("\n")
    : `- ${t.synthesis.meansList[0]}\n- ${t.synthesis.meansList[2]}`
}

${t.synthesis.instead}

${
  hasImageData
    ? t.synthesis.compareList.map((item) => `• ${item}`).join("\n")
    : `• ${t.synthesis.compareList[0]}`
}

${hasImageData ? t.synthesis.example : ""}

${t.synthesis.important}
${
  hasImageData
    ? t.synthesis.importantList.map((item) => `- ${item}`).join("\n")
    : `- ${t.synthesis.noPhoto}`
}

${
  imageAnalysisResult
    ? `2. ${t.photoAnalysis.completed.title}

${t.photoAnalysis.completed.description}

${tCommon.photoAnalysisResult}:
${imageAnalysisResult}

${t.photoAnalysis.completed.useResult}
- ${tCommon.theQuestion} "${question}"
- ${tCommon.birthDateSynthesis}
- ${tCommon.tarotCardsNextStep}

${t.photoAnalysis.completed.findContradictions}

${t.photoAnalysis.completed.avoidGeneric}

${t.photoAnalysis.completed.example}`
    : userImageBase64
    ? `${t.photoAnalysis.title}
${t.photoAnalysis.description}
${t.photoAnalysis.analyzeAnyImage}
${t.photoAnalysis.observe}
${t.photoAnalysis.observeList.map((item) => `- ${item}`).join("\n")}
${t.photoAnalysis.fallback}
${t.photoAnalysis.connect}
${t.photoAnalysis.connectList
  .map((item) => `- ${item.replace("{question}", question)}`)
  .join("\n")}`
    : ""
}
`;

  // Add card spread section
  if (selectedCardsNames) {
    const stepNumber = hasImageData ? "3" : "2";
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
  ${hasImageData ? `• ${t.cardSpread.connectTo.person}` : ""}
  • ${t.cardSpread.connectTo.question}
  • ${t.cardSpread.connectTo.lifeStage}

${t.cardSpread.doNotMix}
`;
  } else {
    const stepNumber = hasImageData ? "3" : "2";
    prompt += `
${stepNumber}. ${t.intuitiveReading.title} ${
      hasImageData
        ? t.intuitiveReading.withPhoto
        : t.intuitiveReading.description
    }
`;
  }

  // Add final synthesis section
  const finalStepNumber = selectedCardsNames
    ? hasImageData
      ? "4"
      : "3"
    : hasImageData
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
${
  hasImageData
    ? t.finalSynthesis.synthesisList.map((item) => `- ${item}`).join("\n")
    : t.finalSynthesis.synthesisList
        .filter((_, i) => i !== 1)
        .map((item) => `- ${item}`)
        .join("\n")
}

${t.finalSynthesis.important}
${t.finalSynthesis.importantText}`;
  } else {
    prompt += `${t.finalSynthesis.intuitiveTitle}
${t.finalSynthesis.intuitiveDescription.replace("{question}", question)}:
${
  hasImageData
    ? t.finalSynthesis.intuitiveList.map((item) => `- ${item}`).join("\n")
    : t.finalSynthesis.intuitiveList
        .filter((_, i) => i !== 0)
        .map((item) => `- ${item}`)
        .join("\n")
}`;
  }

  // Add text requirements
  prompt += `

${t.textRequirements.title}
- ${t.textRequirements.tone}
- ${t.textRequirements.style.replace("{addressForm}", addressForm)}
- ${t.textRequirements.formatting}
- ${t.textRequirements.language.replace("{responseLanguage}", responseLanguage)}
- ${t.textRequirements.length}
- ${t.textRequirements.probabilities}
- ${t.textRequirements.noYears}
- ${t.textRequirements.noInstructions}
`;

  // Add mantra generation section
  const mantraStepNumber = selectedCardsNames
    ? hasImageData
      ? "5"
      : "4"
    : hasImageData
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

${
  selectedCardsNames
    ? `${t.mantraGeneration.step2Cards}:
${t.mantraGeneration.step2CardsDescription}
${(() => {
  const cards = selectedCardsNames.split(", ");
  return t.mantraGeneration.step2CardsList
    .map((item) =>
      item
        .replace("{card1}", cards[0] || "")
        .replace("{card2}", cards[1] || "")
        .replace("{card3}", cards[2] || "")
    )
    .join("\n");
})()}

${t.mantraGeneration.step2CardsSynthesis}

`
    : ""
}
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

${t.mantraGeneration.rules}:
${t.mantraGeneration.rulesList
  .map(
    (item) =>
      `- ${item
        .replace("{responseLanguage}", responseLanguage)
        .replace("{firstPerson}", firstPerson)}`
  )
  .join("\n")}

${t.mantraGeneration.forbidden}:
${t.mantraGeneration.forbiddenList.map((item) => `- ${item}`).join("\n")}

${t.mantraGeneration.allowedStructure}:
${t.mantraGeneration.allowedStructureTemplate.replace(
  "{firstPerson}",
  firstPerson
)}

${t.mantraGeneration.critical}
`;

  return prompt;
}
