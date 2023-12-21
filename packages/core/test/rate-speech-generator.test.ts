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
  mortgageArticle: undefined
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
  it ("says the date of the rate when there is no entry for today", () => {
    vi.useFakeTimers();
    let today = new Date(rateItem.rateDate)
    today.setDate(today.getDate() + 1)
    vi.setSystemTime(today);
  
    const speechGenerator = new RateSpeechGenerator(rateItem, rateAttrsToSpeech)
    const generatedSpeech = speechGenerator.generateSpeech()
  
    expect(generatedSpeech).toContain(`Rates for ${rateItem.rateDate} are as follows:`)
    vi.useRealTimers();
  })
})

describe("Rate text", () => {
  it("reads the rate when the rate is available", () => {
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

describe("Financial Disclaimer", () => {
  it("exists", () => {
    const speechGenerator = new RateSpeechGenerator(rateItem, rateAttrsToSpeech)
    const generatedSpeech = speechGenerator.generateSpeech()
    expect(generatedSpeech).toContain(`Financial Disclaimers:`)
  })
})