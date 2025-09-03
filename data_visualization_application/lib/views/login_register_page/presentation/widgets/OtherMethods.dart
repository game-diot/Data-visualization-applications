import 'package:flutter/material.dart';

class OtherMethods extends StatelessWidget{
  @override
  Widget build(BuildContext context){
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
      children: [
        Tooltip(
          message: "使用微信登录",
          child:FloatingActionButton(
            onPressed: (){},
            child:Icon(Icons.add)
            ),
        ),
        Tooltip(
          message:"使用QQ登录",
          child:FloatingActionButton(
            onPressed:(){},
            child:Icon(Icons.abc_outlined)
          )
        ),
        Tooltip(
          message:"使用支付宝登录",
          child:FloatingActionButton(onPressed: (){},child:Icon(Icons.ac_unit))
        ),
      ],
    );
  }

}