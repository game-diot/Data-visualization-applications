import 'package:flutter/material.dart';

class VerificationInput extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        border: Border.all(color: Colors.grey.shade300),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Expanded(
            flex: 2,
            child: Padding(
              padding: EdgeInsets.all(8),
              child: TextField(decoration: InputDecoration(hintText: "验证码")),
            ),
          ),
          VerticalDivider(
      color: Colors.grey,
      thickness: 1, // 线条宽度
      width: 2,    // 占用的宽度（左右间距）
    ),
          Expanded(
            flex: 1,
            child: TextButton(
              onPressed: () {},
              child: Text(
                "获取验证码",
                style: TextStyle(color: Color.fromRGBO(143, 141, 252, 1)),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
