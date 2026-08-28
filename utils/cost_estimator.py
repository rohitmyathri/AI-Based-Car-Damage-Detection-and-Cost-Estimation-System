"""
Repair cost estimation utilities.
Edit the DAMAGE_COSTS and CATEGORY_MULTIPLIERS dicts to tune pricing.
"""

# ── Base repair costs (USD) by damage type × severity ─────────────────────────
DAMAGE_COSTS = {
    "dent":         {"low": 150,  "medium": 400,  "high": 800},
    "scratch":      {"low": 100,  "medium": 300,  "high": 600},
    "crack":        {"low": 200,  "medium": 500,  "high": 1000},
    "broken_glass": {"low": 300,  "medium": 600,  "high": 1200},
    "rust":         {"low": 250,  "medium": 500,  "high": 900},
    "no_damage":    {"low": 0,    "medium": 0,    "high": 0},
}

# ── Vehicle-category price multipliers ────────────────────────────────────────
CATEGORY_MULTIPLIERS = {
    "economy":   1.0,
    "mid-range": 1.4,
    "luxury":    2.0,
    "sports":    2.5,
}

DEFAULT_DAMAGE_COST = 300   # fallback if damage type not in table
DEFAULT_MULTIPLIER  = 1.0


def estimate_repair_cost(car_category: str, damage_type: str, severity: str) -> float:
    """
    Return estimated repair cost in USD.

    Args:
        car_category: economy | mid-range | luxury | sports
        damage_type:  dent | scratch | crack | broken_glass | rust | no_damage
        severity:     low | medium | high
    """
    # Normalise inputs
    cat = car_category.lower().strip() if car_category else "economy"
    dmg = damage_type.lower().strip()  if damage_type  else "dent"
    sev = severity.lower().strip()     if severity     else "medium"

    base_cost  = DAMAGE_COSTS.get(dmg, {}).get(sev, DEFAULT_DAMAGE_COST)
    multiplier = CATEGORY_MULTIPLIERS.get(cat, DEFAULT_MULTIPLIER)

    return round(base_cost * multiplier, 2)


def get_cost_breakdown(car_category: str, damage_type: str, severity: str) -> dict:
    """Return a dict with base cost, multiplier, and final cost for display."""
    cat = car_category.lower().strip() if car_category else "economy"
    dmg = damage_type.lower().strip()  if damage_type  else "dent"
    sev = severity.lower().strip()     if severity     else "medium"

    base_cost  = DAMAGE_COSTS.get(dmg, {}).get(sev, DEFAULT_DAMAGE_COST)
    multiplier = CATEGORY_MULTIPLIERS.get(cat, DEFAULT_MULTIPLIER)
    final      = round(base_cost * multiplier, 2)

    return {
        "base_cost":   base_cost,
        "multiplier":  multiplier,
        "final_cost":  final,
        "category":    cat,
        "damage_type": dmg,
        "severity":    sev,
    }
