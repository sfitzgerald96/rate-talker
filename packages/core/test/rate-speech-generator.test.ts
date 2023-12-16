import { describe, expect, it, vi } from "vitest";
import { RateAttrsToSpeech, RateSpeechGenerator } from "../src/rate-speech-generator";
import { RateType } from "../src/rate";

const rateAttrsToSpeech: RateAttrsToSpeech[] = [
  {name: "fifteenYrFixedMortgage", label: "fifteen year fixed mortgage"},
  {name: "thirtyYrFixedMortgage", label: "thirty year fixed mortgage"},
  {name: "tenYrTreasury", label: "ten year treasury"},
]

const rateItem: RateType = {
  rateDate: "12/01/2023",
  fifteenYrFixedMortgage: "6.21",
  thirtyYrFixedMortgage: "6.82",
  tenYrTreasury: "3.98",
  mortgageArticleTitle: "test title",
  mortgageArticle: "test article"
}

describe("Metrics unavailable warning", () => {
  it("shows no warning when all metrics are available", () => {
    const speechGenerator = new RateSpeechGenerator(rateItem, rateAttrsToSpeech)
    const generatedSpeech = speechGenerator.generateSpeech()

    expect(generatedSpeech).not.toContain("Please note that the following metrics have not yet been recorded")
  })

  it("adds warning when at least one rate is unavailable", () => {
    const speechGenerator = new RateSpeechGenerator(
      {...rateItem, fifteenYrFixedMortgage: undefined},
      rateAttrsToSpeech
    )
    const generatedSpeech = speechGenerator.generateSpeech()

    expect(generatedSpeech).toContain("Please note that the following metrics have not yet been recorded")
    expect(generatedSpeech).toContain(rateAttrsToSpeech[0].label)
  })
})

describe("Intro text", () => {
  it("says today's rates are available when there is an entry for today's date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(rateItem.rateDate));

    const speechGenerator = new RateSpeechGenerator(rateItem, rateAttrsToSpeech)
    const generatedSpeech = speechGenerator.generateSpeech()

    console.log(generatedSpeech)
    expect(generatedSpeech).toContain("Today\'s rates are as follows:")
    vi.useRealTimers();
  })

  it ("says today's rates have not been recorded when there is no entry for today", () => {
    vi.useFakeTimers();
    let today = new Date(rateItem.rateDate)
    today.setDate(today.getDate() + 1)
    vi.setSystemTime(today);
  
    const speechGenerator = new RateSpeechGenerator(rateItem, rateAttrsToSpeech)
    const generatedSpeech = speechGenerator.generateSpeech()
  
    expect(generatedSpeech).toContain("Today\'s rates have not been recorded")
    vi.useRealTimers();
  })
})

describe("Rate text", () => {
  it("shares the rate when the rate is available", () => {
    const speechGenerator = new RateSpeechGenerator(rateItem, rateAttrsToSpeech)
    const generatedSpeech = speechGenerator.generateSpeech()
    expect(generatedSpeech).toContain(`${rateAttrsToSpeech[0].label} is ${rateItem[rateAttrsToSpeech[0].name]}%.`)
  })

  it("omits the rate when the rate is unavailable", () => {
    const speechGenerator = new RateSpeechGenerator(
      {...rateItem, fifteenYrFixedMortgage: undefined},
      rateAttrsToSpeech
    )
    const generatedSpeech = speechGenerator.generateSpeech()
    expect(generatedSpeech).not.toContain(`${rateAttrsToSpeech[0].label} is ${rateItem[rateAttrsToSpeech[0].name]}%.`)
  })
})

describe("Article text", () => {
  it("shares the article when the article is available", () => {
    const speechGenerator = new RateSpeechGenerator(rateItem, rateAttrsToSpeech)
    const generatedSpeech = speechGenerator.generateSpeech()
    expect(generatedSpeech).toContain(`is titled "${rateItem.mortgageArticleTitle}". It reads: "${rateItem.mortgageArticle}"`)
  })

  it("omits the article when the article is unavailable", () => {
    const speechGenerator = new RateSpeechGenerator(
      {...rateItem, mortgageArticle: undefined, mortgageArticleTitle: undefined},
      rateAttrsToSpeech
    )
    const generatedSpeech = speechGenerator.generateSpeech()
    expect(generatedSpeech).not.toContain(`is titled "${rateItem.mortgageArticleTitle}". It reads: "${rateItem.mortgageArticle}"`)
  })
})
