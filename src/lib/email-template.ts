import { format } from "date-fns";
import { ru, enUS } from "date-fns/locale";
import { Locale, getTranslations } from "./i18n";
import { TarotReaderId } from "./tarot-readers";
import { getCardById } from "./tarot-cards";

interface ReadingData {
  question: string;
  predictionText: string;
  createdAt: Date | string;
  tarotReaderId: string;
  selectedCards?: string[] | null;
  shareUrl?: string;
}

export function generateEmailHTML(
  reading: ReadingData,
  locale: Locale = "ru"
): string {
  const t = getTranslations(locale);
  const date =
    typeof reading.createdAt === "string"
      ? new Date(reading.createdAt)
      : reading.createdAt;
  const formattedDate = format(date, "PPP", {
    locale: locale === "ru" ? ru : enUS,
  });

  const reader = t.tarotReadersPrompts[reading.tarotReaderId as TarotReaderId];
  const shareUrl = reading.shareUrl || "";

  // Get card names if available
  let cardsSection = "";
  if (reading.selectedCards && Array.isArray(reading.selectedCards)) {
    const cardNames = reading.selectedCards
      .map((cardId) => {
        const card = getCardById(cardId);
        return card ? card.name[locale] : null;
      })
      .filter(Boolean)
      .join(", ");

    if (cardNames) {
      cardsSection = `
        <tr>
          <td style="padding: 20px 0;">
            <h3 style="color: #64c8ff; font-size: 18px; margin: 0 0 10px 0; font-weight: 600;">
              ${getTranslations(locale).common.selectedCards.replace(":", "")}
            </h3>
            <p style="color: #e5e7eb; font-size: 16px; margin: 0; line-height: 1.6;">
              ${cardNames}
            </p>
          </td>
        </tr>
      `;
    }
  }

  return `
<!DOCTYPE html>
<html lang="${locale}">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${getTranslations(locale).common.yourTarotReading}</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #0d0d1a 0%, #1a1a3a 100%);">
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #0d0d1a 0%, #1a1a3a 100%); padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width: 600px; background: rgba(26, 26, 58, 0.95); border-radius: 16px; border: 1px solid rgba(100, 200, 255, 0.3); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 30px; text-align: center; background: linear-gradient(135deg, rgba(100, 200, 255, 0.1) 0%, rgba(138, 43, 226, 0.1) 100%); border-radius: 16px 16px 0 0;">
              <h1 style="color: #64c8ff; font-size: 28px; margin: 0 0 10px 0; font-weight: 700; text-shadow: 0 0 20px rgba(100, 200, 255, 0.5);">
                ${
                  locale === "ru"
                    ? "✨ Ваш прогноз Таро ✨"
                    : "✨ Your Tarot Reading ✨"
                }
              </h1>
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                ${formattedDate}
              </p>
            </td>
          </tr>

          <!-- Question -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <h2 style="color: #ffffff; font-size: 22px; margin: 0 0 15px 0; font-weight: 600;">
                ${t.common.yourQuestion}
              </h2>
              <p style="color: #e5e7eb; font-size: 18px; margin: 0; line-height: 1.6; font-weight: 500;">
                ${reading.question}
              </p>
            </td>
          </tr>

          <!-- Tarot Reader -->
          <tr>
            <td style="padding: 0 40px 20px;">
              <div style="background: rgba(100, 200, 255, 0.1); border-left: 4px solid #64c8ff; padding: 15px 20px; border-radius: 8px;">
                <p style="color: #64c8ff; font-size: 16px; margin: 0; font-weight: 600;">
                  ${reader.name}
                </p>
                <p style="color: #9ca3af; font-size: 14px; margin: 5px 0 0 0;">
                  ${reader.description}
                </p>
              </div>
            </td>
          </tr>

          ${cardsSection}

          <!-- Reading Text -->
          <tr>
            <td style="padding: 20px 40px 30px;">
              <h2 style="color: #64c8ff; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">
                ${t.common.yourReading}
              </h2>
              <div style="color: #e5e7eb; font-size: 16px; line-height: 1.8; white-space: pre-wrap; background: rgba(13, 13, 26, 0.5); padding: 20px; border-radius: 8px; border: 1px solid rgba(100, 200, 255, 0.2);">
                ${reading.predictionText.replace(/\n/g, "<br>")}
              </div>
            </td>
          </tr>

          <!-- Share Link -->
          ${
            shareUrl
              ? `
          <tr>
            <td style="padding: 0 40px 30px;">
              <div style="text-align: center; background: rgba(100, 200, 255, 0.05); padding: 20px; border-radius: 8px; border: 1px dashed rgba(100, 200, 255, 0.3);">
                <p style="color: #9ca3af; font-size: 14px; margin: 0 0 10px 0;">
                  ${
                    locale === "ru"
                      ? "Поделиться прогнозом:"
                      : "Share this reading:"
                  }
                </p>
                <a href="${shareUrl}" style="color: #64c8ff; font-size: 14px; text-decoration: none; word-break: break-all; display: inline-block; padding: 8px 16px; background: rgba(100, 200, 255, 0.1); border-radius: 6px; border: 1px solid rgba(100, 200, 255, 0.3);">
                  ${shareUrl}
                </a>
              </div>
            </td>
          </tr>
          `
              : ""
          }

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; text-align: center; background: rgba(13, 13, 26, 0.5); border-radius: 0 0 16px 16px; border-top: 1px solid rgba(100, 200, 255, 0.2);">
              <p style="color: #6b7280; font-size: 12px; margin: 0 0 10px 0;">
                ${
                  locale === "ru"
                    ? "Это письмо было отправлено с сайта Oracle - Гадание на Новый Год"
                    : "This email was sent from Oracle - New Year Fortune Telling"
                }
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                ${
                  locale === "ru"
                    ? "С уважением, команда Oracle"
                    : "Best regards, Oracle Team"
                }
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateEmailText(
  reading: ReadingData,
  locale: Locale = "ru"
): string {
  const date =
    typeof reading.createdAt === "string"
      ? new Date(reading.createdAt)
      : reading.createdAt;
  const formattedDate = format(date, "PPP", {
    locale: locale === "ru" ? ru : enUS,
  });

  const shareUrl = reading.shareUrl || "";

  const t = getTranslations(locale);
  const reader = t.tarotReadersPrompts[reading.tarotReaderId as TarotReaderId];
  let text = `${t.common.yourReading}\n\n`;
  text += `${t.common.date} ${formattedDate}\n\n`;
  text += `${t.common.yourQuestion} ${reading.question}\n\n`;
  text += `${reader.name} - ${reader.description}\n\n`;

  if (reading.selectedCards && Array.isArray(reading.selectedCards)) {
    const cardNames = reading.selectedCards
      .map((cardId) => {
        const card = getCardById(cardId);
        return card ? card.name[locale] : null;
      })
      .filter(Boolean)
      .join(", ");

    if (cardNames) {
      text += `${t.common.selectedCards} ${cardNames}\n\n`;
    }
  }

  text += `${t.common.yourReading}\n${reading.predictionText}\n\n`;

  if (shareUrl) {
    text += `${t.common.share} ${shareUrl}\n\n`;
  }

  text += t.common.bestRegards;

  return text;
}
