import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/word_generator_state.dart';
import 'DeleteButton.dart';
import 'FavoritesList.dart';
class ListNotEmpty extends StatelessWidget{
  @override
  Widget build(BuildContext context){
    var wordState = context.watch<WordGeneratorState>();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.all(20),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "你有${wordState.favorites.length}个收藏：",
                style: Theme.of(context).textTheme.headlineSmall,
              ),
              if (wordState.favorites.isNotEmpty)
                DeleteButton(),
            ],
          ),
        ),
        Expanded(
          child: FavoritesList(),
        ),
      ],
    );
  }
}