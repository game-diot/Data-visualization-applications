import 'package:flutter/material.dart';
import 'package:flutter/gestures.dart';
class Note extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return RichText(
      text: TextSpan(
        style: TextStyle(color: Colors.black45, fontSize: 14),
        children: [
          TextSpan(text: "点击“登录/注册”表示您同意"),
          TextSpan(
            text: "服务协议",
            style: TextStyle(
              color: Color.fromRGBO(143, 141, 252, 1),
              decoration: TextDecoration.underline,
            ),
            recognizer: TapGestureRecognizer()
              ..onTap = () {
                print("点击了服务协议");
              },
          ),
          TextSpan(text: "和"),
          TextSpan(
            text: "隐私政策",
            style: TextStyle(
              color: Color.fromRGBO(143, 141, 252, 1),
              decoration: TextDecoration.underline,
            ),
          ),
        ],
      ),
    );
  }
}
