// Static demo reviews for "Summit Gear Co." (outdoor/camping gear)
// 20 reviews spanning 14 days, split for week-over-week comparison

export interface DemoReview {
  id: number;
  text: string;
  rating: number;
  author: string;
  createdAt: string; // ISO date string
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
  return d.toISOString();
}

// Current week (0-6 days ago) — 12 reviews
// Previous week (7-13 days ago) — 8 reviews
export const DEMO_REVIEWS: DemoReview[] = [
  // ── Current week ──────────────────────────────────────────
  {
    id: 1,
    text: "The Alpine 45L backpack is incredibly well-built. Took it on a 5-day trek through the Cascades and every seam held up perfectly. The hip belt distributes weight beautifully. Worth every penny.",
    rating: 5,
    author: "TrailRunner88",
    createdAt: daysAgo(0),
  },
  {
    id: 2,
    text: "Ordered the down sleeping bag and it arrived with a ripped stuff sack. The bag itself seems fine but that's a bad first impression for a $300 item. Contacted support and they're sending a replacement sack.",
    rating: 3,
    author: "CamperJoe",
    createdAt: daysAgo(1),
  },
  {
    id: 3,
    text: "TERRIBLE customer service. I've been waiting 3 weeks for a response about my defective tent poles. Multiple emails, no reply. Will never order from Summit Gear again.",
    rating: 1,
    author: "FrustratedHiker",
    createdAt: daysAgo(1),
  },
  {
    id: 4,
    text: "The trekking poles are lightweight but the locking mechanism feels flimsy. After two hikes it started slipping under load. Returning these.",
    rating: 2,
    author: "MountainMike",
    createdAt: daysAgo(2),
  },
  {
    id: 5,
    text: "Love the rain jacket! Fits true to size, the pit zips are a game-changer for ventilation, and it packs down smaller than my water bottle. Best rain gear I've owned.",
    rating: 5,
    author: "PNWExplorer",
    createdAt: daysAgo(2),
  },
  {
    id: 6,
    text: "Headlamp is decent for the price. Not the brightest but battery life is excellent — lasted a full week of evening use at camp. Good value buy.",
    rating: 4,
    author: "BudgetBackpacker",
    createdAt: daysAgo(3),
  },
  {
    id: 7,
    text: "The camp stove is a beast. Boils water in under 3 minutes at altitude. Compact, reliable, and the piezo igniter actually works unlike my last three stoves. Highly recommend.",
    rating: 5,
    author: "AlpineChef",
    createdAt: daysAgo(3),
  },
  {
    id: 8,
    text: "Sizing is way off. Ordered my usual medium in the fleece pullover and it's enormous. Had to exchange for a small. Annoying but the fleece itself is cozy once you get the right size.",
    rating: 3,
    author: "SarahH",
    createdAt: daysAgo(4),
  },
  {
    id: 9,
    text: "Shipping took 18 days for 'standard' delivery. By the time my tent arrived, the camping trip was over. Incredibly disappointing.",
    rating: 1,
    author: "WeekendWarrior",
    createdAt: daysAgo(5),
  },
  {
    id: 10,
    text: "Bought the insulated water bottle and it keeps drinks cold for 24+ hours, just as advertised. The powder coat finish looks great too. No complaints.",
    rating: 5,
    author: "HydrationStation",
    createdAt: daysAgo(5),
  },
  {
    id: 11,
    text: "The hammock is okay. Comfortable enough but the carabiners it comes with feel cheap. I swapped them out for climbing-rated ones for peace of mind. Material is nice though.",
    rating: 3,
    author: "LazyDaysCamper",
    createdAt: daysAgo(6),
  },
  {
    id: 12,
    text: "Absolutely love the ultralight tent! Setup takes 5 minutes, it survived 40mph winds without a problem, and it weighs next to nothing. Summit Gear nailed it.",
    rating: 5,
    author: "ThruHiker2024",
    createdAt: daysAgo(6),
  },

  // ── Previous week ─────────────────────────────────────────
  {
    id: 13,
    text: "The hiking boots run narrow. I have wide feet and these were painful after a few miles. Quality seems solid but they don't work for my foot shape.",
    rating: 2,
    author: "WideFeetWalker",
    createdAt: daysAgo(8),
  },
  {
    id: 14,
    text: "Great value on the dry bags. Kept everything bone dry during a 3-day kayaking trip. At this price point you can't beat them.",
    rating: 5,
    author: "PaddleOn",
    createdAt: daysAgo(9),
  },
  {
    id: 15,
    text: "Packaging was impressive — everything came individually wrapped with care instructions. Small detail but it shows they care about the product experience.",
    rating: 4,
    author: "UnboxingFan",
    createdAt: daysAgo(9),
  },
  {
    id: 16,
    text: "The solar charger barely works. In full sun it charges my phone at a glacial pace. Took 8 hours to get 30%. Complete waste of money.",
    rating: 1,
    author: "OffGridGuy",
    createdAt: daysAgo(10),
  },
  {
    id: 17,
    text: "Camp chair is comfortable and surprisingly sturdy for its weight. Holds my 220lbs no problem. Only wish it had a cup holder.",
    rating: 4,
    author: "BigDan",
    createdAt: daysAgo(11),
  },
  {
    id: 18,
    text: "Returned the backpack because the zippers jammed on day one. Customer service processed the return quickly though and I had my refund in 3 days. Considering trying a different model.",
    rating: 2,
    author: "GearTester",
    createdAt: daysAgo(12),
  },
  {
    id: 19,
    text: "Fast shipping! Ordered on Monday, arrived Wednesday. Well packed too. The sleeping pad is super comfortable — best sleep I've had in the backcountry.",
    rating: 5,
    author: "QuickShipFan",
    createdAt: daysAgo(13),
  },
  {
    id: 20,
    text: "It's fine. Does what it says. Nothing special about the compass but nothing wrong with it either.",
    rating: 3,
    author: "MinimalistMike",
    createdAt: daysAgo(13),
  },
];

// Pre-computed previous week data for WeekOverWeek component
// (matches the 8 reviews from 7-13 days ago)
export const DEMO_PREVIOUS_WEEK = {
  positive: 4,
  negative: 2,
  neutral: 2,
  total: 8,
};
