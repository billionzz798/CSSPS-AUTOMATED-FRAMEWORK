# Results Color Coding Guide

**Date:** 17 March 2026  
**Purpose:** Define intuitive color coding for framework results and equity analysis

---

## Color Scheme Overview

### ✅ Positive Metrics (Green)
**Meaning:** Good performance, meeting or exceeding expectations  
**Colors:**
- **Dark Green (#22863a)** — Excellent performance (threshold exceeded)
- **Green (#28a745)** — Good performance (at or above target)

### ⚠️ Neutral/Warning Metrics (Yellow/Orange)
**Meaning:** Fair performance, slightly below expectations  
**Colors:**
- **Yellow (#ff9800)** — Fair/neutral performance
- **Orange (#f57c00)** — Minor decline or concern

### ❌ Negative Metrics (Red)
**Meaning:** Poor performance, significant issues  
**Colors:**
- **Red (#d32f2f)** — Poor performance, below acceptable threshold

---

## Results Page (Result.tsx) - Equity Analysis

### Placement Rate Thresholds

| Placement Rate | Color | Background | Text | Interpretation |
|---|---|---|---|---|
| ≥ 83% | Dark Green | `rgba(34, 134, 58, 0.12)` | `#22863a` | Excellent placement (exceeds best year) |
| 80-83% | Green | `rgba(76, 175, 80, 0.12)` | `#28a745` | Good placement (meets baseline) |
| 75-80% | Yellow | `rgba(255, 193, 7, 0.12)` | `#ff9800` | Fair placement (acceptable but room for improvement) |
| < 75% | Red | `rgba(244, 67, 54, 0.12)` | `#d32f2f` | Poor placement (needs attention) |

**2024 GES Baseline:** 80.93% → **Green**  
**2022 Peak:** 84.16% → **Dark Green**

---

### First-Choice Satisfaction Rate Thresholds

| Rate | Color | Background | Text | Interpretation |
|---|---|---|---|---|
| ≥ 60% | Green | `rgba(76, 175, 80, 0.12)` | `#28a745` | Strong satisfaction (good choice matching) |
| 55-60% | Fair | `rgba(255, 193, 7, 0.12)` | `#ff9800` | Decent satisfaction |
| < 55% | Red | `rgba(244, 67, 54, 0.12)` | `#d32f2f` | Low satisfaction (many denied first choice) |

**2024 GES Baseline:** 70.5% → **Dark Green**  
**Target:** ≥ 60% → **Green or better**

---

### Average Choice Rank Thresholds

**Lower is better** (1 = first choice, higher numbers = farther preferences)

| Avg Rank | Color | Background | Text | Interpretation |
|---|---|---|---|---|
| ≤ 2.5 | Dark Green | `rgba(34, 134, 58, 0.12)` | `#22863a` | Excellent (students getting early choices) |
| 2.5-3.5 | Green | `rgba(76, 175, 80, 0.12)` | `#28a745` | Good (mostly 2nd-3rd choice placements) |
| 3.5-4.5 | Yellow | `rgba(255, 193, 7, 0.12)` | `#ff9800` | Fair (reaching mid-range preferences) |
| > 4.5 | Red | `rgba(244, 67, 54, 0.12)` | `#d32f2f` | Poor (students getting far down their lists) |

---

## Comparison Page (ComparisonResults.tsx) - Equity Improvements

### Regional/Gender Fairness Deltas

**Interpretation:** How much did the framework improve (or decline) placement fairness compared to GES baseline?

| Change | Color | Background | Text | Interpretation |
|---|---|---|---|---|
| Δ ≥ +2.0% | Dark Green | `rgba(34, 134, 58, 0.12)` | `#22863a` | Strong improvement (framework better for this group) |
| Δ +0.5% to +2.0% | Green | `rgba(76, 175, 80, 0.12)` | `#28a745` | Good improvement |
| Δ -0.5% to +0.5% | Yellow | `rgba(255, 193, 7, 0.12)` | `#ff9800` | Neutral (essentially equivalent) |
| Δ -0.5% to -2.0% | Orange | `rgba(255, 152, 0, 0.12)` | `#f57c00` | Minor decline |
| Δ < -2.0% | Red | `rgba(244, 67, 54, 0.12)` | `#d32f2f` | Significant decline (framework worse for this group) |

**Example:**
- Region: Ashanti, Δ = +1.5% → **Green** (framework improved fairness for Ashanti students)
- Region: Upper West, Δ = -0.8% → **Orange** (framework slightly reduced fairness for Upper West students)
- Gender: Female, Δ = +0.2% → **Yellow** (essentially no change)

---

## Overall Comparison Verdict Section

### Verdict Colors

| Verdict | Color | Background | Border |
|---|---|---|---|
| Framework Better | Green | `rgba(0, 106, 61, 0.08)` | `var(--gh-green)` |
| Comparable | Yellow | `rgba(255, 209, 0, 0.08)` | `var(--gh-yellow)` |
| Baseline Better | Red | `rgba(210, 16, 52, 0.08)` | `var(--gh-red)` |

**Green Verdict Example:**
- Framework placement rate: 83.2%
- GES baseline: 80.9%
- Difference: +2.3% (within comparable ±0.5%? No, but better overall)

**Yellow Verdict Example:**
- Framework placement rate: 80.8%
- GES baseline: 80.9%
- Difference: -0.1% (within ±0.5%, essentially comparable)

---

## Color Psychology & Fairness

### Why These Colors?

1. **Green = Good/Positive**
   - Students placed ✓
   - Fairness improved ✓
   - Satisfaction high ✓

2. **Yellow = Neutral/Caution**
   - Performance acceptable but room for improvement
   - Changes are minimal/negligible
   - Needs monitoring

3. **Red = Alert/Negative**
   - Students unplaced ✗
   - Fairness declining ✗
   - Satisfaction low ✗

### Non-Misleading Principle

✅ **Colors align with outcomes:**
- Higher placement = Green (good)
- Lower placement = Red (bad)
- Neutral change = Yellow (so-so)

❌ **Avoid misleading colors:**
- ✗ Red for high placement rates (confusing)
- ✗ Green for low placement rates (misleading)
- ✗ Using only one color (hard to interpret)

---

## Implementation Details

### Result.tsx Equity Analysis Functions

```typescript
// High placement rate (≥83% = excellent)
getPlacementRateStyle(rate: number)
getPlacementRateTextColor(rate: number)

// First-choice satisfaction
getMetricStyle(value: number, threshold: number)
getMetricTextColor(value: number, threshold: number)

// Choice rank (lower is better)
getChoiceRankStyle(rank: number)
getChoiceRankTextColor(rank: number)
```

### ComparisonResults.tsx Equity Functions

```typescript
// Regional/Gender improvement delta
getEquityItemStyle(delta: number)
getEquityTextColor(delta: number)
```

---

## User Guidance

### Reading Results

**Green Metric** 📊 → "This is performing well; keep it up"

**Yellow Metric** ⚠️ → "This is acceptable but could improve; monitor it"

**Red Metric** 🔴 → "This needs attention; investigate why and improve"

### Comparing Frameworks

**Green Verdict** ✅ → "Framework shows strength in this area"

**Yellow Verdict** ⚠️ → "Frameworks are essentially equivalent (comparable)"

**Red Verdict** ❌ → "GES baseline stronger in this area; needs improvement"

---

## Quick Reference

| What You See | What It Means |
|---|---|
| Dark Green 📊 | Excellent, exceeds expectations |
| Green ✓ | Good, meets expectations |
| Yellow ⚠️ | Fair, acceptable, monitor |
| Orange ⚠️ | Minor concern, slight decline |
| Red ❌ | Poor, below acceptable |

