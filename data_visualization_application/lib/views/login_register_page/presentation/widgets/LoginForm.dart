import 'package:data_visualization_application/views/login_register_page/presentation/widgets/PhoneInput.dart';
import 'package:flutter/material.dart';
import 'ChooseAccountWay.dart';
import 'VerificationInput.dart';
import 'Note.dart';
import 'LoginButton.dart';
import 'OtherMethods.dart';

class LoginForm extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.all(16),
      child: Column(
  
        children: [
          SizedBox(height: 30,),
          Expanded(
            child: Text(
              "欢迎使用DataViz",
              style: Theme.of(context).textTheme.headlineSmall,
            ),
          ),

          ChooseAccountWay(),
          SizedBox(height: 20,),
          PhoneInput(),
          SizedBox(height: 20,),
          VerificationInput(),
          SizedBox(height: 20,),
          Note(),
          SizedBox(height: 20,),
          LoginButton(),
          SizedBox(height: 10,),
          TextButton(onPressed: (){}, child: Text("密码登录")),
          SizedBox(height: 20,),
          OtherMethods(),
          SizedBox(height: 10,),
          Text("其他登录方式"),
          SizedBox(height: 20,),
        ],
      ),
    );
  }
}
