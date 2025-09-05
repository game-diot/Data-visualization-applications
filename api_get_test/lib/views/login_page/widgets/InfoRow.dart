import 'package:flutter/material.dart';

class InfoRow extends StatelessWidget{
  final String label;
  final dynamic value;
  const InfoRow({super.key,required this.label,this.value});

  @override
  Widget build(BuildContext context){
return Padding(
  padding:EdgeInsets.symmetric(vertical:4),
  child:Row(
    crossAxisAlignment:CrossAxisAlignment.start,
    children:[
      SizedBox(
        width:80,
        child:Text("$label:",style:Theme.of(context).textTheme.bodyMedium?.copyWith(fontWeight:FontWeight.bold))),
      Expanded(
        child:Text(value?.toString()??'N/A',
        style:Theme.of(context).textTheme.bodyMedium),

      ),
    ]
  )
);
  }
}