# rate-talker
Gathers treasury information and mortgage rate data. Presents it via Alexa skills.

Cronjobs
- Mortgage Rate scraper
  - Creates or finds today's record
  - scrapes and checks if rate has been released
    - Yes: Update record
    - No: Exit
- Mortgage article
  - Creates or finds today's record
  - scrapes and checks if rate has been released
    - Yes: Update record
    - No: Exit
- CNBC Treasury info
  - Creates or finds today's record
  - scrapes and checks current rate
    - Yes: Update record
    - No: Exit

npx ask util generate-lwa-tokens --client-id "<your Client ID>" --client-confirmation "<your Client Secret>" --scopes "alexa::ask:skills:readwrite alexa::ask:models:readwrite"
