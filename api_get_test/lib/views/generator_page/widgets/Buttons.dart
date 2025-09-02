import 'package:flutter/material.dart';
import '../../../providers/word_generator_state.dart';
import 'package:provider/provider.dart';

class Buttons extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    var wordState = context.watch<WordGeneratorState>();
    var pair = wordState.current;

    IconData icon;
    if (wordState.isFavorite(pair)) {
      icon = Icons.favorite;
    } else {
      icon = Icons.favorite_border;
    }
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        ElevatedButton.icon(
          onPressed: () {
            wordState.toggleFavorite();
          },
          icon: Icon(icon),
          label: Text("喜欢"),
        ),
        SizedBox(width: 10),
        ElevatedButton(
          onPressed: () {
            wordState.getNext();
          },
          child: Text("下一个"),
        ),
      ],
    );
  }
}
