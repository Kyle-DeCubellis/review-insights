// Real brand demo data — products from judge.me's advertised merchant roster
// Each brand ships 20 reviews (12 current week, 8 previous week)

export interface DemoReview {
  id: number;
  text: string;
  rating: number;
  author: string;
  createdAt: string;
}

export interface DemoBrand {
  id: string;
  name: string;
  product: string;
  category: string;
  emoji: string;
  tagline: string;
  reviews: DemoReview[];
  previousWeek: {
    positive: number;
    negative: number;
    neutral: number;
    total: number;
  };
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
  return d.toISOString();
}

// ─── Owala FreeSip ────────────────────────────────────────────────────────────

const owalaReviews: DemoReview[] = [
  // Current week (0-6 days ago)
  {
    id: 1,
    text: "Just got the FreeSip in Out of the Blue colorway — it's even more stunning in person. The stainless steel feels premium and it actually fits in my car cup holder. Cold water after 26 hours, verified. Total convert.",
    rating: 5,
    author: "HydroHannah",
    createdAt: daysAgo(0),
  },
  {
    id: 2,
    text: "The FreeSip spout is genius. I can sip from the straw or chug from the wide mouth without swapping lids. My kids keep stealing mine so I ordered two more. Best water bottle I've owned.",
    rating: 5,
    author: "MomOfThree",
    createdAt: daysAgo(1),
  },
  {
    id: 3,
    text: "Lid leaks when tipped sideways in my bag. Lost 12oz of water on my laptop. The spout mechanism is clever but if you don't squeeze it exactly right it doesn't seal. Very frustrated.",
    rating: 2,
    author: "BackpackCommuter",
    createdAt: daysAgo(1),
  },
  {
    id: 4,
    text: "Perfect size for desk use — not too bulky but enough for a long meeting stretch. The powder coat finish holds up to my metal desk without scratching. Color is exactly as shown.",
    rating: 5,
    author: "DesktopHydrator",
    createdAt: daysAgo(2),
  },
  {
    id: 5,
    text: "Spent $40 on this and the hinge on the lid snapped after 6 weeks — just from normal carrying. Customer service said they'd send a replacement lid but it's been 3 weeks waiting.",
    rating: 2,
    author: "DisappointedDave",
    createdAt: daysAgo(2),
  },
  {
    id: 6,
    text: "I've gone through 6 water bottles in 3 years trying to find one that actually works. This is it. Insulation is excellent, grip is comfortable, lid snaps securely every time. Total convert.",
    rating: 5,
    author: "BottleReviewer99",
    createdAt: daysAgo(3),
  },
  {
    id: 7,
    text: "Nice bottle but the 24oz is smaller than I expected — have to refill 3+ times a day at the office. Wish I'd gone for the 32oz. The bottle construction itself is great quality though.",
    rating: 3,
    author: "BigDrinker",
    createdAt: daysAgo(3),
  },
  {
    id: 8,
    text: "Arrived with a small dent in the stainless steel. Not visible normally but for $40 this shouldn't happen. Packaging was fine so it seems like a manufacturing defect. Contacted support.",
    rating: 2,
    author: "QualityMatters",
    createdAt: daysAgo(4),
  },
  {
    id: 9,
    text: "Absolutely obsessed. Bought 4 for my whole family. The FreeSip cap is the best lid innovation I've seen. Keeps coffee hot for 8 hours and ice water cold for 24+. Worth every single penny.",
    rating: 5,
    author: "FamilyFanatic",
    createdAt: daysAgo(4),
  },
  {
    id: 10,
    text: "The Out of the Blue color faded after about 2 months of dishwasher use. Body is not dishwasher safe (lid only) — I didn't realize that initially. My fault but the color change is disappointing.",
    rating: 3,
    author: "CarelessWasher",
    createdAt: daysAgo(5),
  },
  {
    id: 11,
    text: "Solid all-around bottle. Double-wall insulation works as advertised. The straw inside needs careful cleaning though — the brush that comes with it is barely adequate for the job.",
    rating: 4,
    author: "CleanFreak",
    createdAt: daysAgo(5),
  },
  {
    id: 12,
    text: "Ships super fast — ordered Monday, on my doorstep Wednesday. Great packaging. The color is vibrant and the grip coating feels luxurious. Everything I hoped for based on the reviews.",
    rating: 5,
    author: "FastShipFan",
    createdAt: daysAgo(6),
  },
  // Previous week (7-13 days ago)
  {
    id: 13,
    text: "Returned mine — the lid rattles slightly when walking and the clicking sound drives me crazy in quiet offices. Otherwise a great product and the quality is clearly there.",
    rating: 3,
    author: "SilentOfficeWorker",
    createdAt: daysAgo(8),
  },
  {
    id: 14,
    text: "Best water bottle I've ever owned. Period. The straw mechanism seals completely and I've tossed it in my bag sideways a dozen times without a single leak. Brilliant design.",
    rating: 5,
    author: "LeakTestPro",
    createdAt: daysAgo(9),
  },
  {
    id: 15,
    text: "Compared to Hydro Flask: insulation is equivalent, FreeSip spout is way better, price is similar. Owala wins for me every time. My Hydro Flask is now a plant watering can.",
    rating: 5,
    author: "BottleTester",
    createdAt: daysAgo(9),
  },
  {
    id: 16,
    text: "The straw discolored after a month. I only use water in it. Reached out to support — they asked for photos. Still waiting on a resolution after two weeks.",
    rating: 2,
    author: "DiscoloredStraw",
    createdAt: daysAgo(10),
  },
  {
    id: 17,
    text: "Perfect gym bottle. Fits in every cup holder I've tried, doesn't sweat on the outside, and the straw makes it easy to drink during a workout without stopping. Highly recommend.",
    rating: 5,
    author: "GymRat2024",
    createdAt: daysAgo(11),
  },
  {
    id: 18,
    text: "Bought two as gifts. Both recipients already texted asking where I got them. The Out of the Blue color looks like a painting. Great gift for anyone who's on the go.",
    rating: 5,
    author: "GiftGiver",
    createdAt: daysAgo(12),
  },
  {
    id: 19,
    text: "Lid is hard to clean thoroughly. The hinge mechanism traps moisture and I've noticed buildup even though I clean it regularly. Wish the lid was more disassemblable.",
    rating: 3,
    author: "CleaningNerd",
    createdAt: daysAgo(12),
  },
  {
    id: 20,
    text: "Tips over too easily on flat surfaces — needs a wider base. Spilled water on my keyboard twice before I learned to keep it away from my desk edge. Design flaw.",
    rating: 2,
    author: "WetKeyboard",
    createdAt: daysAgo(13),
  },
];

// ─── Anker MagGo Power Bank ───────────────────────────────────────────────────

const ankerReviews: DemoReview[] = [
  // Current week
  {
    id: 1,
    text: "This is a game changer for iPhone users. Snaps on magnetically and charges at a solid rate — got my phone from 20% to 80% during a 2-hour flight. The kickstand is a bonus I didn't expect to use as much as I do.",
    rating: 5,
    author: "FrequentFlyer",
    createdAt: daysAgo(0),
  },
  {
    id: 2,
    text: "Charging speed is decent for wireless but don't expect miracles. USB-C wired charging is where this shines — cables up fast. The LED percentage display is super useful. Build quality feels premium.",
    rating: 4,
    author: "TechRealist",
    createdAt: daysAgo(1),
  },
  {
    id: 3,
    text: "After 4 months the magnetic connection started weakening — my phone slides off if I put it on a slight incline. Anker support is looking into it but frustrating for a $50+ product.",
    rating: 2,
    author: "MagSlider",
    createdAt: daysAgo(1),
  },
  {
    id: 4,
    text: "Bought this for a 10-day international trip. Charged my iPhone three full times on a single bank charge. The MagSafe compatibility means I can charge hands-free propped on the kickstand. Perfect travel companion.",
    rating: 5,
    author: "WorldTraveler",
    createdAt: daysAgo(2),
  },
  {
    id: 5,
    text: "The kickstand is flimsy — holds the phone but wiggle it and the whole thing collapses. For desk use this is annoying. The charging capacity is excellent though.",
    rating: 3,
    author: "StandCritic",
    createdAt: daysAgo(2),
  },
  {
    id: 6,
    text: "My old power bank died and I grabbed this as a replacement. The magnetic attachment is so convenient — just stick it on and forget about cables while you're walking. Adequate charge speed for daily use.",
    rating: 4,
    author: "UrbanCommuter",
    createdAt: daysAgo(3),
  },
  {
    id: 7,
    text: "Arrived damaged — the USB-C port was slightly recessed and my cable barely fit. Anker replaced it immediately with no questions. New unit is perfect. Their customer service earned a star back.",
    rating: 3,
    author: "ReturnExperience",
    createdAt: daysAgo(3),
  },
  {
    id: 8,
    text: "Worth every penny. I've gone through 5 power banks and this is the first one I haven't wanted to replace within a year. The LED display showing exact battery percentage is more useful than you'd think.",
    rating: 5,
    author: "PowerBankVet",
    createdAt: daysAgo(4),
  },
  {
    id: 9,
    text: "Doesn't charge my non-MagSafe Android via wireless obviously, but the USB-C port is great. Compact, light, holds enough for 2 full phone charges. Good value for Android users too.",
    rating: 4,
    author: "AndroidUser",
    createdAt: daysAgo(4),
  },
  {
    id: 10,
    text: "Overheats during wireless charging in warm weather. Used it on a summer road trip and it got uncomfortably hot after 30 minutes. Wired charging works fine. Disappointing for a flagship product.",
    rating: 2,
    author: "SummerRoadTripper",
    createdAt: daysAgo(5),
  },
  {
    id: 11,
    text: "The packaging is very premium — feels like unboxing something from Apple. The product itself matches that quality. Magnetic alignment is perfect every time with my iPhone 15.",
    rating: 5,
    author: "UnboxingFan",
    createdAt: daysAgo(5),
  },
  {
    id: 12,
    text: "Fast shipping and well packaged. The power bank is solid — slim enough to slip in a pocket with your phone attached. Has become a daily carry for me since day one.",
    rating: 5,
    author: "DailyCarry",
    createdAt: daysAgo(6),
  },
  // Previous week
  {
    id: 13,
    text: "Lighter than I expected for 10000mAh — almost like not carrying extra weight. Wireless charging is fine for overnight top-offs, not for when you're in a hurry.",
    rating: 4,
    author: "LightweightFan",
    createdAt: daysAgo(8),
  },
  {
    id: 14,
    text: "Two months in and it's holding up great. Magnetic disc is still perfectly aligned and charging hasn't slowed down at all. Build quality is clearly better than cheaper alternatives.",
    rating: 5,
    author: "TwoMonthReview",
    createdAt: daysAgo(9),
  },
  {
    id: 15,
    text: "Wish it charged faster wirelessly. 15W sounds good but in practice my phone charges noticeably slower than plugged into the wall. For casual use it's fine.",
    rating: 3,
    author: "SpeedSeeker",
    createdAt: daysAgo(9),
  },
  {
    id: 16,
    text: "DOA — wouldn't turn on out of the box. Anker sent a replacement within 3 days, no questions asked. The replacement works perfectly. Their support team is genuinely good.",
    rating: 2,
    author: "DOAButFixed",
    createdAt: daysAgo(10),
  },
  {
    id: 17,
    text: "Great form factor. Slim enough to feel like part of my phone rather than a bulky brick. The kickstand sold me but I actually use the wireless charging more than I expected.",
    rating: 5,
    author: "FormFactorFan",
    createdAt: daysAgo(11),
  },
  {
    id: 18,
    text: "Very convenient but the LED indicator numbers are tiny and hard to read in direct sunlight. Minor complaint on an otherwise excellent product.",
    rating: 4,
    author: "OutdoorUser",
    createdAt: daysAgo(12),
  },
  {
    id: 19,
    text: "The magnetic attachment is too strong — it pulls my phone out of my pocket when I'm trying to grab just the power bank. Took some getting used to but ultimately a minor issue.",
    rating: 3,
    author: "TooMagnetic",
    createdAt: daysAgo(12),
  },
  {
    id: 20,
    text: "Solid daily driver. Got it for my commute and it handles everything I need. Wireless charging is slower but the convenience of no cables makes it worth it.",
    rating: 4,
    author: "CommuterPower",
    createdAt: daysAgo(13),
  },
];

// ─── L'Occitane Shea Butter Hand Cream ───────────────────────────────────────

const loccitaneReviews: DemoReview[] = [
  // Current week
  {
    id: 1,
    text: "My hands were cracking from winter dryness and one application was transformative. I've tried every drugstore hand cream and nothing comes close. The scent is warm and comforting without being overwhelming.",
    rating: 5,
    author: "WinterSkinSaver",
    createdAt: daysAgo(0),
  },
  {
    id: 2,
    text: "The 150ml tube is incredible value. I've been using this for 5 years and refuse to use anything else. One application in the morning and my hands stay soft all day. Absolute staple.",
    rating: 5,
    author: "FiveYearFan",
    createdAt: daysAgo(1),
  },
  {
    id: 3,
    text: "It's good hand cream. Works well, smells nice. But at this price point I expected more than 'good.' Several cheaper alternatives offer similar hydration. Paying for the brand name here.",
    rating: 3,
    author: "ValueShopper",
    createdAt: daysAgo(1),
  },
  {
    id: 4,
    text: "Bought 3 tubes as holiday gifts — one for my mom, sister, and colleague. All three reached out asking where I got them. The packaging is elegant and the cream is legitimately the best.",
    rating: 5,
    author: "GiftGiver",
    createdAt: daysAgo(2),
  },
  {
    id: 5,
    text: "The scent is too strong for me and lingers for hours. I can still smell it after washing my hands. The hydration is excellent but if you're fragrance-sensitive, be warned.",
    rating: 2,
    author: "ScentSensitive",
    createdAt: daysAgo(2),
  },
  {
    id: 6,
    text: "Perfect for my eczema-prone hands. Non-greasy enough to type on a keyboard 10 minutes after application. My dermatologist actually recommended the shea butter formulation and she was absolutely right.",
    rating: 5,
    author: "EczemaRelief",
    createdAt: daysAgo(3),
  },
  {
    id: 7,
    text: "Arrived with a cracked pump dispenser — it worked but was clearly damaged. The outer packaging was fine so it seems like a manufacturing defect. The cream itself is as good as always.",
    rating: 3,
    author: "BrokenPump",
    createdAt: daysAgo(3),
  },
  {
    id: 8,
    text: "I've gifted this to 12 people over the years. It has a 100% love rate. Quality is consistent — every tube is exactly what I expect. This is the Hermès of hand cream.",
    rating: 5,
    author: "SerialGifter",
    createdAt: daysAgo(4),
  },
  {
    id: 9,
    text: "Greasier than I remember — not sure if the formula changed but my hands feel slippery for 20 minutes after application. The hydration is still excellent but I can't type or use my phone immediately.",
    rating: 3,
    author: "FormulaWatcher",
    createdAt: daysAgo(4),
  },
  {
    id: 10,
    text: "Finally found something that survives frequent handwashing at work. Most creams wash straight off. This one actually holds up through multiple washes. Worth the premium. I'm a nurse and this is essential.",
    rating: 5,
    author: "NurseReview",
    createdAt: daysAgo(5),
  },
  {
    id: 11,
    text: "The tube started leaking from a tiny seam crack after 2 months of normal use. Got it replaced through the store. The replacement has been fine but quality control could be better at this price.",
    rating: 2,
    author: "LeakyTube",
    createdAt: daysAgo(5),
  },
  {
    id: 12,
    text: "Fast delivery, beautifully packaged. The cream smells like a French countryside in the best possible way. My hands thank me every single day.",
    rating: 5,
    author: "FrenchCountryside",
    createdAt: daysAgo(6),
  },
  // Previous week
  {
    id: 13,
    text: "Honestly life-changing for dry hands. I work outdoors in cold weather and this is the only thing that keeps my skin from cracking. Applied twice daily, results are dramatic after one week.",
    rating: 5,
    author: "OutdoorWorker",
    createdAt: daysAgo(8),
  },
  {
    id: 14,
    text: "Good product but tiny for the price. The 30ml tube is cute but gone in 3 weeks with normal use. Wish they defaulted to a larger size at this price point.",
    rating: 2,
    author: "SmallTubeGripe",
    createdAt: daysAgo(9),
  },
  {
    id: 15,
    text: "My grandmother has been using this for 30 years and introduced me to it. Now I'm passing it to my daughter. Three generations of loyal customers says everything about the quality.",
    rating: 5,
    author: "ThreeGenerations",
    createdAt: daysAgo(9),
  },
  {
    id: 16,
    text: "Smells incredible and works incredibly. The shea butter concentration is noticeably higher than generic brands — your hands feel the difference within days of regular use.",
    rating: 5,
    author: "SheaConvert",
    createdAt: daysAgo(10),
  },
  {
    id: 17,
    text: "The pump on the large tube stopped working halfway through. Very annoying having to carefully squeeze from the sides to get the last half of the product out.",
    rating: 2,
    author: "BrokenPumpAgain",
    createdAt: daysAgo(11),
  },
  {
    id: 18,
    text: "Works well but the scent changed recently and I prefer the old version. Not sure if it's a reformulation or batch variation — it's slightly more floral now. Still good, just different.",
    rating: 3,
    author: "ScentChange",
    createdAt: daysAgo(12),
  },
  {
    id: 19,
    text: "Absorbs faster than any hand cream I've tried. No sticky residue. Scent fades quickly to a subtle warmth. Perfect for daytime use without interfering with everything you touch.",
    rating: 5,
    author: "FastAbsorb",
    createdAt: daysAgo(12),
  },
  {
    id: 20,
    text: "Gave it to my boyfriend as a joke gift and now he uses it every day and hid it from me. That's the best endorsement I can give any product.",
    rating: 5,
    author: "StoleByBoyfriend",
    createdAt: daysAgo(13),
  },
];

// ─── Ridge Carbon Fiber Wallet ────────────────────────────────────────────────

const ridgeReviews: DemoReview[] = [
  // Current week
  {
    id: 1,
    text: "Completely replaced my leather billfold. I carry 6 cards and folded cash and this setup is thinner than my old wallet with just 3 cards. The carbon fiber panels look incredible and feel even better.",
    rating: 5,
    author: "MinimalistCarry",
    createdAt: daysAgo(0),
  },
  {
    id: 2,
    text: "The elastic band broke after 4 months of daily use. Ridge sent a replacement band within a week, no questions asked, and I swapped it myself in 30 seconds. Impressed by the lifetime warranty.",
    rating: 4,
    author: "WarrantyTest",
    createdAt: daysAgo(1),
  },
  {
    id: 3,
    text: "Cards loosen up too much after 6 months. I have to hold it upside down carefully or cards slide out. The concept is great but the tension degrades noticeably over time.",
    rating: 2,
    author: "LooseCards",
    createdAt: daysAgo(1),
  },
  {
    id: 4,
    text: "This wallet fundamentally changed my daily carry. I used to have a fat wallet causing back pain. Now I have 6 cards and cash in something the size of a credit card. Genuinely life-changing.",
    rating: 5,
    author: "BackPainGone",
    createdAt: daysAgo(2),
  },
  {
    id: 5,
    text: "Beautiful product but impractical for me. I was used to just grabbing any card from a fan — with this I have to scroll through the stack. Went back to my old wallet after 2 weeks.",
    rating: 2,
    author: "CardGrabber",
    createdAt: daysAgo(2),
  },
  {
    id: 6,
    text: "The carbon fiber texture is stunning in person — photos don't do it justice. Lightweight, rigid, and fits in my front pocket perfectly. Zero back pocket bulge after years of wallet back pain.",
    rating: 5,
    author: "FrontPocketConvert",
    createdAt: daysAgo(3),
  },
  {
    id: 7,
    text: "Arrived in beautiful packaging — almost too nice to open. The wallet is exactly as described. The cash strap option I added works perfectly for the occasional time I carry bills.",
    rating: 4,
    author: "PremiumUnboxer",
    createdAt: daysAgo(3),
  },
  {
    id: 8,
    text: "I've had mine for 3 years with daily use and it still looks new. The carbon fiber panels haven't scratched or faded. This is genuinely a lifetime product as advertised.",
    rating: 5,
    author: "ThreeYearOwner",
    createdAt: daysAgo(4),
  },
  {
    id: 9,
    text: "Looks great but scratched my cards within the first week. The edge of the aluminum plate scored the magnetic strips on two of my cards. Had to get my credit cards replaced. Major design flaw.",
    rating: 1,
    author: "ScratchedCards",
    createdAt: daysAgo(4),
  },
  {
    id: 10,
    text: "Premium price but premium quality. I've bought this as gifts for 4 people and everyone's been thrilled. The packaging alone makes it a great gift — feels like something from a luxury brand.",
    rating: 5,
    author: "GiftExpert",
    createdAt: daysAgo(5),
  },
  {
    id: 11,
    text: "Getting cards out is awkward — you push from one end and fan to select. I drop cards when I'm in a hurry. The form factor is beautiful but the ergonomics of retrieval needs work.",
    rating: 3,
    author: "CardDropper",
    createdAt: daysAgo(5),
  },
  {
    id: 12,
    text: "Got this as a birthday gift and it became my daily driver immediately. Lighter than expected and the construction is flawless. No wobble, no sharp edges. Exactly what I wanted.",
    rating: 5,
    author: "BirthdayGift",
    createdAt: daysAgo(6),
  },
  // Previous week
  {
    id: 13,
    text: "Best minimalist wallet on the market. I tried 4 others before settling on the Ridge and nothing compares. Build quality is clearly superior and the design is timeless.",
    rating: 5,
    author: "WalletVeteran",
    createdAt: daysAgo(8),
  },
  {
    id: 14,
    text: "Expensive for what it is — metal plates and an elastic band. The branding is doing a lot of work at this price. It functions well but so does a money clip at $10.",
    rating: 2,
    author: "PriceSkeptic",
    createdAt: daysAgo(9),
  },
  {
    id: 15,
    text: "Carbon fiber panel cracked after I accidentally sat on it. Ridge replaced it under warranty but I'm more careful now. The crack was hairline but annoying for a $115 wallet.",
    rating: 3,
    author: "SatOnIt",
    createdAt: daysAgo(9),
  },
  {
    id: 16,
    text: "This wallet made me audit what I actually carry. The 8-card limit forced me to pare down and I realized I only needed 5 cards daily. Unexpectedly life-organizing.",
    rating: 5,
    author: "ForceMinimalist",
    createdAt: daysAgo(10),
  },
  {
    id: 17,
    text: "RFID blocking works — tested it with a card reader. Security peace of mind plus style plus slim profile. The premium price is justified when you consider it's a daily carry item.",
    rating: 5,
    author: "RFIDTester",
    createdAt: daysAgo(11),
  },
  {
    id: 18,
    text: "I've recommended this to everyone I know. My dad, brother, and two colleagues all have them now. The design is timeless and it solves a real everyday problem.",
    rating: 5,
    author: "WalletEvangelizer",
    createdAt: daysAgo(12),
  },
  {
    id: 19,
    text: "Shipping was fast and tracking was accurate. Packaging is very premium — the product inside lives up to it. The wallet is everything the marketing promises.",
    rating: 4,
    author: "MarketingMatched",
    createdAt: daysAgo(12),
  },
  {
    id: 20,
    text: "Wish the card capacity was slightly higher. 8 cards is fine for minimalists but I need 10-12 and the last few don't eject reliably when the wallet is at full capacity.",
    rating: 3,
    author: "NeedsMoreCards",
    createdAt: daysAgo(13),
  },
];

// ─── MrBeast Store Beast Particle SS Tee ──────────────────────────────────────

const mrbeastReviews: DemoReview[] = [
  // Current week
  {
    id: 1,
    text: "This tee is softer than I expected from merch. Usually merch tees feel like cardboard — this actually feels like premium cotton. The graphic is vibrant and crisp. Ordered for my nephew who absolutely loves it.",
    rating: 5,
    author: "UnexpectedQuality",
    createdAt: daysAgo(0),
  },
  {
    id: 2,
    text: "Ordered a medium based on the size chart — fits perfectly. Graphic hasn't cracked or peeled after 10 washes. Better quality than most branded merch I've bought from any creator.",
    rating: 5,
    author: "TenWashTest",
    createdAt: daysAgo(1),
  },
  {
    id: 3,
    text: "Sizing runs large. I'm usually a medium but the medium was way too big. Exchanged for a small and it fits well. Size chart on the website isn't accurate — measure carefully before ordering.",
    rating: 3,
    author: "SizingOff",
    createdAt: daysAgo(1),
  },
  {
    id: 4,
    text: "The black dye faded noticeably after 5 washes. Expected black to stay black. Now it looks dark grey. For a $35+ tee I expected better colorfastness. Pretty disappointed.",
    rating: 2,
    author: "FadedBlack",
    createdAt: daysAgo(2),
  },
  {
    id: 5,
    text: "My kid begged for this for his birthday. The packaging was really cool — the MrBeast branding makes it feel like a proper gift. Tee quality is solid, much better than standard YouTube merch.",
    rating: 5,
    author: "BirthdayDad",
    createdAt: daysAgo(2),
  },
  {
    id: 6,
    text: "The graphic print quality is excellent — sharp edges, no bleeding, great color saturation. Cotton weight is decent for a tee. Wears true to size in my experience with the large.",
    rating: 4,
    author: "PrintQualityFan",
    createdAt: daysAgo(3),
  },
  {
    id: 7,
    text: "Took 3 weeks to ship even though the website said 5-7 business days. No tracking updates for 10 days which was frustrating. Tee quality is fine when it finally arrived.",
    rating: 3,
    author: "SlowShipping",
    createdAt: daysAgo(3),
  },
  {
    id: 8,
    text: "Bought 3 shirts for my kids. All fit well, good print quality, nice soft feel. The kids are obsessed. Worth it for fans — better quality than I expected from online creator merch.",
    rating: 5,
    author: "ThreeKidsBought",
    createdAt: daysAgo(4),
  },
  {
    id: 9,
    text: "The stitching on the collar started unraveling after the third wash. Thread was already loose before washing. For this price point the construction should be better.",
    rating: 2,
    author: "UnravelingCollar",
    createdAt: daysAgo(4),
  },
  {
    id: 10,
    text: "Incredible design and great fabric. The Particle graphic is genuinely cool artwork — not just a logo slap on a shirt. Wore it to school and got tons of compliments from people who didn't even know MrBeast.",
    rating: 5,
    author: "ComplimentMagnet",
    createdAt: daysAgo(5),
  },
  {
    id: 11,
    text: "Runs a bit short in the torso for taller people. I'm 6'1\" and the medium is borderline too short. The quality itself is fine but tall buyers should size up.",
    rating: 3,
    author: "TallBuyer",
    createdAt: daysAgo(5),
  },
  {
    id: 12,
    text: "Fast shipping — ordered Thursday, arrived Monday. Well packaged. The tee quality is legitimately good, not just fan-merch level. Would buy again for the next drop.",
    rating: 5,
    author: "FastArrivedFan",
    createdAt: daysAgo(6),
  },
  // Previous week
  {
    id: 13,
    text: "My son is a massive MrBeast fan and this was his top wish list item. He wore it the day it arrived and won't take it off. Great gift for any fan.",
    rating: 5,
    author: "ProudParent",
    createdAt: daysAgo(8),
  },
  {
    id: 14,
    text: "Quality for the price is meh. Thin cotton, graphic is okay. Not terrible but I expected more for $35+. Feels like a $20 shirt with premium branding markup.",
    rating: 2,
    author: "PriceValueMismatch",
    createdAt: daysAgo(9),
  },
  {
    id: 15,
    text: "The graphic is exactly as shown — vibrant, detailed, well-printed. First wash didn't affect it at all. Very happy with the purchase and plan to order more designs.",
    rating: 5,
    author: "GraphicLover",
    createdAt: daysAgo(9),
  },
  {
    id: 16,
    text: "Sizing is inconsistent. I ordered two different styles and they're noticeably different in size despite both being labeled medium. More QC on sizing consistency is needed.",
    rating: 2,
    author: "InconsistentSizing",
    createdAt: daysAgo(10),
  },
  {
    id: 17,
    text: "Bought this for myself as a 25-year-old and I get more compliments on this shirt than most of my 'grown-up' clothes. The Particle graphic is genuinely well-designed art.",
    rating: 5,
    author: "AdultFan",
    createdAt: daysAgo(11),
  },
  {
    id: 18,
    text: "Delivered in a flat mailer with no protection. Shirt arrived wrinkled. Not damaged but felt low-effort for a premium price point. Better packaging would match the brand quality.",
    rating: 3,
    author: "WrinkledDelivery",
    createdAt: daysAgo(12),
  },
  {
    id: 19,
    text: "The Beast Particle graphic is sick. Unique design that doesn't just feel like slapping a logo on a shirt. High quality screen print that's held up through multiple washes.",
    rating: 5,
    author: "ScreenPrintFan",
    createdAt: daysAgo(12),
  },
  {
    id: 20,
    text: "Customer service was helpful when I needed to exchange for a different size. Quick response and smooth process. Good experience that made up for the initial sizing issue.",
    rating: 4,
    author: "ExchangeSuccess",
    createdAt: daysAgo(13),
  },
];

// ─── Brand registry ───────────────────────────────────────────────────────────

export const DEMO_BRANDS: DemoBrand[] = [
  {
    id: "owala",
    name: "Owala",
    product: "FreeSip 24oz Stainless Steel Water Bottle",
    category: "drinkware",
    emoji: "💧",
    tagline: "Hydration meets innovation",
    reviews: owalaReviews,
    previousWeek: { positive: 4, negative: 2, neutral: 2, total: 8 },
  },
  {
    id: "anker",
    name: "Anker",
    product: "MagGo 10000mAh Wireless Power Bank",
    category: "electronics",
    emoji: "🔋",
    tagline: "Power without the cables",
    reviews: ankerReviews,
    previousWeek: { positive: 5, negative: 1, neutral: 2, total: 8 },
  },
  {
    id: "loccitane",
    name: "L'Occitane",
    product: "Shea Butter Hand Cream",
    category: "beauty",
    emoji: "🌿",
    tagline: "Provençal botanicals, iconic formula",
    reviews: loccitaneReviews,
    previousWeek: { positive: 5, negative: 2, neutral: 1, total: 8 },
  },
  {
    id: "ridge",
    name: "Ridge",
    product: "Carbon Fiber Wallet",
    category: "accessories",
    emoji: "💳",
    tagline: "Engineered for everyday carry",
    reviews: ridgeReviews,
    previousWeek: { positive: 5, negative: 1, neutral: 2, total: 8 },
  },
  {
    id: "mrbeast",
    name: "MrBeast Store",
    product: "Beast Particle SS Tee — Black",
    category: "apparel",
    emoji: "👕",
    tagline: "Creator merch, elevated quality",
    reviews: mrbeastReviews,
    previousWeek: { positive: 4, negative: 2, neutral: 2, total: 8 },
  },
];

export function getBrandById(id: string): DemoBrand | undefined {
  return DEMO_BRANDS.find((b) => b.id === id);
}
