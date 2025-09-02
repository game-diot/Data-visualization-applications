import 'package:flutter/material.dart';
import 'package:english_words/english_words.dart';

class WordGeneratorState extends ChangeNotifier {
  var _current = WordPair.random();
  var _favorites = <WordPair>[];
  var _history = <WordPair>[];

  WordPair get current => _current;
  List<WordPair> get favorites => List.unmodifiable(_favorites);
  List<WordPair> get history => List.unmodifiable(_history);

  void getNext() {
    _history.add(_current);
    _current = WordPair.random();
    notifyListeners();
  }

  void toggleFavorite([WordPair? pair]) {
    final targetPair = pair ?? _current;
    if (_favorites.contains(targetPair)) {
      _favorites.remove(targetPair);
    } else {
      _favorites.add(targetPair);
    }
    notifyListeners();
  }

  void removeFavorite(WordPair pair) {
    _favorites.remove(pair);
    notifyListeners();
  }

  void clearFavorites() {
    _favorites.clear();
    notifyListeners();
  }

  void clearHistory() {
    _history.clear();
    notifyListeners();
  }

  bool isFavorite(WordPair pair) {
    return _favorites.contains(pair);
  }
}
