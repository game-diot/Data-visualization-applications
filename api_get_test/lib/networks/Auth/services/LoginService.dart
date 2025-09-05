import 'package:dio/dio.dart';
import '../models/LoginModel.dart';
class Loginservice{
  final dio = Dio();

  Future<User> login(String username,String password) async {

    
      final response = await dio.post(
        "https://dummyjson.com/auth/login",
        data: {
          "username": username,
          "password": password,
          "expiresInMins": 30,
        },
        options: Options(headers: {"Content-Type": "application/json"}),
      );

      return User.fromJson(response.data);

  }

} 