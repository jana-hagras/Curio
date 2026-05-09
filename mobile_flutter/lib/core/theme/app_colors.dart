import 'package:flutter/material.dart';

/// Premium gold & black color palette for the Curio platform.
class AppColors {
  // ── Brand core ────────────────────────────────────────────────────
  static const Color goldPrimary = Color(0xFFD4A843);
  static const Color goldLight = Color(0xFFE0BC5E);
  static const Color goldLighter = Color(0xFFF0D98A);
  static const Color goldDark = Color(0xFFB8912A);
  
  static const Color primary = goldPrimary;
  static const Color primaryDark = goldDark;
  static const Color primaryLight = goldLight;

  // ── Black Palette ─────────────────────────────────────────────────
  static const Color blackDeep = Color(0xFF0A0A0A);
  static const Color blackMid = Color(0xFF111111);
  static const Color blackSoft = Color(0xFF1A1A1A);
  static const Color blackMuted = Color(0xFF242424);

  // ── Surface Colors (Light Mode) ───────────────────────────────────
  static const Color surfacePrimary = Color(0xFFFFFFFF);
  static const Color surfaceSecondary = Color(0xFFF7F7F5);
  static const Color surfaceTertiary = Color(0xFFEDEBE8);
  static const Color surfaceBorder = Color(0xFFE0DCD5);
  static const Color cream = Color(0xFFFDF8F0);
  
  // ── Surface Colors (Dark Mode) ────────────────────────────────────
  static const Color darkSurfacePrimary = Color(0xFF161616);
  static const Color darkSurfaceSecondary = Color(0xFF1E1E1E);
  static const Color darkSurfaceTertiary = Color(0xFF252525);
  static const Color darkSurfaceBorder = Color(0xFF333333);

  // ── Text Colors (Light Mode) ──────────────────────────────────────
  static const Color textPrimary = Color(0xFF0A0A0A);
  static const Color textSecondary = Color(0xFF6B6B6B);
  static const Color textTertiary = Color(0xFF9CA3AF);
  static const Color textLight = Color(0xFFFFFFFF);

  // ── Text Colors (Dark Mode) ───────────────────────────────────────
  static const Color darkTextPrimary = Color(0xFFE8E8E8);
  static const Color darkTextSecondary = Color(0xFFA0A0A0);
  static const Color darkTextTertiary = Color(0xFF707070);

  // ── Legacy aliases for existing code compatibility ────────────────
  static const Color background = surfaceSecondary; // Default to Light Mode secondary
  static const Color surface = surfacePrimary;
  static const Color surfaceLight = surfaceSecondary;
  static const Color surfaceAccent = cream;

  static const Color divider = surfaceBorder;
  static const Color border = surfaceBorder;
  static const Color borderGold = Color(0x33D4A843);
  static const Color gold = goldPrimary;

  static const Color textMuted = textTertiary;

  // Dark mode aliases
  static const Color dark = blackDeep;
  static const Color darkSurface = darkSurfacePrimary;
  static const Color darkCard = darkSurfaceSecondary;

  // ── Status ────────────────────────────────────────────────────────
  static const Color success = Color(0xFF10B981);
  static const Color warning = Color(0xFFF59E0B);
  static const Color error = Color(0xFFEF4444);
  static const Color info = Color(0xFF3B82F6);
  static const Color errorLight = Color(0xFFFEE2E2);

  // ── Category accents ──────────────────────────────────────────────
  static const Color accentOrange = Color(0xFFE67E22);
  static const Color accentGreen = Color(0xFF27AE60);
  static const Color accentPurple = Color(0xFF8E44AD);
  static const Color accentBlue = Color(0xFF2980B9);

  // ── Admin accent ──────────────────────────────────────────────────
  static const Color adminAccent = goldPrimary; 
  static const Color adminPrimary = blackDeep;
  static const Color adminSurface = darkSurfacePrimary;
}
