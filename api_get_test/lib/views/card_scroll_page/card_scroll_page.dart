import 'package:flutter/material.dart';

class card_scroll_page extends StatelessWidget{
  @override
  Widget build(BuildContext context){
    return  SingleChildScrollView(
      scrollDirection:Axis.horizontal,
      child:Row(
        mainAxisAlignment: MainAxisAlignment.start,
        children:List.generate(10,(index){
          return Card(
            child:Container(
              width:200,
              height:200,
              child:Center(child:Text("Card $index")),
            ),
          );
        }),
      )
    );
//     PageView.builder(
//   controller: PageController(viewportFraction: 0.8), // 控制每页显示比例
//   scrollDirection: Axis.horizontal,
//   itemCount: 5,
//   itemBuilder: (context, index) {
//     return Card(
//       margin: EdgeInsets.all(12),
//       child: Center(child: Text("Page $index")),
//     );
//   },
// )

  }
}