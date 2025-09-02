import 'package:flutter/material.dart';
import '../../../providers/word_generator_state.dart';
import 'package:provider/provider.dart';
class DeleteButton extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    var wordState = context.watch<WordGeneratorState>();

    return TextButton(
      onPressed: () {
        showDialog(
          context: context,
          builder: (context) => AlertDialog(
            title: Text("确定删除"),
            content: Text("确定删除所有收藏吗？"),
            actions: [
              TextButton(
                onPressed: () {
                  wordState.clearFavorites();
                  Navigator.pop(context);
                },
                child: Text("删除"),
              ),
            ],
          ),
        );
      },
      child: Text("清空所有"),
    );
  }
}