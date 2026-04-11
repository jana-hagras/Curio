import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import 'storage_keys.dart';
import 'seed_data.dart';

/// Centralized SharedPreferences wrapper for all local data operations.
class LocalStorageService {
  static late SharedPreferences _prefs;

  /// Initialize SharedPreferences and seed demo data on first run.
  static Future<void> init() async {
    _prefs = await SharedPreferences.getInstance();
    final seeded = _prefs.getBool(StorageKeys.seeded) ?? false;
    if (!seeded) {
      await _seedData();
      await _prefs.setBool(StorageKeys.seeded, true);
    }
  }

  static Future<void> _seedData() async {
    await saveList(StorageKeys.users, SeedData.users);
    await saveList(StorageKeys.marketItems, SeedData.marketItems);
    await saveList(StorageKeys.orders, SeedData.orders);
    await saveList(StorageKeys.chatMessages, SeedData.chatMessages);
    await saveList(StorageKeys.notifications, SeedData.notifications);
    await saveList(StorageKeys.customOrders, SeedData.customOrders);
    await saveList(StorageKeys.cartItems, []);
  }

  // ─── Generic CRUD ──────────────────────────────────────────────

  /// Save a list of maps to SharedPreferences.
  static Future<void> saveList(String key, List<Map<String, dynamic>> list) async {
    final jsonStr = jsonEncode(list);
    await _prefs.setString(key, jsonStr);
  }

  /// Load a list of maps from SharedPreferences.
  static List<Map<String, dynamic>> loadList(String key) {
    final jsonStr = _prefs.getString(key);
    if (jsonStr == null || jsonStr.isEmpty) return [];
    final List<dynamic> decoded = jsonDecode(jsonStr);
    return decoded.cast<Map<String, dynamic>>();
  }

  /// Save a single string value.
  static Future<void> saveString(String key, String value) async {
    await _prefs.setString(key, value);
  }

  /// Load a single string value.
  static String? loadString(String key) {
    return _prefs.getString(key);
  }

  /// Save an integer value.
  static Future<void> saveInt(String key, int value) async {
    await _prefs.setInt(key, value);
  }

  /// Load an integer value.
  static int? loadInt(String key) {
    return _prefs.getInt(key);
  }

  /// Save a bool value.
  static Future<void> saveBool(String key, bool value) async {
    await _prefs.setBool(key, value);
  }

  /// Load a bool value.
  static bool loadBool(String key) {
    return _prefs.getBool(key) ?? false;
  }

  /// Save a string list.
  static Future<void> saveStringList(String key, List<String> list) async {
    await _prefs.setStringList(key, list);
  }

  /// Load a string list.
  static List<String> loadStringList(String key) {
    return _prefs.getStringList(key) ?? [];
  }

  /// Remove a key.
  static Future<void> remove(String key) async {
    await _prefs.remove(key);
  }

  /// Clear all data (for logout/reset).
  static Future<void> clearSession() async {
    await _prefs.remove(StorageKeys.currentUserId);
  }

  /// Full reset — re-seeds everything.
  static Future<void> resetAll() async {
    await _prefs.clear();
    await _seedData();
    await _prefs.setBool(StorageKeys.seeded, true);
  }

  // ─── Convenience: Next ID generator ────────────────────────────

  /// Get the next available ID for a given list key.
  static int getNextId(String key) {
    final list = loadList(key);
    if (list.isEmpty) return 1;
    final ids = list.map((item) {
      final id = item['id'];
      if (id is int) return id;
      if (id is String) return int.tryParse(id) ?? 0;
      return 0;
    }).toList();
    return (ids.reduce((a, b) => a > b ? a : b)) + 1;
  }
}
