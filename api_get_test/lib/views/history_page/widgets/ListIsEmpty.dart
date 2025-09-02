import 'package:flutter/material.dart';

class ListIsEmpty extends StatelessWidget{
  @override
  Widget build(BuildContext context) {

return    Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.history,
            size: 64,
            color: Theme.of(context).colorScheme.primary,
          ),
          SizedBox(height: 16),
          Text('暂无历史记录', style: Theme.of(context).textTheme.headlineSmall),
          SizedBox(height: 8),
          Text("开始生成一些单词吧！"),
        ],
      ),
    );
  }
}