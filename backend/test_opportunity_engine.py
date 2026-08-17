from __future__ import annotations

import unittest

from backend.opportunity_engine import calculate_opportunity


class OpportunityEngineTests(unittest.TestCase):
    def setUp(self) -> None:
        self.technical = {
            "price": 100,
            "technical_score": 90,
            "indicators": {
                "relative_volume20": 3.0,
                "high52": 105,
                "low52": 50,
                "rsi14": 60,
            },
            "signals": {
                "breakout_60d": True,
                "golden_cross": True,
            },
        }
        self.liquidity = {"score": 95}
        self.momentum = {"score": 90}
        self.quote = {"price": 100}

    def test_score_is_between_zero_and_hundred(self) -> None:
        result = calculate_opportunity(self.technical, self.liquidity, self.momentum, self.quote)
        self.assertGreaterEqual(result["score"], 0)
        self.assertLessEqual(result["score"], 100)

    def test_strong_setup_scores_as_strong_opportunity(self) -> None:
        result = calculate_opportunity(self.technical, self.liquidity, self.momentum, self.quote)
        self.assertEqual(result["label"], "strong_opportunity")
        self.assertTrue(result["signals"]["breakout"])
        self.assertTrue(result["signals"]["golden_cross"])

    def test_weak_momentum_reduces_score(self) -> None:
        weak_momentum = {"score": 20}
        result = calculate_opportunity(self.technical, self.liquidity, weak_momentum, self.quote)
        self.assertLess(result["score"], 85)
        self.assertIn("الزخم ضعيف", result["warnings"])

    def test_low_relative_volume_generates_warning(self) -> None:
        technical = dict(self.technical)
        technical["indicators"] = dict(self.technical["indicators"])
        technical["indicators"]["relative_volume20"] = 0.5

        result = calculate_opportunity(technical, self.liquidity, self.momentum, self.quote)
        self.assertIn("الحجم الحالي أقل من المتوسط", result["warnings"])

    def test_missing_optional_values_does_not_crash(self) -> None:
        result = calculate_opportunity({"indicators": {}, "signals": {}}, {}, {}, {})
        self.assertIsInstance(result["score"], float)
        self.assertGreaterEqual(result["score"], 0)
        self.assertLessEqual(result["score"], 100)


if __name__ == "__main__":
    unittest.main()
