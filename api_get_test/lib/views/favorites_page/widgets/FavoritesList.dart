import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../providers/word_generator_state.dart';
class FavoritesList extends StatelessWidget{
  @override
  Widget build(BuildContext context) {
    var wordState = context.watch<WordGeneratorState>();

    return ListView.builder(
      itemCount: wordState.favorites.length,
      itemBuilder: (context, index) {
        final pair = wordState.favorites[index];
        return Card(
          margin: EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: ListTile(
            leading: Icon(Icons.favorite, color: Colors.red),
            title: Text(
              pair.asLowerCase,
              style: TextStyle(fontSize: 18),
            ),
            trailing: IconButton(
              icon: Icon(Icons.delete_outline),
              onPressed: () {
                wordState.removeFavorite(pair);
              },
            ),
            onTap: () {},
          ),
        );
      },
    );
  }
}