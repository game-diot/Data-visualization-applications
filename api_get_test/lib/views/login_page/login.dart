import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'network/models.dart';
import 'widgets/UserInfoCard.dart';

class LoginPage extends StatefulWidget {
  State<LoginPage> createState() => _LoginPage();
}

class _LoginPage extends State<LoginPage> {
  final TextEditingController _usernameController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();
  User? _user;
  bool _isLoading = false;
  String? _resultMessage;

  Future<void> _login() async {
    setState(() {
      _isLoading = true;
      _resultMessage = null;
    });
    try {
      final dio = Dio();

      final response = await dio.post(
        "https://dummyjson.com/auth/login",
        data: {
          "username": _usernameController.text.trim(),
          "password": _passwordController.text.trim(),
          "expiresInMins": 30,
        },
        options: Options(headers: {"Content-Type": "application/json"}),
      );

      setState(() {
        _resultMessage =
            "登录成功！${response.data['firstName']} + ${response.data['lastName']}";
      });
      _user = User.fromJson(response.data);
    } on DioException catch (e) {
      setState(() {
        _resultMessage = "登录失败：${e.response?.data['message'] ?? e.message}";
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _reset() {
    _usernameController.clear();
    _passwordController.clear();
    setState(() {
      _resultMessage = null;
    });
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Container(
            child: Padding(
              padding: EdgeInsets.all(50),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Full Name",
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextField(
                    controller: _usernameController,
                    decoration: InputDecoration(
                      hintText: "Enter your name",
                      border: OutlineInputBorder(),
                    ),
                  ),
                  SizedBox(height: 10),
                  Text(
                    "Password",
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextField(
                    controller: _passwordController,
                    decoration: InputDecoration(
                      hintText: "your Password",
                      border: OutlineInputBorder(),
                    ),
                  ),
                  SizedBox(height: 10),
                  Text(
                    "Message",
                    style: Theme.of(context).textTheme.bodyLarge?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  TextField(
                    minLines: 3,
                    maxLines: 5,
                    decoration: InputDecoration(
                      hintText: "Tell something to me...",
                      border: OutlineInputBorder(),
                      // contentPadding: EdgeInsets.symmetric(horizontal: 16,vertical: 24)
                    ),
                  ),
                  SizedBox(height: 10),

                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                    children: [
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blueGrey,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        onPressed: _isLoading ? null : _login,
                        child: _isLoading
                            ? CircularProgressIndicator()
                            : Text(
                                "Login",
                                style: TextStyle(color: Colors.black),
                              ),
                      ),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.blueGrey,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        onPressed: _reset,
                        child: Text(
                          "Reset",
                          style: TextStyle(color: Colors.black),
                        ),
                      ),
                    ],
                  ),
                     UserInfoCard(user: _user),
                  if (_resultMessage != null) ...[
                    SizedBox(height: 20),
                    Text(
                      _resultMessage!,
                      style: TextStyle(
                        color: _resultMessage!.contains("成功")
                            ? Colors.green
                            : Colors.red,
                      ),
                    ),
                  ],
               
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
