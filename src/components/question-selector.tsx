"use client";

import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import { Card } from "@/components/ui/card";
import { getTranslations, type Locale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface QuestionSelectorProps {
  label: string;
  value: string;
  onChange: (question: string) => void;
  locale: Locale;
  disabled?: boolean;
  error?: boolean;
}

export function QuestionSelector({
  label,
  value,
  onChange,
  locale,
  disabled = false,
  error = false,
}: QuestionSelectorProps) {
  const t = getTranslations(locale);

  const defaultQuestions = t.dashboard.defaultQuestions as readonly string[];

  const handleQuestionSelect = (question: string) => {
    if (!disabled) {
      onChange(question);
    }
  };

  return (
    <FormField label={label} required>
      <div className="space-y-1.5">
        <div className="space-y-1">
          {defaultQuestions.map((question, index) => (
            <Card
              key={index}
              className={cn(
                "cursor-pointer transition-all px-4 py-2 h-10 min-h-[40px] flex items-center",
                value === question
                  ? "border-[#d4af37] bg-[rgba(212,175,55,0.1)]"
                  : "border-[rgba(100,200,255,0.3)] hover:border-[rgba(100,200,255,0.5)] hover:bg-[rgba(100,200,255,0.05)]",
                disabled && "opacity-50 cursor-not-allowed"
              )}
              onClick={() => handleQuestionSelect(question)}
            >
              <p className="text-sm text-white">{question}</p>
            </Card>
          ))}
        </div>
        <div className="relative">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={t.dashboard.questionPlaceholder}
            disabled={disabled}
            error={error}
            rows={3}
            className="border-2 focus:border-[rgba(100,200,255,0.8)] bg-[rgba(26,26,58,0.9)]"
          />
        </div>
      </div>
    </FormField>
  );
}
