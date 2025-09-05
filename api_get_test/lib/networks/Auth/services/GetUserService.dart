import 'package:dio/dio.dart';
import '../models/GetUserModel.dart';

class GetUserService {
  final Dio dio = Dio();

  Future<UserDetail> getUser(String accessToken) async{
    final response = await dio.get(
      "https://dummyjson.com/auth/me",
      options:Options(
        headers:{
          "Authorization":"Bearer $accessToken",
          "Content-Type":"application/json",
        },
      ),
    );
    return UserDetail.fromJson(response.data);
  }
}