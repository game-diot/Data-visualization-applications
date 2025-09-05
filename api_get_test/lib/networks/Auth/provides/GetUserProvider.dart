import 'package:api_get_test/networks/Auth/models/GetUserModel.dart';
import 'package:flutter/material.dart';
import '../services/GetUserService.dart';

class GetUserProvider extends ChangeNotifier{
  final GetUserService _service = GetUserService();
  UserDetail? _user;
  UserDetail? get user => _user;

  Future<void> getUser(String? token) async{
    if (token == null) return;
    try {
      _user = await _service.getUser(token);
 
    }catch (e){}finally{notifyListeners();}
  }
}