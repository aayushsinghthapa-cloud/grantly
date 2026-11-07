# Grantly landing: brief

**Self-authored under explicit creative delegation.** The owner asked for the site to be "properly animated", "minimal, professional like Apple", "not AI slop", and usable in the real world, and left the creative direction to the builder. Evidence below is quoted; everything else is an authored decision.

## The eight topics

1. **Vibe, three to five words.** Calm, exact, quietly confident. References: a well-run financial aid office; the restraint of a good product keynote; a bank statement that finally makes sense.
2. **Journey, in order.** See it working → name the mess → every rule checked against you → the range of matches → a breath → the year gets paid for → documents in order → start with one answer.
3. **Energy curve.** Low, low, rising, wide, silent, highest, settling, still.
4. **Feeling, stage by stage, and the one moment.** Below (feeling curve). The one moment: the funding gap closing to zero under your own scroll.
5. **The one thing no site they have seen does.** Scroll plays out a whole scholarship season on the real Funding Gap Meter, and the gap closes as you scroll.
6. **How far from premium-minimal.** Stay at premium-minimal ("minimal, professional like Apple").
7. **One unbroken world or distinct scenes?** Distinct scenes. Grantly is a working tool, not a place.
8. **Assets on hand.** The product itself: real components running real logic (`getMatch`, `computeFunding`, `getReadiness`) on the clearly labelled sample student "Ananya". No generated imagery.

## Grammar: Live surface

The page behaves like the product. Every panel on it is the app's own markup computing its state from the demo data, and the page says on its face that the scenario is a sample. Nav is the app's real navigation bar. The close is an actual input.

**Why the other seven lost.** Filmic one-shot needs footage and sells a mood, not a tool. Chaptered editorial suits a manifesto. Continuous world needs real geography. Typographic poster has no product in it. Gallery/catalog would turn scholarships into merchandise. Split stage was close (before/after), but the "before" half would be a caricature of other sites. Rhythmic cutlist is the wrong energy for students handling money.

**Deliberate deviation.** Live surface forbids display headlines. The hero keeps one plain, two-line headline at a moderate size, because judges and first-time students need the product named in one sentence before the surface means anything. No other section uses display type above ~3.5rem.

## Journey

| # | Beat | What changes for the visitor |
|---|---|---|
| 1 | Recognition | They see a student's real dashboard, already working |
| 2 | Tension | The mess is named plainly: portals, jargon, missed deadlines |
| 3 | Turn | A scholarship's rules get checked against a profile, one by one |
| 4 | Range | Lateral travel through that student's actual matches |
| 5 | Breath | One sentence in space |
| 6 | Peak | The season plays out and the funding gap closes to zero |
| 7 | Order | Documents go from missing to ready |
| 8 | Commitment | They type their own first answer |

## Feeling curve

1. **Calm confidence.** A finished, working surface in layered depth.
2. **Recognition, slightly irritated.** Three short lines that name the problem.
3. **Relief.** Ticks arrive one by one and the score settles.
4. **Abundance.** Cards slide past sideways; more than expected.
5. **Anticipation.** Near-silence. One line, lots of space. (Authored silence, not dead scroll.)
6. **Satisfaction, the peak.** Status pills advance, the bar fills, the gap counts down to ₹0.
7. **Control.** A wipe turns a messy list into a ready one.
8. **Agency.** A real field, a live count, one button.

**The peak:** "You scroll and watch her whole year get paid for." Act 6, the largest span on the page, with the quietest act directly before it.

**It's the site where** you watch a student's year get paid for, one scroll at a time.

## Score

| Beat | Device | Why this one |
|---|---|---|
| Recognition | `parallax` (+ `tilt` on the front plane) | Three real panels at different depths: depth from differential motion |
| Tension | `flow` + `in` | An argument in plain type; a pin would over-dramatise it |
| Turn | `pin` + `--sc-p` checklist | The frame holds while the rules resolve, which is the beat |
| Range | `pan` | Sideways reads as breadth: these are options, not a ranking |
| Breath | `flow` + `in` | Silence before the peak |
| Peak | `pin` + `--sc-p` (signature) | The surface holds while the season advances; real numbers count down |
| Order | `reveal` | A wipe is a change of state: missing to ready |
| Commitment | `flow` + real input | The page stops moving and starts listening |

Families used: parallax, pointer, flow/in, pin, pan, reveal (6). No family twice in a row. No scrub (banned by the grammar, and there is no footage). Total length about 11 viewport-heights across 8 sections, outside the 6–7 acts / 13.6–13.8vh band.

## Signature move

**The season scrubber.** Scroll position drives a scripted scholarship season through the real `computeFunding()`: four applications advance saved → preparing → submitted → won, the stacked bar redistributes with transforms, and the gap figure counts down to ₹0. Scrolling back reverses it exactly.
