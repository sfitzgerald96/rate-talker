import moment from "moment";
import { Rate, RateType } from "./rate";

export class MortgageInsightsSpeechGenerator {
  private rateItem: RateType;

  constructor(rateItem: RateType) {
    this.rateItem = rateItem;
  }

  private isToday(rateDate: string): boolean {
    return rateDate === moment().tz(Rate.TIMEZONE).format('MM/DD/YYYY')
  }

  private buildIntroText(rateDate: string): string {
    return this.isToday(rateDate) ? "Today's Mortgage Insights article " : `The Mortgage Insights article on ${this.rateItem.rateDate} `
  }

  private buildArticleText(): string {
    let articleText = '';

    if (this.rateItem.mortgageArticle) {
      let author = this.rateItem.mortgageArticle.author === "" ? "could not find author" : this.rateItem.mortgageArticle.author
      let title = this.rateItem.mortgageArticle.title === "" ? "could not find title" : this.rateItem.mortgageArticle.title
      articleText = `written by ${author} is titled "${title}". It reads: "${this.rateItem.mortgageArticle.body}"`;
    }

    return articleText
  }

  generateSpeech(): string {
    if (this.buildArticleText() === "") {
      return `No article exists for ${this.rateItem.rateDate}.`
    } else {
      return `${this.buildIntroText(this.rateItem.rateDate)} ${this.buildArticleText()}`;
    }
  }
}