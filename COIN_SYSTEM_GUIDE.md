# 🪙 FlowState Coin System - Quick Reference

## Coin Economy at a Glance

### Earning Coins ⬆️
**Habit Completion**
```
Easy     → 10 coins
Medium   → 25 coins
Hard     → 50 coins
Extreme  → 100 coins
```

**Task Completion**
```
Easy     → 5 coins
Medium   → 15 coins
Hard     → 30 coins
Extreme  → 75 coins
```

**Bonuses**
```
Streak Bonus   → +1 coin per consecutive day (max +10)
Priority Bonus → priority × 0.5 coins (e.g., priority 5 = +2.5 coins)
```

**Example**: Hard habit, 5-day streak, priority 4
- Base: 50
- Streak: +5
- Priority: +2
- **Total: 57 coins** ✨

---

### Losing Coins ⬇️
**Missing Completion Deadline**
```
Easy     → -5 coins
Medium   → -12 coins
Hard     → -25 coins
Extreme  → -50 coins
```

**Additional Effect**: Streak resets to 0
```
Example: Had 15-day streak, missed today → streak = 0
```

---

## Streak System 🔥

### How Streaks Work
- **Increments by 1** each day the habit is completed
- **Resets to 0** when a daily habit is missed
- **Weekly/Monthly habits** track independently (won't break daily streaks)
- **Longest Streak** tracked as lifetime best
- **Bonus: +1 coin per day** in streak (max +10 coins)

### Example Timeline
```
Day 1: Complete → Streak: 1, Coins: 10 + 1 (bonus) = 11
Day 2: Complete → Streak: 2, Coins: 10 + 2 (bonus) = 12
Day 3: Complete → Streak: 3, Coins: 10 + 3 (bonus) = 13
Day 4: MISS    → Streak: 0, Coins: -12 (penalty)
Day 5: Complete → Streak: 1, Coins: 10 + 1 (bonus) = 11 (streak restarts)
```

---

## Transaction Types 📝

### Available in Coin History
```
completion  - Coins earned from completing habit/task
penalty     - Coins lost from missing deadline
bonus       - Extra coins from streaks/bonuses
refund      - Manual coin adjustments
manual      - Admin adjustments
```

---

## API Quick Reference

### Endpoints
```
GET  /api/user/coins/balance        → Current balance
GET  /api/user/coins/history        → Transaction history (paginated)
GET  /api/user/coins/stats          → Comprehensive statistics

POST /api/user/habits/:id/complete  → Complete habit, award coins
POST /api/user/tasks/:id/complete   → Complete task, award coins
```

### Response Example (Complete Habit)
```json
{
  "coinsAwarded": {
    "base": 50,
    "streak": 5,
    "priority": 2,
    "total": 57
  },
  "newBalance": 247,
  "streak": 6,
  "message": "Habit completed! Coins awarded."
}
```

---

## Difficulty Guide 📊

### Easy
- Low effort, basic habits
- Examples: Drink water, 5-min meditation
- Rewards: 10 coins (habit) / 5 coins (task)
- Penalty: -5 coins

### Medium
- Moderate effort, regular commitment
- Examples: 30-min workout, coding practice
- Rewards: 25 coins (habit) / 15 coins (task)
- Penalty: -12 coins

### Hard
- High effort, significant challenge
- Examples: Full workout, deep work session
- Rewards: 50 coins (habit) / 30 coins (task)
- Penalty: -25 coins

### Extreme
- Very challenging, rare completions
- Examples: Marathon, major project completion
- Rewards: 100 coins (habit) / 75 coins (task)
- Penalty: -50 coins

---

## Priority Guide 🎯

1. Low Priority - Basic + 0.5 bonus
2. Normal Priority - Basic + 1 bonus
3. Default Priority - Basic + 1.5 bonus
4. High Priority - Basic + 2 bonus
5. Critical Priority - Basic + 2.5 bonus

---

## Analytics Available 📊

Via `/api/user/analytics/dashboard`:
- Completion history (last 30 days)
- Hourly patterns (when you complete most)
- Weekday patterns (your best days)
- Streak metrics (current, longest, average)
- Difficulty distribution (easy/medium/hard/extreme)

---

## Best Practices

✅ **Set meaningful difficulty levels** - Match effort to coins
✅ **Use priority for important habits** - Get bonus coins
✅ **Build streaks** - Consistent completion = more coins
✅ **Review history** - Understand your patterns
✅ **Mix difficulties** - Easy wins + hard challenges

---

## Future Features (v2.0)

🔜 **Chest System** - Unlock rewards with coins
🔜 **Shop** - Exchange coins for gift codes/coupons
🔜 **Leaderboards** - Compete with friends
🔜 **Weekly Challenges** - Bonus coin events
🔜 **Referral Bonuses** - Earn coins inviting friends

---

## Support

For issues or questions:
1. Check transaction history for details
2. Review analytics dashboard
3. Contact support with your User ID
