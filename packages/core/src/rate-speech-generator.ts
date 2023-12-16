import moment from "moment";
import { Rate, RateType } from "./rate";

export interface RateAttrsToSpeech {
  name: keyof RateType,
  label: string
}

export class RateSpeechGenerator {
  private rateItem: RateType;
  private rateAttrsToSpeech: RateAttrsToSpeech[] 
  private unreleasedMetrics: string[]

  constructor(rateItem: RateType, rateAttrsToSpeech: RateAttrsToSpeech[]) {
    this.rateItem = rateItem;
    this.rateAttrsToSpeech = rateAttrsToSpeech;
    this.unreleasedMetrics = []
  }

  private buildIntroText(rateDate: string): string {
    if (rateDate === moment().tz(Rate.TIMEZONE).format('MM/DD/YYYY')) {
      return `Today's rates are as follows: `;
    } else {
      return `Today's rates have not been recorded yet. Rates are typically posted on weekdays by 6 pm ET. 
        However, I do have rates for ${rateDate}, which are as follows: `;
    }
  }

  private buildRateText(): string {
    let rateText = '';

    this.rateAttrsToSpeech.forEach(rate => {
      const rateValue = this.rateItem[rate.name];
      if (rateValue !== undefined) {
        rateText += `${rate.label} is ${rateValue}%. `;
      } else {
        this.unreleasedMetrics.push(rate.label);
      }
    });

    return rateText;
  }

  private buildArticleText(): string {
    let articleText = '';

    if (this.rateItem.mortgageArticle && this.rateItem.mortgageArticleTitle) {
      articleText += `The Mortgage Insights article from Mortgage News Daily written by Matthew Graham is titled "${this.rateItem.mortgageArticleTitle}". It reads: "${this.rateItem.mortgageArticle}"`;
    } else {
      this.unreleasedMetrics.push('Mortgage Insights Article')
    }

    return articleText
  }

  generateSpeech(): string {
    const finalText = `${this.buildIntroText(this.rateItem.rateDate)} ${this.buildRateText()} ${this.buildArticleText()}`;

    if (this.unreleasedMetrics.length > 0) {
      return `Please note that the following metrics have not yet been recorded: ${this.unreleasedMetrics.join(', ')} ${finalText}`;
    } else {
      return finalText;
    }
  }
}