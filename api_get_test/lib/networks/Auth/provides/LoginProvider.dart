import 'package:flutter/material.dart';
import '../services/LoginService.dart';
import '../models/LoginModel.dart';

class LoginProvider extends ChangeNotifier {
  final Loginservice _service = Loginservice();
  User? _user;
  String? _accessToken;
  String? _refreshToken;
  DateTime? _expiryTime;
  User? get user => _user;
  String? get accessToken => _accessToken;
  String? get refreshToken => _refreshToken;
  Future<void> login(String username, String password) async {
    try {
      _user = await _service.login(username, password);
    } catch (e) {
    } finally {
      notifyListeners();
    }
  }
  void logout(){
    _user = null;
    notifyListeners();
  }
}
