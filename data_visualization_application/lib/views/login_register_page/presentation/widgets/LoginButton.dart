import 'package:flutter/material.dart';

class LoginButton extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: double.infinity, // 占满父容器宽度
      child: FilledButton.tonal(onPressed: () {}, child: Text("点击登录/注册")),
    );
  }
}
