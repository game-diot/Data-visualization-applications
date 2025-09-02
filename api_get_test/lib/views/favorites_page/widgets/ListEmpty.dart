import 'package:flutter/material.dart';

class  ListEmpty extends StatelessWidget{
  @override
  Widget build(BuildContext context){
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.favorite_border,
            size: 64,
            color: Theme.of(context).colorScheme.primary,
          ),
          SizedBox(height: 16),
          Text("暂无收藏", style: Theme.of(context).textTheme.headlineSmall),
        ],
      ),
    );
  }
}