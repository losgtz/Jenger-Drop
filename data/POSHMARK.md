# Poshmark import

Live closet: [@jengerluxuri0us](https://poshmark.com/closet/jengerluxuri0us)

`poshmark-import.example.json` is the merge schema only. A public scrape saw **48 available** listings (the closet advertises ~2366). When the export JSON arrives, map those 48 onto this shape and fold new rows into `products.ts` (`category: "2nd Chance Resale"`).

Do not invent photos or prices. Do not scrape or invent the remaining ~2300 listings in this PR.
