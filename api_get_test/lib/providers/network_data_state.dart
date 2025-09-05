import 'package:flutter/material.dart';
//网络数据状态管理
class NetworkDataState extends ChangeNotifier {
  Map<String, dynamic>? _userInfo;
  List<Map<String, dynamic>> _quotes = [];

  Map<String, dynamic>? get userInfo => _userInfo;
  List<Map<String, dynamic>> get quotes => List.unmodifiable(_quotes);

  void setUserInfo(Map<String, dynamic> info) {
    _userInfo = info;
    notifyListeners();
  }

  void setQuotes(List<Map<String, dynamic>> quotes) {
    _quotes = quotes;
    notifyListeners();
  }

  void clearData() {
    _userInfo = null;
    _quotes.clear();
    notifyListeners();
  }
}