import moment from "moment";
import { Rate, RateType } from "./rate";

export interface RateAttrsToSpeech {
  name: keyof RateType,
  label: string
}

export class RateSpeechGenerator {
  private rateItem: RateType;
  private rateAttrsToSpeech: RateAttrsToSpeech[] 

  constructor(rateItem: RateType, rateAttrsToSpeech: RateAttrsToSpeech[]) {
    this.rateItem = rateItem;
    this.rateAttrsToSpeech = rateAttrsToSpeech;
  }

  private buildFinancialDisclaimerText(): string {
    return "Financial Disclaimers: Mortgage rates are provided from Mortgage News Daily as the average rate across US lenders, so rates can vary from lender to lender. Additionally, the 10 year US treasury quotes may have up to 1 hour of lag."
  }

  private buildIntroText(rateDate: string): string {
    if (rateDate === moment().tz(Rate.TIMEZONE).format('MM/DD/YYYY')) {
      return "Rates from today are as follows: "
    } else {
      return `Rates for ${rateDate} are as follows: `
    }
  }

  private buildRateText(): string {
    let rateText = '';

    this.rateAttrsToSpeech.forEach(rate => {
      const rateValue = this.rateItem[rate.name];
      if (rateValue !== undefined) {
        rateText += `${rate.label} is ${rateValue}%. `;
      } 
    });

    return rateText;
  }

  private buildWarningText(): string {
    let unreleasedMetrics: string[] = []
    this.rateAttrsToSpeech.forEach(rate => {
      const rateValue = this.rateItem[rate.name];
      if (rateValue === undefined) {
        unreleasedMetrics.push(rate.label);
      } 
    })

    if (unreleasedMetrics.length > 0) {
      return `Please note that the following metrics have not yet been recorded: ${unreleasedMetrics.join(', ')}`
    } else {
      return ""
    }
  }

  generateSpeech(): string {
    return `${this.buildWarningText()} ${this.buildIntroText(this.rateItem.rateDate)} ${this.buildRateText()} ${this.buildFinancialDisclaimerText()}`
  }
}