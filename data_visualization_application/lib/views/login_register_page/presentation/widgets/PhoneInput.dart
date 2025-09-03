import 'package:flutter/material.dart';

class PhoneInput extends StatefulWidget{
  @override
  State<PhoneInput> createState() => _PhoneInput();
}

class _PhoneInput extends State<PhoneInput>{
  String selectedPrefix = '+86';
  final TextEditingController _controller = TextEditingController();

  @override
  void dispose(){
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context){
    return Container(
      padding:EdgeInsets.symmetric(horizontal:8,vertical:4),
      decoration:BoxDecoration(
        border:Border.all(color:Colors.grey.shade300),
        borderRadius:BorderRadius.circular(8)
      ),
      child:Row(
        children: [
          DropdownButton<String>(
            value:selectedPrefix,
            underline:SizedBox(),
            items:["+86",'+1',"+122"].map((String prefix){
              return DropdownMenuItem(
                value:prefix,child:Text(prefix),);
            }).toList(),

            onChanged:(value){
              if (value != null){
                setState((){
                  selectedPrefix = value;
                });
              }
            }
          ),
          SizedBox(width: 8,),
          Expanded(
            child:TextField(
              controller:_controller,
              decoration:InputDecoration(
                hintText:"请输入手机号",
                border:InputBorder.none,
              ),
              keyboardType:TextInputType.phone,
            )
          ),
          IconButton(
            iconSize:16,
            padding:EdgeInsets.zero,
            icon:Icon(Icons.close,size:16),
            onPressed: (){
              _controller.clear();
            },
          )
        ],
      )
    );
  }
}