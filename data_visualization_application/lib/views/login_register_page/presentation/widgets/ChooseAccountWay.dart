import 'package:flutter/material.dart';

class ChooseAccountWay extends StatefulWidget {
  @override
  State<ChooseAccountWay> createState() => _ChooseAccountWay();
}

class _ChooseAccountWay extends State<ChooseAccountWay> {
  var isSelectPhone = true;

  @override
  Widget build(BuildContext contex) {
    return Row(
      children: [
        Expanded(
          flex: 1,
          child: Container(
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: isSelectPhone
                      ? Color.fromRGBO(142, 144, 247, 1)
                      : Colors.grey,
                  width: 2,
                ),
              ),
            ),
            child: TextButton(
              onPressed: () {
                setState(() {
                  isSelectPhone = true;
                });
              },
              child: Text(
                "手机号",
                style: TextStyle(
                  color: isSelectPhone
                      ? Color.fromRGBO(143, 141, 252, 1)
                      : Colors.grey,
                ),
              ),
            ),
          ),
        ),
        Expanded(
          flex: 1,
          child: Container(
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(
                  color: isSelectPhone
                      ? Colors.grey
                      : Color.fromRGBO(143, 141, 252, 1),
                  width: 2,
                ),
              ),
            ),
            child: TextButton(
              onPressed: () {
                setState(() {
                  isSelectPhone = false;
                });
              },
              child: Text("邮箱",style: TextStyle(
          
                color: isSelectPhone?Colors.grey:Color.fromRGBO(143, 141, 252, 1)
              ),),
            ),
          ),
        ),
      ],
    );
  }
}
