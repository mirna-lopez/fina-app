import type { NewTransaction } from '../types'

export async function parseTransaction(input: string): Promise<NewTransaction> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY as string,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [{
        role: 'user',
        content: `Parse this transaction: "${input}". Return ONLY valid JSON with these exact fields:
- name (string): merchant or description
- amount (number): negative for expenses, positive for income. Income keywords (→ positive): deposit, paycheck, salary, refund, reimbursement, received, income. Everything else → negative.
- category (one of: Groceries, Food & Drink, Subscriptions, Shopping, Gas, Health, Transfer, Income, Credit Card, Other)
- status ("settled" or "pending"): default "settled"
- date (today as "MMM D, YYYY")
- paymentMethod (string or null): if a card or payment method is mentioned (e.g. "amex gold", "blue amex", "chase sapphire", "discover", "venmo", "zelle", "cash"), format it nicely (e.g. "Amex Gold", "Chase Sapphire", "Zelle"). Otherwise null.
No explanation, just the JSON object.`,
      }],
    }),
  })
  const data = await response.json()
  if (!data.content?.[0]?.text) throw new Error(data.error?.message ?? 'API error')
  const raw = data.content[0].text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()
  return JSON.parse(raw)
}
