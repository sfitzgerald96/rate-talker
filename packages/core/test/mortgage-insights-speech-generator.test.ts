import { describe, expect, it, vi } from "vitest";
import { RateType } from "../src/rate";
import { MortgageInsightsSpeechGenerator } from "../src/mortgage-insights-speech-generator";

const rateItem: RateType = {
  rateDate: "12/01/2023",
  fifteenYrFixedMortgage: undefined,
  thirtyYrFixedMortgage: undefined,
  tenYrTreasury: undefined,
  mortgageArticle: {
    author: "Matthew Graham",
    body: "test body",
    title: "test title"
  }
}
describe("Article text", () => {
  it("reads the article when the article is available", () => {
    const speechGenerator = new MortgageInsightsSpeechGenerator(rateItem)
    const generatedSpeech = speechGenerator.generateSpeech()
    expect(generatedSpeech).toContain(`written by ${rateItem.mortgageArticle?.author} is titled "${rateItem.mortgageArticle?.title}". It reads: "${rateItem.mortgageArticle?.body}"`)
  })

  it("says there is no article available for the day.", () => {
    const speechGenerator = new MortgageInsightsSpeechGenerator(
      {...rateItem, mortgageArticle: undefined}
    )
    const generatedSpeech = speechGenerator.generateSpeech()
    expect(generatedSpeech).toEqual(`No article exists for ${rateItem.rateDate}.`)
  })
})