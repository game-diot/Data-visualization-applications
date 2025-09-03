import 'package:data_visualization_application/views/login_register_page/presentation/widgets/LoginForm.dart';
import 'package:flutter/material.dart';

class LoginPage extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          Container(
            width:double.infinity,
            height:double.infinity,
            decoration:BoxDecoration(
              image:DecorationImage(
              image:AssetImage("assets/images/login.png"),
              fit:BoxFit.cover,
              alignment:Alignment(0.8,0)
              )
            )
          ),
          Positioned(
            top: 10,
            right: 10,
            child: Padding(
              padding:EdgeInsets.all(16),
      
              child: Container(
                width: 400,
                height: 570,
                color: Colors.white,
                child: LoginForm(),
              ),
            )
          ),

        ],
      ),
    );
  }
}
